import { supabase } from "./supabaseClient"

// Full department roster for the Employees table.
// Assumes profiles has an "employment_status" column with values:
// "active" | "inactive" | "on_leave" — adjust the values below if yours differ.
export async function getDepartmentEmployees(department) {
  const { data, error } = await supabase
    .from("profiles")
    .select("employee_id, full_name, position, department, employment_status")
    .eq("department", department)
    .order("full_name", { ascending: true })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", employees: data }
}

// Full record for the Profile drill-down popup (read-only).
export async function getEmployeeProfile(employeeId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("employee_id", employeeId)
    .maybeSingle()

  if (error) return { status: "error", message: error.message }
  if (!data) return { status: "not_found" }
  return { status: "ok", employee: data }
}

function mondayOf(date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

// Full Monday–Sunday week for the Attendance drill-down popup.
// weekStart: a Date (or ISO string) anywhere inside the week you want.
export async function getEmployeeAttendanceWeek(employeeId, weekStart) {
  const monday = mondayOf(weekStart || new Date())
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", toISODate(monday))
    .lte("date", toISODate(sunday))

  if (error) return { status: "error", message: error.message }

  const byDate = Object.fromEntries((data || []).map((r) => [r.date, r.status]))

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    const iso = toISODate(d)
    return { date: iso, label: d.toLocaleDateString("default", { weekday: "short" }), status: byDate[iso] || null }
  })

  const counts = {
    present: days.filter((d) => d.status === "present").length,
    late: days.filter((d) => d.status === "late").length,
    absent: days.filter((d) => d.status === "absent").length,
  }

  return { status: "ok", weekStart: toISODate(monday), weekEnd: toISODate(sunday), days, counts }
}