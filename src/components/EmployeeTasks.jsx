import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "../lib/mockDb";
import {
  getMyTasks,
  uploadTaskAttachment,
  getTaskAttachments,
} from "../lib/tasksApi";
import Sidebar from "./Sidebar";

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
];

export default function EmployeeTasks() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachmentsByTask, setAttachmentsByTask] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const [activeUploadTaskId, setActiveUploadTaskId] = useState(null);

  async function loadTasks(employeeId) {
    const result = await getMyTasks(employeeId);
    if (result.status === "ok") {
      setTasks(result.tasks);
      const attachmentEntries = await Promise.all(
        result.tasks.map((t) =>
          getTaskAttachments(t.id).then((r) => [t.id, r.attachments || []]),
        ),
      );
      setAttachmentsByTask(Object.fromEntries(attachmentEntries));
    }
    setLoading(false);
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) loadTasks(u.id);
    });
  }, []);

  function triggerUpload(taskId) {
    setActiveUploadTaskId(taskId);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeUploadTaskId) return;

    setUploadingId(activeUploadTaskId);
    await uploadTaskAttachment(activeUploadTaskId, user.id, file);
    setUploadingId(null);
    loadTasks(user.id);
  }

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    checking: tasks.filter((t) => t.status === "checking").length,
  };

  return (
   <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={EMPLOYEE_MENU} activePath="/employee/tasks" />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Tasks</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Tasks</h1>
        <p className="text-xs text-neutral-400">
          Attach your work to submit a task for review
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Tasks" value={counts.total} />
          <StatCard label="Pending" value={counts.pending} />
          <StatCard label="In Progress" value={counts.inProgress} />
          <StatCard label="Checking" value={counts.checking} />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          className="hidden"
        />

        <div className="mt-6 space-y-3">
          {loading && <p className="text-xs text-neutral-400">Loading...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-xs text-neutral-400">No tasks assigned yet.</p>
          )}
          {tasks.map((t) => (
            <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  {t.description && (
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {t.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Due {t.due_date || "—"}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(attachmentsByTask[t.id] || []).map((a) => (
                    <span
                      key={a.id}
                      className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600"
                    >
                      {a.file_name}
                    </span>
                  ))}
                  {(attachmentsByTask[t.id] || []).length === 0 && (
                    <span className="text-[11px] text-neutral-400">
                      No files attached
                    </span>
                  )}
                </div>
                <button
                  onClick={() => triggerUpload(t.id)}
                  disabled={uploadingId === t.id || t.status === "done"}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {uploadingId === t.id ? "Uploading..." : "Attach File"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    todo: "bg-neutral-100 text-neutral-600",
    in_progress: "bg-blue-100 text-blue-700",
    checking: "bg-yellow-100 text-yellow-700",
    done: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    checking: "Checking",
    done: "Done",
    overdue: "Overdue",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] ${styles[status] || "bg-neutral-100"}`}
    >
      {labels[status] || status}
    </span>
  );
}
