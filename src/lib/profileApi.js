import { supabase } from "./supabaseClient"

export async function updateProfile(employeeId, fields) {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("employee_id", employeeId)

  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}

export async function changePassword(email, currentPassword, newPassword) {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (authError) return { status: "wrong_password" }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { status: "error", message: updateError.message }

  return { status: "ok" }
}