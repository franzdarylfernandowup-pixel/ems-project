import { Routes, Route, Navigate } from "react-router-dom"

import LoginForm from "./components/LoginForm"
import ActivateForm from "./components/ActivateForm"
import UpdateUsernameForm from "./components/UpdateUsernameForm"

import EmployeeDashboard from "./components/EmployeeDashboard"
import EmployeeProfile from "./components/EmployeeProfile"
import EmployeeAttendance from "./components/EmployeeAttendance"
import EmployeeTasks from "./components/EmployeeTasks"
import EmployeeAnnouncements from "./components/EmployeeAnnouncements"
import EmployeeLeave from "./components/EmployeeLeave"

import ManagerDashboard from "./components/ManagerDashboard"
import ManagerProfile from "./components/ManagerProfile"
import ManagerAttendance from "./components/ManagerAttendance"
import ManagerTasks from "./components/ManagerTasks"
import ManagerAnnouncements from "./components/ManagerAnnouncements"
import ManagerLeaveRequests from "./components/ManagerLeaveRequests"
import ManagerEmployees from "./components/ManagerEmployees"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/activate" element={<ActivateForm />} />
      <Route path="/update-username" element={<UpdateUsernameForm />} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/profile" element={<EmployeeProfile />} />
      <Route path="/employee/attendance" element={<EmployeeAttendance />} />
      <Route path="/employee/tasks" element={<EmployeeTasks />} />
      <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />
      <Route path="/employee/leave" element={<EmployeeLeave />} />

      {/* Department Manager */}
      <Route path="/manager/dashboard" element={<ManagerDashboard />} />
      <Route path="/manager/profile" element={<ManagerProfile />} />
      <Route path="/manager/attendance" element={<ManagerAttendance />} />
      <Route path="/manager/tasks" element={<ManagerTasks />} />
      <Route path="/manager/announcements" element={<ManagerAnnouncements />} />
      <Route path="/manager/leave" element={<ManagerLeaveRequests />} />
      <Route path="/manager/employees" element={<ManagerEmployees />} />
    </Routes>
  )
}