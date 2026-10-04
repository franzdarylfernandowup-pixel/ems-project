import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getAnnouncements, createAnnouncement } from "../lib/announcementsApi"
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

const ROLE_LABEL = {
  employee: "Employee",
  department_manager: "Department Manager",
}

export default function ManagerAnnouncements() {
  const [user, setUser] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", body: "", audience: "department" })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  async function load() {
    const result = await getAnnouncements()
    if (result.status === "ok") setAnnouncements(result.announcements)
    setLoading(false)
  }

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      await load()
    })
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    setMessage(null)

    if (!form.title.trim() || !form.body.trim()) {
      setMessage({ error: true, text: "Title and message are required." })
      return
    }

    setSubmitting(true)
    const result = await createAnnouncement({
      postedBy: user.id,
      title: form.title,
      body: form.body,
      department: form.audience === "department" ? user.department : null,
    })
    setSubmitting(false)

    if (result.status === "error") {
      setMessage({ error: true, text: result.message })
      return
    }

    setMessage({ error: false, text: "Announcement posted!" })
    setForm({ title: "", body: "", audience: "department" })
    load()
  }

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={MANAGER_MENU} activePath="/manager/announcements" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Announcements</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Announcements</h1>
        <p className="text-xs text-neutral-400">Post updates to your department or the whole company</p>

        <div className="mt-6 max-w-xl rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Create Announcement</p>
          <form onSubmit={handlePost} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            />
            <textarea
              placeholder="Message"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            />
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            >
              <option value="department">Just my department ({user?.department})</option>
              <option value="company">Company-wide</option>
            </select>

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
              {submitting ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-xs text-neutral-400">Loading...</p>}
          {!loading && announcements.length === 0 && (
            <p className="text-xs text-neutral-400">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-xs text-neutral-500">{a.body}</p>
              <p className="mt-2 text-[10px] text-neutral-400">
                Posted by {a.profiles?.full_name || "Unknown"}
                {a.profiles?.role ? ` · ${ROLE_LABEL[a.profiles.role] || a.profiles.role}` : ""}
                {" · "}
                {new Date(a.created_at).toLocaleDateString("default", {
                  year: "numeric", month: "long", day: "numeric",
                })}
                {a.department ? ` · ${a.department}` : " · Company-wide"}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}