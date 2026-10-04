import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getDepartmentLeaveRequests, updateLeaveStatus, getLeaveAttachmentUrl } from "../lib/leaveApi"
import Sidebar from "./Sidebar"

const MANAGER_MENU = [
  { label: "Dashboard", path: "/manager/dashboard" },
  { label: "Profile", path: "/manager/profile" },
  { label: "Attendance", path: "/manager/attendance" },
  { label: "Tasks", path: "/manager/tasks" },
  { label: "Announcements", path: "/manager/announcements" },
  { label: "Leave", path: "/manager/leave" },
  { label: "Employees", path: "/manager/employees" },
]

export default function ManagerLeaveRequests() {
  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [decliningId, setDecliningId] = useState(null)
  const [declineReason, setDeclineReason] = useState("")

  async function loadRequests(department) {
    const result = await getDepartmentLeaveRequests(department)
    if (result.status === "ok") setRequests(result.requests)
  }

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      if (u) await loadRequests(u.department)
      setLoading(false)
    })
  }, [])

  async function handleApprove(id) {
    await updateLeaveStatus(id, "approved")
    loadRequests(user.department)
  }

  async function handleDeclineConfirm(id) {
    await updateLeaveStatus(id, "rejected")
    setDecliningId(null)
    setDeclineReason("")
    loadRequests(user.department)
  }

  async function handleOpenAttachment(filePath) {
    const url = await getLeaveAttachmentUrl(filePath)
    if (url) window.open(url, "_blank")
  }

  const counts = {
    total: requests.length,
    approved: requests.filter((r) => r.status === "approved").length,
    declined: requests.filter((r) => r.status === "rejected").length,
  }

  return (
  <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={MANAGER_MENU} activePath="/manager/leave" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Leave</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Leave Requests</h1>
        <p className="text-xs text-neutral-400">Approve or decline leave requests</p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-100 text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Leave Type</th>
                  <th className="px-4 py-3 font-medium">Start Date</th>
                  <th className="px-4 py-3 font-medium">End Date</th>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="px-4 py-4 text-neutral-400">Loading...</td></tr>
                )}
                {!loading && requests.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-4 text-neutral-400">No leave requests yet.</td></tr>
                )}
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-50">
                    <td className="px-4 py-3">{r.profiles.full_name}</td>
                    <td className="px-4 py-3">{r.leave_type}</td>
                    <td className="px-4 py-3">{r.start_date}</td>
                    <td className="px-4 py-3">{r.end_date}</td>
                    <td className="px-4 py-3">
                      {r.attachment_name ? (
                        <button
                          onClick={() => handleOpenAttachment(r.attachment_path)}
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {r.attachment_name}
                        </button>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="rounded-md bg-green-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDecliningId(r.id)}
                            className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <StatCard label="Total Requests" value={counts.total} />
            <StatCard label="Approved" value={counts.approved} />
            <StatCard label="Declined" value={counts.declined} />
          </div>
        </div>

        {decliningId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30">
            <div className="w-80 rounded-xl bg-white p-5 shadow-lg">
              <p className="text-sm font-semibold">Reason for Declining</p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter a reason why..."
                rows={4}
                className="mt-2 w-full rounded-md border border-neutral-200 px-3 py-2 text-xs outline-none"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => { setDecliningId(null); setDeclineReason("") }}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeclineConfirm(decliningId)}
                  className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
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
  const labels = { pending: "Pending", approved: "Approved", rejected: "Declined" }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] ${styles[status] || "bg-neutral-100 text-neutral-500"}`}>
      {labels[status] || status}
    </span>
  )
}