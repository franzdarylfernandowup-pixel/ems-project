import { supabase } from "./supabaseClient"

export async function getMyTasks(employeeId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("employee_id", employeeId)
    .order("due_date", { ascending: true })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", tasks: data }
}

export async function updateTaskStatus(id, status) {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id)
  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}

export async function getDepartmentTasks(department) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, profiles!inner(full_name, department)")
    .eq("profiles.department", department)
    .order("due_date", { ascending: true })

  if (error) return { status: "error", message: error.message }
  return { status: "ok", tasks: data }
}

export async function getDepartmentEmployees(department) {
  const { data, error } = await supabase
    .from("profiles")
    .select("employee_id, full_name")
    .eq("department", department)

  if (error) return { status: "error", message: error.message }
  return { status: "ok", employees: data }
}

export async function createTask({ employeeId, title, description, dueDate }) {
  const { error } = await supabase.from("tasks").insert({
    employee_id: employeeId,
    title,
    description: description || null,
    due_date: dueDate || null,
  })
  if (error) return { status: "error", message: error.message }
  return { status: "ok" }
}

export async function uploadTaskAttachment(taskId, employeeId, file) {
  const filePath = `${employeeId}/${taskId}/${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(filePath, file, { upsert: true })
  if (uploadError) return { status: "error", message: uploadError.message }

  const { error: insertError } = await supabase.from("task_attachments").insert({
    task_id: taskId,
    employee_id: employeeId,
    file_path: filePath,
    file_name: file.name,
  })
  if (insertError) return { status: "error", message: insertError.message }

  const { error: statusError } = await supabase
    .from("tasks")
    .update({ status: "checking" })
    .eq("id", taskId)
  if (statusError) return { status: "error", message: statusError.message }

  return { status: "ok" }
}

export async function getTaskAttachments(taskId) {
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("uploaded_at", { ascending: false })
  if (error) return { status: "error", message: error.message }
  return { status: "ok", attachments: data }
}

export async function getDepartmentAttachments(department) {
  const { data, error } = await supabase
    .from("task_attachments")
    .select("*, profiles!inner(department)")
    .eq("profiles.department", department)
  if (error) return { status: "error", message: error.message }
  return { status: "ok", attachments: data }
}

export async function getAttachmentUrl(filePath) {
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(filePath, 600)
  if (error) return null
  return data.signedUrl
}