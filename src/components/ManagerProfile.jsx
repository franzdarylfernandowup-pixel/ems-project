import ProfileForm from "./ProfileForm"

const MANAGER_MENU = [
  { label: "Dashboard", path: "/manager/dashboard" },
  { label: "Profile", path: "/manager/profile" },
  { label: "Attendance", path: "/manager/attendance" },
  { label: "Tasks", path: "/manager/tasks" },
  { label: "Announcements", path: "/manager/announcements" },
  { label: "Leave", path: "/manager/leave" },
  { label: "Employees", path: "/manager/employees" },
]

export default function ManagerProfile() {
  return <ProfileForm menuItems={MANAGER_MENU} activePath="/manager/profile" />
}