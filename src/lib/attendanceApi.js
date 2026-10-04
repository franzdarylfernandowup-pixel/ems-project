import { supabase } from "./supabaseClient"

export async function getMyAttendance(employeeId, year, month) {
  const start = new Date(year, month, 1).toISOString().slice(0, 10)
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", records: data }
}

export async function getDepartmentAttendance(department, date) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, profiles!inner(full_name, department)")
    .eq("profiles.department", department)
    .eq("date", date)

  if (error) return { status: "error", message: error.message }
  return { status: "ok", records: data }
}