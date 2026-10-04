import { useEffect, useMemo, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import {
  getDepartmentEmployees,
  getEmployeeProfile,
  getEmployeeAttendanceWeek,
} from "../lib/employeesApi"
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

const PAGE_SIZE = 8

const STATUS_LABEL = { active: "Active", inactive: "Inactive", on_leave: "On Leave" }
const STATUS_STYLE = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
  on_leave: "bg-yellow-100 text-yellow-700",
}

export default function ManagerEmployees() {
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [positionFilter, setPositionFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const [openMenuId, setOpenMenuId] = useState(null)
  const [profileEmployeeId, setProfileEmployeeId] = useState(null)
  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState(null)

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u)
      if (u) {
        const result = await getDepartmentEmployees(u.department)
        if (result.status === "ok") setEmployees(result.employees)
      }
      setLoading(false)
    })
  }, [])

  const positions = useMemo(
    () => [...new Set(employees.map((e) => e.position).filter(Boolean))].sort(),
    [employees]
  )

  const counts = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((e) => e.employment_status === "active").length,
      onLeave: employees.filter((e) => e.employment_status === "on_leave").length,
      inactive: employees.filter((e) => e.employment_status === "inactive").length,
    }),
    [employees]
  )

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch = e.full_name.toLowerCase().includes(search.toLowerCase())
      const matchesPosition = !positionFilter || e.position === positionFilter
      const matchesStatus = !statusFilter || e.employment_status === statusFilter
      return matchesSearch && matchesPosition && matchesStatus
    })
  }, [employees, search, positionFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={MANAGER_MENU} activePath="/manager/employees" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Employees</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Employees</h1>
        <p className="text-xs text-neutral-400">View and manage employees in your department</p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Employees" value={counts.total} />
          <StatCard label="Active" value={counts.active} />
          <StatCard label="On Leave" value={counts.onLeave} />
          <StatCard label="Inactive" value={counts.inactive} />
        </div>

        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full max-w-xs rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            />
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            >
              <option value="">All Positions</option>
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            >
              <option value="">Employment Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <table className="mt-4 w-full text-left text-xs">
            <thead className="border-b border-neutral-100 text-neutral-400">
              <tr>
                <th className="py-2 pr-4 font-medium">Employee ID</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Position</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="py-4 text-neutral-400">Loading...</td></tr>
              )}
              {!loading && pageRows.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-neutral-400">No employees match these filters.</td></tr>
              )}
              {pageRows.map((e) => (
                <tr key={e.employee_id} className="border-b border-neutral-50">
                  <td className="py-3 pr-4">{e.employee_id}</td>
                  <td className="py-3 pr-4">{e.full_name}</td>
                  <td className="py-3 pr-4">{e.position || "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_STYLE[e.employment_status] || "bg-neutral-100 text-neutral-500"}`}>
                      {STATUS_LABEL[e.employment_status] || e.employment_status || "—"}
                    </span>
                  </td>
                  <td className="relative py-3 pr-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === e.employee_id ? null : e.employee_id)}
                      className="rounded-md border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Actions ▾
                    </button>
                    {openMenuId === e.employee_id && (
                      <div className="absolute z-10 mt-1 w-32 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                        <button
                          onClick={() => {
                            setProfileEmployeeId(e.employee_id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full px-3 py-1.5 text-left text-[11px] hover:bg-neutral-50"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setAttendanceEmployeeId(e.employee_id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full px-3 py-1.5 text-left text-[11px] hover:bg-neutral-50"
                        >
                          Attendance
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-1 text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-neutral-200 px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-md px-2.5 py-1 ${n === page ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-neutral-200 px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </main>

      {profileEmployeeId && (
        <ProfilePopup employeeId={profileEmployeeId} onClose={() => setProfileEmployeeId(null)} />
      )}
      {attendanceEmployeeId && (
        <AttendancePopup employeeId={attendanceEmployeeId} onClose={() => setAttendanceEmployeeId(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

// Shared popup shell: closes on the X, a click on the backdrop, or Esc.
function Popup({ title, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{title}</p>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function ProfilePopup({ employeeId, onClose }) {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEmployeeProfile(employeeId).then((result) => {
      if (result.status === "ok") setEmployee(result.employee)
      setLoading(false)
    })
  }, [employeeId])

  return (
    <Popup title="Employee Profile" onClose={onClose}>
      {loading && <p className="text-xs text-neutral-400">Loading...</p>}
      {!loading && !employee && <p className="text-xs text-neutral-400">Employee not found.</p>}
      {!loading && employee && (
        <div className="space-y-2 text-xs">
          <Row label="Full Name" value={employee.full_name} />
          <Row label="Employee ID" value={employee.employee_id} />
          <Row label="Email" value={employee.email} />
          <Row label="Contact Number" value={employee.contact_number} />
          <Row label="Address" value={employee.address} />
          <Row label="Department" value={employee.department} />
          <Row label="Position" value={employee.position} />
          <Row label="Birthdate" value={employee.birthdate} />
          <Row label="Gender" value={employee.gender} />
        </div>
      )}
    </Popup>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-50 py-1.5">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-800">{value || "—"}</span>
    </div>
  )
}

function AttendancePopup({ employeeId, onClose }) {
  const [weekStart, setWeekStart] = useState(new Date())
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEmployeeAttendanceWeek(employeeId, weekStart).then((result) => {
      if (result.status === "ok") setWeekData(result)
      setLoading(false)
    })
  }, [employeeId, weekStart])

  function shiftWeek(delta) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + delta * 7)
    setWeekStart(d)
  }

  const statusIcon = { present: "✓", late: "◷", absent: "✕" }
  const statusStyle = {
    present: "bg-green-100 text-green-700",
    late: "bg-yellow-100 text-yellow-700",
    absent: "bg-red-100 text-red-700",
  }

  return (
    <Popup title="Employee Attendance" onClose={onClose}>
      <div className="flex items-center justify-between text-xs">
        <button onClick={() => shiftWeek(-1)} className="text-neutral-400 hover:text-neutral-900">‹ Prev week</button>
        {weekData && (
          <span className="font-medium text-neutral-700">{weekData.weekStart} – {weekData.weekEnd}</span>
        )}
        <button onClick={() => shiftWeek(1)} className="text-neutral-400 hover:text-neutral-900">Next week ›</button>
      </div>

      {loading && <p className="mt-4 text-xs text-neutral-400">Loading...</p>}

      {!loading && weekData && (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px]">
            {weekData.days.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-1">
                <span className="text-neutral-400">{d.label}</span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${statusStyle[d.status] || "bg-neutral-100 text-neutral-300"}`}
                >
                  {statusIcon[d.status] || "–"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2 text-[10px]">
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">{weekData.counts.present} Present</span>
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">{weekData.counts.late} Late</span>
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">{weekData.counts.absent} Absent</span>
          </div>
        </>
      )}
    </Popup>
  )
}