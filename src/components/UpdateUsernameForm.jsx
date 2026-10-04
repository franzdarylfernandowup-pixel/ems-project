import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "./AuthLayout"
import AuthField from "./AuthField"
import { useToast } from "../lib/useToast"
import { dashboardPath, getCurrentUser, logout, updateUsername } from "../lib/mockDb"

export default function UpdateUsernameForm() {
  const navigate = useNavigate()
  const [user, setUser] = useState(undefined) // undefined = "still loading"
  const [newUsername, setNewUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [toast, setToast] = useToast()

  useEffect(() => {
    getCurrentUser().then((u) => setUser(u))
  }, [])

  useEffect(() => {
    if (user === undefined) return // still loading, do nothing yet
    if (!user) {
      navigate("/login", {
        replace: true,
        state: { message: "Log in with your default username and password first." },
      })
    } else if (!user.firstLogin) {
      navigate(dashboardPath(user.role), { replace: true })
    }
  }, [user, navigate])

  if (!user || !user.firstLogin) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setToast(null)

    const name = newUsername.trim()
    const nextErrors = { username: "", password: "" }

    if (!name) nextErrors.username = "New username is required"
    else if (name.length < 4) nextErrors.username = "Use at least 4 characters"
    else if (!/^[A-Za-z0-9_.]+$/.test(name))
      nextErrors.username = "Letters, numbers, _ and . only"

    if (!password) nextErrors.password = "Password is required"

    setErrors(nextErrors)
    if (nextErrors.username || nextErrors.password) return

    const result = await updateUsername(name, password)

    if (result.status === "wrong_password") {
      setErrors({ username: "", password: "Invalid Password" })
      return
    }
    if (result.status === "same") {
      setErrors({ username: "Pick a different username", password: "" })
      return
    }
    if (result.status === "taken") {
      setErrors({ username: "Username already taken", password: "" })
      return
    }

    setErrors({ username: "", password: "" })
    setToast({ message: "Username has been changed!", error: false })
    setTimeout(() => navigate(dashboardPath(user.role)), 1200)
  }

  async function handleBack() {
    await logout()
    navigate("/login")
  }

  return (
    <AuthLayout toast={toast} variant="center">
      <div className="w-full max-w-xs rounded-xl bg-black/30 p-8">
        <h1 className="text-lg font-semibold">Update Username</h1>
        <p className="mt-1 text-[10px] text-white/60">
          Current username: {user.username}. Enter your default password to confirm.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-4">
          <AuthField
            id="newUsername"
            label="New Username"
            placeholder="yi_FND"
            autoComplete="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            error={errors.username}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="current-password"
            className="mt-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-neutral-300 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-white"
          >
            Confirm
          </button>
        </form>

        <button
          type="button"
          onClick={handleBack}
          className="mt-2 rounded-md bg-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-white"
        >
          Back
        </button>
      </div>
    </AuthLayout>
  )
}