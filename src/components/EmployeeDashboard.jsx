import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getEmployeeDashboardData } from "../lib/dashboardApi"
import Sidebar from "./Sidebar"
import Calendar from "./Calendar"

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
]

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u) getEmployeeDashboardData(u.id).then(setData)
    })
  }, [])

  const firstName = user?.fullName?.split(" ")[0] || ""

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={EMPLOYEE_MENU} activePath="/employee/dashboard" />

      <main className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-neutral-400">Dashboard</p>
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none"
          />
        </div>

        <h1 className="text-2xl font-semibold text-neutral-900">Welcome Back, {firstName}</h1>
        <p className="mt-1 text-xs text-neutral-400">Your work, your team, all in one place</p>

        {!data ? (
          <p className="mt-6 text-sm text-neutral-400">Loading...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Present Days" value={`${data.presentDays} Days`} hint="This month" />
              <StatCard label="Pending Tasks" value={data.pendingTasks} hint="Current tasks" />
              <StatCard
                label="Leave Request"
                value={data.latestLeave ? data.latestLeave.status : "None"}
                hint={data.latestLeave ? data.latestLeave.leave_type : "No requests yet"}
              />
              <StatCard label="Total Tasks" value={data.tasks.length} hint="Assigned to you" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-neutral-400">Company Announcement</p>
                {data.latestAnnouncement ? (
                  <>
                    <p className="mt-3 text-sm font-semibold">{data.latestAnnouncement.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">{data.latestAnnouncement.body}</p>
                    <p className="mt-2 text-[10px] text-neutral-400">
                      Posted by {data.latestAnnouncement.profiles?.full_name || "Unknown"}
                      {data.latestAnnouncement.profiles?.role === "department_manager" ? " · Department Manager" : ""}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400">No announcements yet.</p>
                )}
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-neutral-400">Schedule</p>
                <div className="mt-2">
                  <Calendar />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <MiniCard title="Leave Request">
                {data.latestLeave ? (
                  <>
                    <p className="text-sm font-medium">{data.latestLeave.leave_type}</p>
                    <p className="text-[11px] text-neutral-400">
                      {data.latestLeave.start_date} to {data.latestLeave.end_date} · {data.latestLeave.status}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-neutral-400">No leave requests</p>
                )}
              </MiniCard>
              <MiniCard title="Tasks">
                {data.tasks.length === 0 && (
                  <p className="text-[11px] text-neutral-400">No tasks assigned</p>
                )}
                {data.tasks.map((t) => (
                  <p key={t.id} className="text-[11px] text-neutral-500">
                    {t.title} — <span className="italic">{t.status}</span>
                  </p>
                ))}
              </MiniCard>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold capitalize text-neutral-900">{value}</p>
      <p className="text-[10px] text-neutral-400">{hint}</p>
    </div>
  )
}

function MiniCard({ title, children }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-neutral-400">{title}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  )
}