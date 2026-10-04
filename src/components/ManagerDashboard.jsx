import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getManagerDashboardData } from "../lib/dashboardApi"
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

export default function ManagerDashboard() {
  const [user, setUser] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u) getManagerDashboardData(u.department).then(setData)
    })
  }, [])

  const firstName = user?.fullName?.split(" ")[0] || ""

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={MANAGER_MENU} activePath="/manager/dashboard" />

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
        <p className="mt-1 text-xs text-neutral-400">
          Manage your department, employees, and daily operations in one place
        </p>

        {!data ? (
          <p className="mt-6 text-sm text-neutral-400">Loading...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total Employees" value={data.totalEmployees} hint="Department members" />
              <StatCard label="Active Tasks" value={data.activeTasks} hint="Ongoing and assigned" />
              <StatCard label="Pending Leave" value={data.pendingLeave.length} hint="For approval" />
              <StatCard label="Present Today" value={data.presentToday} hint="Currently at work" />
            </div>

            <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-neutral-400">Leave Requests</p>
              <div className="mt-3 space-y-3">
                {data.pendingLeave.length === 0 && (
                  <p className="text-[11px] text-neutral-400">No pending requests</p>
                )}
                {data.pendingLeave.map((req) => (
                  <div key={req.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{req.profiles.full_name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {req.leave_type} · {req.start_date}
                      </p>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
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
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
      <p className="text-[10px] text-neutral-400">{hint}</p>
    </div>
  )
}