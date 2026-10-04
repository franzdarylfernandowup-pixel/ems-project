import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { getDepartmentAttendance } from "../lib/attendanceApi"
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

export default function ManagerAttendance() {
  const [user, setUser] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const today = new Date().toISOString().slice(0, 10)

  async function loadAttendance(currentUser) {
    if (!currentUser?.department) {
      setMessage("Department information is not available.")
      setLoading(false)
      return
    }

    setLoading(true)
    setMessage("")

    const result = await getDepartmentAttendance(
      currentUser.department,
      today
    )

    if (result.status === "error") {
      setMessage(result.message)
      setRecords([])
    } else {
      setRecords(result.records || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      await loadAttendance(u)
    })
  }, [])

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar
        user={user}
        items={MANAGER_MENU}
        activePath="/manager/attendance"
      />

      <main className="p-8">
        <p className="text-xs text-neutral-400">
          Dashboard &gt; Attendance
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          Attendance
        </h1>

        <p className="text-xs text-neutral-400">
          View today's attendance for your department
        </p>

        <div className="mt-6 rounded-xl bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Department Attendance
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {user?.department || "Department"} · {today}
                </p>
              </div>

              <button
                onClick={() => loadAttendance(user)}
                className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="p-5">
            {loading && (
              <p className="text-xs text-neutral-400">
                Loading attendance...
              </p>
            )}

            {!loading && message && (
              <p className="text-xs text-red-600">
                {message}
              </p>
            )}

            {!loading && !message && records.length === 0 && (
              <p className="text-xs text-neutral-400">
                No attendance records found for today.
              </p>
            )}

            {!loading && !message && records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="px-3 py-3 text-xs font-semibold text-neutral-500">
                        Employee
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold text-neutral-500">
                        Date
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold text-neutral-500">
                        Time In
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold text-neutral-500">
                        Time Out
                      </th>

                      <th className="px-3 py-3 text-xs font-semibold text-neutral-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-neutral-100 last:border-0"
                      >
                        <td className="px-3 py-3 text-sm text-neutral-900">
                          {record.profiles?.full_name || "Unknown"}
                        </td>

                        <td className="px-3 py-3 text-xs text-neutral-500">
                          {record.date || "-"}
                        </td>

                        <td className="px-3 py-3 text-xs text-neutral-500">
                          {record.time_in || "-"}
                        </td>

                        <td className="px-3 py-3 text-xs text-neutral-500">
                          {record.time_out || "-"}
                        </td>

                        <td className="px-3 py-3">
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-700">
                            {record.status || "Present"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}