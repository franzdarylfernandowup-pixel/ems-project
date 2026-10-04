import { supabase } from "./supabaseClient"

export async function getAnnouncements() {
  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return { status: "error", message: error.message }
  if (!announcements || announcements.length === 0) {
    return { status: "ok", announcements: [] }
  }

  const posterIds = [...new Set(announcements.map((a) => a.posted_by).filter(Boolean))]

  const { data: profiles, error: profilesError } = await supabase
    .from("public_profiles")
    .select("employee_id, full_name, role")
    .in("employee_id", posterIds)

  if (profilesError) return { status: "error", message: profilesError.message }

  const profileById = Object.fromEntries((profiles || []).map((p) => [p.employee_id, p]))

  const merged = announcements.map((a) => ({
    ...a,
    profiles: profileById[a.posted_by] || null,
  }))

  return { status: "ok", announcements: merged }
}

export async function createAnnouncement({ postedBy, title, body, department }) {
  const { error } = await supabase.from("announcements").insert({
    posted_by: postedBy,
    title,
    body,
    department: department || null,
  })
  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}