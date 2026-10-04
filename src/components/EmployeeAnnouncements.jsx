import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getAnnouncements } from "../lib/announcementsApi"
import Sidebar from "./Sidebar"

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
]

const ROLE_LABEL = {
  employee: "Employee",
  department_manager: "Department Manager",
}

export default function EmployeeAnnouncements() {
  const [user, setUser] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      const result = await getAnnouncements()
      if (result.status === "ok") setAnnouncements(result.announcements)
      setLoading(false)
    })
  }, [])

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={EMPLOYEE_MENU} activePath="/employee/announcements" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Announcements</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Announcements</h1>
        <p className="text-xs text-neutral-400">Stay up to date with the latest company announcements</p>

        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full max-w-md rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none"
        />

        <div className="mt-6 space-y-3">
          {loading && <p className="text-xs text-neutral-400">Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-xs text-neutral-400">No announcements found.</p>
          )}
          {filtered.map((a) => (
            <div key={a.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-xl">📢</span>
                <div>
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
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}