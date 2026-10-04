import { supabase } from "./supabaseClient"

export async function getEmployeeDashboardData(employeeId) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().slice(0, 10)

  const [{ data: attendance }, { data: tasks }, { data: leave }, { data: announcement }] =
    await Promise.all([
      supabase.from("attendance").select("*").eq("employee_id", employeeId).gte("date", monthStart),
      supabase.from("tasks").select("*").eq("employee_id", employeeId),
      supabase.from("leave_requests").select("*").eq("employee_id", employeeId)
        .order("created_at", { ascending: false }).limit(1),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(1),
    ])

  let latestAnnouncement = announcement?.[0] || null

  // Attach the poster's name/role the same way the Announcements page does
  if (latestAnnouncement?.posted_by) {
    const { data: poster } = await supabase
      .from("public_profiles")
      .select("full_name, role")
      .eq("employee_id", latestAnnouncement.posted_by)
      .maybeSingle()
    latestAnnouncement = { ...latestAnnouncement, profiles: poster || null }
  }

  return {
    presentDays: attendance?.filter((a) => a.status === "present").length || 0,
    pendingTasks: tasks?.filter((t) => t.status !== "done").length || 0,
    tasks: tasks || [],
    latestLeave: leave?.[0] || null,
    latestAnnouncement,
  }
}

export async function getManagerDashboardData(department) {
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: employees }, { data: tasks }, { data: pendingLeave }, { data: attendanceToday }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("department", department),
      supabase.from("tasks").select("*, profiles!inner(department)").eq("profiles.department", department),
      supabase.from("leave_requests")
        .select("*, profiles!inner(department, full_name)")
        .eq("profiles.department", department).eq("status", "pending"),
      supabase.from("attendance")
        .select("*, profiles!inner(department)")
        .eq("profiles.department", department).eq("date", today),
    ])

  return {
    totalEmployees: employees?.length || 0,
    activeTasks: tasks?.filter((t) => t.status !== "done").length || 0,
    pendingLeave: pendingLeave || [],
    presentToday: attendanceToday?.filter((a) => a.status === "present").length || 0,
  }
}