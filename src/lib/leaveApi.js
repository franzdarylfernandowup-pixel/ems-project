import { supabase } from "./supabaseClient"

export async function getMyLeaveRequests(employeeId) {
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", requests: data }
}

export async function submitLeaveRequest(employeeId, { leaveType, startDate, endDate, reason, file }) {
  let attachmentPath = null
  let attachmentName = null

  if (file) {
    const filePath = `${employeeId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from("leave-attachments")
      .upload(filePath, file)
    if (uploadError) return { status: "error", message: uploadError.message }
    attachmentPath = filePath
    attachmentName = file.name
  }

  const { error } = await supabase.from("leave_requests").insert({
    employee_id: employeeId,
    leave_type: leaveType,
    start_date: startDate,
    end_date: endDate,
    reason,
    attachment_path: attachmentPath,
    attachment_name: attachmentName,
  })

  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}

export async function getDepartmentLeaveRequests(department) {
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*, profiles!inner(full_name, department)")
    .eq("profiles.department", department)
    .order("created_at", { ascending: false })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", requests: data }
}

export async function updateLeaveStatus(id, status) {
  const { error } = await supabase.from("leave_requests").update({ status }).eq("id", id)
  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}

export async function getLeaveAttachmentUrl(filePath) {
  const { data, error } = await supabase.storage
    .from("leave-attachments")
    .createSignedUrl(filePath, 600)
  if (error) return null
  return data.signedUrl
}