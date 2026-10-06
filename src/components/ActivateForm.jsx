import { useState } from "react"
import { Link } from "react-router-dom"
import AuthLayout from "./AuthLayout"
import AuthField from "./AuthField"
import { useToast } from "../lib/useToast"
import { activateAccount } from "../lib/mockDb"

// There is no email server yet, so we show the default login on screen
// to let you test. Set this to false once real emails are sent.
const SHOW_DEMO_CREDENTIALS = false

export default function ActivateForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({ employeeId: "", email: "" })
  const [toast, setToast] = useToast()
  const [sent, setSent] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setToast(null)
    setSent(null)

    const nextErrors = {
      employeeId: employeeId.trim() ? "" : "Employee ID is required",
      email: !email.trim()
        ? "Company email is required"
        : /^\S+@\S+\.\S+$/.test(email.trim())
          ? ""
          : "Enter a valid email",
    }
    setErrors(nextErrors)
    if (nextErrors.employeeId || nextErrors.email) return

    setSubmitting(true)
    const result = await activateAccount(employeeId, email)
    setSubmitting(false)

    if (result.status === "not_found") {
      setToast({ message: "Employee ID or company email not found!", error: true })
      return
    }
    if (result.status === "already_activated") {
      setToast({ message: "This account is already activated. Please log in.", error: true })
      return
    }
    if (result.status === "error") {
      setToast({ message: result.message || "Something went wrong. Try again.", error: true })
      return
    }

    setToast({ message: "Default password and username is sent to your email!", error: false })
    setSent(result)
  }

  return (
    <AuthLayout toast={toast}>
      <h1 className="text-4xl font-semibold">Welcome Back !</h1>
      <p className="mt-1 text-[10px] text-white/70">
        Your work, your team, your flow, all in one place
      </p>

      <h2 className="mt-10 text-3xl font-semibold">Activate</h2>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <AuthField
          id="employeeId"
          label="Employee ID"
          placeholder="ID-12345"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          error={errors.employeeId}
        />
        <AuthField
          id="email"
          label="Company Email"
          type="email"
          placeholder="johndoe@company.com"
          className="mt-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-10 w-full rounded-md bg-neutral-300 py-2 text-xs font-semibold text-neutral-900 hover:bg-white disabled:opacity-50"
        >
          {submitting ? "Activating..." : "Activate"}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-2 w-16 rounded-md bg-neutral-300 py-1.5 text-center text-xs font-semibold text-neutral-900 hover:bg-white"
      >
        Back
      </Link>

      {SHOW_DEMO_CREDENTIALS && sent && (
        <div className="mt-6 rounded-md border border-white/30 bg-white/10 p-3 text-[11px] leading-relaxed">
          <p className="font-semibold">Demo mode: no email is sent yet</p>
          <p>Default username: {sent.defaultUsername}</p>
          <p>Default password: {sent.defaultPassword}</p>
        </div>
      )}
    </AuthLayout>
  )
}