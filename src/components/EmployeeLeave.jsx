import { useEffect, useState, useRef } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getMyLeaveRequests, submitLeaveRequest } from "../lib/leaveApi"
import Sidebar from "./Sidebar"

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
]

export default function EmployeeLeave() {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" })
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  async function loadRequests(employeeId) {
    const result = await getMyLeaveRequests(employeeId)
    if (result.status === "ok") setRequests(result.requests)
  }

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      if (u) await loadRequests(u.id)
      setLoading(false)
    })
  }, [])

  const days =
    form.startDate && form.endDate
      ? Math.max(
          1,
          Math.round((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
        )
      : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    if (!form.leaveType || !form.startDate || !form.endDate) {
      setMessage({ error: true, text: "Leave type, start date, and end date are required." })
      return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setMessage({ error: true, text: "End date can't be before the start date." })
      return
    }

    setSubmitting(true)
    const result = await submitLeaveRequest(user.id, { ...form, file })
    setSubmitting(false)

    if (result.status === "error") {
      setMessage({ error: true, text: result.message })
      return
    }

    setMessage({ error: false, text: "Leave request submitted!" })
    setForm({ leaveType: "", startDate: "", endDate: "", reason: "" })
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    loadRequests(user.id)
  }

  const counts = {
    reviewing: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    declined: requests.filter((r) => r.status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={EMPLOYEE_MENU} activePath="/employee/leave" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Leave</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Leave</h1>
        <p className="text-xs text-neutral-400">Your work, your team, your flow, all in one place</p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
            <p className="text-sm font-semibold">Create Leave Request</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-neutral-500">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select Leave Type</option>
                  <option>Sick Leave</option>
                  <option>Personal Leave</option>
                  <option>Annual Leave</option>
                  <option>Family Emergency</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500">Number of Days</label>
                  <input
                    type="text"
                    readOnly
                    value={days || ""}
                    className="mt-1 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500">Reason</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Enter reason for leave request"
                    rows={4}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500">File Attachment</label>
                  <label className="mt-1 flex h-[106px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 text-center text-[11px] text-neutral-400 hover:bg-neutral-50">
                    {file ? file.name : "Upload your medical letter"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {message && (
                <p className={`text-xs ${message.error ? "text-red-600" : "text-green-600"}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <StatCard label="Reviewing" value={counts.reviewing} />
            <StatCard label="Approved" value={counts.approved} />
            <StatCard label="Declined" value={counts.declined} />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Recent Leave Requests</p>
          <div className="mt-3 space-y-2">
            {loading && <p className="text-xs text-neutral-400">Loading...</p>}
            {!loading && requests.length === 0 && (
              <p className="text-xs text-neutral-400">No leave requests yet.</p>
            )}
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-neutral-100 py-2 text-xs">
                <span className="font-medium">{r.leave_type}</span>
                <span className="text-neutral-400">{r.start_date} to {r.end_date}</span>
                {r.attachment_name && (
                  <span className="text-neutral-400">📎 {r.attachment_name}</span>
                )}
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  }
  const labels = { pending: "Reviewing", approved: "Approved", rejected: "Declined" }
  return (
    <span className={`rounded-full px-2 py-0.5 ${styles[status] || "bg-neutral-100 text-neutral-500"}`}>
      {labels[status] || status}
    </span>
  )
}