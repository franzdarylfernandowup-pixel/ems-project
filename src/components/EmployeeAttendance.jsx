import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getMyAttendance } from "../lib/attendanceApi"
import Sidebar from "./Sidebar"

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
]

export default function EmployeeAttendance() {
  const [user, setUser] = useState(null)
  const [viewDate, setViewDate] = useState(new Date())
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  async function loadAttendance(employeeId) {
    setLoading(true)
    const result = await getMyAttendance(employeeId, year, month)
    if (result.status === "ok") setRecords(result.records)
    setLoading(false)
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u) loadAttendance(u.id)
    })
  }, [])

  useEffect(() => {
    if (user) loadAttendance(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const byDate = Object.fromEntries(records.map((r) => [r.date, r.status]))
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const counts = {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    leave: records.filter((r) => r.status === "leave").length,
  }

  const dayColor = (day) => {
    if (!day) return ""
    const dateStr = new Date(year, month, day).toISOString().slice(0, 10)
    const status = byDate[dateStr]
    if (status === "present") return "bg-green-100 text-green-700"
    if (status === "absent") return "bg-red-100 text-red-700"
    if (status === "leave") return "bg-yellow-100 text-yellow-700"
    return "text-neutral-600"
  }

  return (
   <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={EMPLOYEE_MENU} activePath="/employee/attendance" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Attendance</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Attendance Record</h1>
        <p className="text-xs text-neutral-400">Your work, your team, your flow, all in one place</p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_200px]">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Attendance Summary</p>
              <div className="flex gap-2 text-[10px]">
                <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">{counts.present} Days</span>
                <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">{counts.absent} Days</span>
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">{counts.leave} Days</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="px-2 text-neutral-400 hover:text-neutral-900"
              >
                ‹
              </button>
              <p className="text-sm font-semibold">
                {viewDate.toLocaleString("default", { month: "long" })} {year}
              </p>
              <button
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="px-2 text-neutral-400 hover:text-neutral-900"
              >
                ›
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="text-neutral-400">{d}</span>
              ))}
              {cells.map((day, i) => (
                <span key={i} className={`rounded-md py-1 ${dayColor(day)}`}>
                  {day || ""}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold text-neutral-500">Recent Attendance Logs</p>
              <table className="mt-2 w-full text-left text-[11px]">
                <thead className="text-neutral-400">
                  <tr>
                    <th className="py-1 font-medium">Date</th>
                    <th className="py-1 font-medium">Day</th>
                    <th className="py-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={3} className="py-2 text-neutral-400">Loading...</td></tr>
                  )}
                  {!loading && records.length === 0 && (
                    <tr><td colSpan={3} className="py-2 text-neutral-400">No records this month.</td></tr>
                  )}
                  {records.map((r) => (
                    <tr key={r.id} className="border-t border-neutral-50">
                      <td className="py-1.5">{r.date}</td>
                      <td className="py-1.5">
                        {new Date(r.date).toLocaleDateString("default", { weekday: "long" })}
                      </td>
                      <td className="py-1.5 capitalize">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-neutral-400">Working Days</p>
            <p className="mt-1 text-xl font-semibold">{counts.present} Days</p>
            <p className="text-[10px] text-neutral-400">This month</p>
          </div>
        </div>
      </main>
    </div>
  )
}