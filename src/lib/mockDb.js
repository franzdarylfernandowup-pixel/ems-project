import { supabase } from "./supabaseClient"

export function dashboardPath(role) {
  return role === "department_manager" ? "/manager/dashboard" : "/employee/dashboard"
}

function publicProfile(profile) {
  return {
    id: profile.employee_id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    position: profile.position,
    department: profile.department,
    username: profile.username,
    firstLogin: profile.first_login,
    birthdate: profile.birthdate,
    gender: profile.gender,
    contactNumber: profile.contact_number,
    address: profile.address,
    emergencyContactName: profile.emergency_contact_name,
    emergencyContactRelation: profile.emergency_contact_relation,
    emergencyContactNumber: profile.emergency_contact_number,
  }
}

// ---- ACTIVATE ACCOUNT ------------------------------------------------------
export async function activateAccount(employeeId, email) {
  const { data, error } = await supabase.functions.invoke("activate-account", {
    body: { employeeId, email },
  })

  if (error) {
    try {
      const body = await error.context?.json?.()
      if (body?.status) return body
    } catch {
      // fall through to generic error below
    }
    return { status: "error", message: error.message }
  }

  return data
}

// ---- LOGIN ------------------------------------------------------------------
export async function login(username, password) {
  const { data: rows, error: lookupError } = await supabase
    .rpc("get_login_email", { p_username: username })

  const match = rows?.[0]
  if (lookupError || !match || !match.activated) return { status: "not_found" }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: match.email,
    password,
  })
  if (authError) return { status: "wrong_password" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle()

  return { status: "ok", employee: publicProfile(profile) }
}

// ---- CURRENT USER / LOGOUT ---------------------------------------------------
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", session.user.id)
    .maybeSingle()

  return profile ? publicProfile(profile) : null
}

export async function logout() {
  await supabase.auth.signOut()
}

// ---- UPDATE USERNAME (first login) -------------------------------------------
export async function updateUsername(newUsername, currentPassword) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { status: "no_session" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", session.user.id)
    .maybeSingle()
  if (!profile) return { status: "no_session" }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  })
  if (authError) return { status: "wrong_password" }

  if (profile.username === newUsername) return { status: "same" }

  const { data: taken } = await supabase
    .rpc("is_username_taken", {
      p_username: newUsername,
      p_exclude_employee_id: profile.employee_id,
    })
  if (taken) return { status: "taken" }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ username: newUsername, first_login: false })
    .eq("employee_id", profile.employee_id)

  if (updateError) return { status: "error", message: updateError.message }
  return { status: "ok" }
}