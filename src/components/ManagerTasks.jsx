import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import {
  getDepartmentTasks,
  getDepartmentEmployees,
  createTask,
  updateTaskStatus,
  getDepartmentAttachments,
  getAttachmentUrl,
} from "../lib/tasksApi"
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

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "checking", label: "Checking" },
  { value: "done", label: "Done" },
  { value: "overdue", label: "Overdue" },
]

export default function ManagerTasks() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [attachmentsByTask, setAttachmentsByTask] = useState({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ employeeId: "", title: "", description: "", dueDate: "" })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  async function loadAll(department) {
    const [taskResult, empResult, attachResult] = await Promise.all([
      getDepartmentTasks(department),
      getDepartmentEmployees(department),
      getDepartmentAttachments(department),
    ])
    if (taskResult.status === "ok") setTasks(taskResult.tasks)
    if (empResult.status === "ok") setEmployees(empResult.employees)
    if (attachResult.status === "ok") {
      const grouped = {}
      for (const a of attachResult.attachments) {
        grouped[a.task_id] = grouped[a.task_id] || []
        grouped[a.task_id].push(a)
      }
      setAttachmentsByTask(grouped)
    }
    setLoading(false)
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u) loadAll(u.department)
    })
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setMessage(null)

    if (!form.employeeId || !form.title.trim()) {
      setMessage({ error: true, text: "Assignee and task title are required." })
      return
    }

    setSubmitting(true)
    const result = await createTask(form)
    setSubmitting(false)

    if (result.status === "error") {
      setMessage({ error: true, text: result.message })
      return
    }

    setMessage({ error: false, text: "Task created!" })
    setForm({ employeeId: "", title: "", description: "", dueDate: "" })
    loadAll(user.department)
  }

  async function handleStatusChange(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    await updateTaskStatus(id, status)
  }

  async function handleOpenFile(filePath) {
    const url = await getAttachmentUrl(filePath)
    if (url) window.open(url, "_blank")
  }

  return (
   <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={MANAGER_MENU} activePath="/manager/tasks" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Tasks</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Create and Update Tasks</h1>
        <p className="text-xs text-neutral-400">Assign tasks and review submitted files</p>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Assign New Task</p>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
              >
                <option value="">Assign to...</option>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>{e.full_name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none md:col-span-2"
              />
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-xs ${message.error ? "text-red-600" : "text-green-600"}`}>
              {message.text}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-xs text-neutral-400">Loading...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-xs text-neutral-400">No tasks yet.</p>
          )}
          {tasks.map((t) => (
            <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-[11px] text-neutral-400">
                    {t.profiles.full_name} · Due {t.due_date || "—"}
                  </p>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  className="rounded-md border border-neutral-200 px-2 py-1 text-[11px] outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {t.description && (
                <p className="mt-2 text-xs text-neutral-500">{t.description}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {(attachmentsByTask[t.id] || []).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleOpenFile(a.file_path)}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 hover:bg-neutral-200"
                  >
                    {a.file_name}
                  </button>
                ))}
                {(attachmentsByTask[t.id] || []).length === 0 && (
                  <span className="text-[11px] text-neutral-400">No files submitted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}