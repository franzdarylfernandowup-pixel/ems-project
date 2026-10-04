import ProfileForm from "./ProfileForm"

const EMPLOYEE_MENU = [
  { label: "Dashboard", path: "/employee/dashboard" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "Tasks", path: "/employee/tasks" },
  { label: "Announcements", path: "/employee/announcements" },
  { label: "Leave", path: "/employee/leave" },
]

export default function EmployeeProfile() {
  return <ProfileForm menuItems={EMPLOYEE_MENU} activePath="/employee/profile" />
}