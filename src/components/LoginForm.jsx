import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import loginBg from "../assets/login-bg.jpg"
import { useToast } from "../lib/useToast"
import { login, dashboardPath } from "../lib/mockDb"

export default function LoginForm() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [toast, setToast] = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setToast(null)

    if (!username.trim() || !password) {
      setErrors({
        username: username.trim() ? "" : "Username is required",
        password: password ? "" : "Password is required",
      })
      return
    }

    setSubmitting(true)
    const result = await login(username.trim(), password)
    setSubmitting(false)

    if (result.status === "not_found") {
      setErrors({ username: "Invalid Username", password: "" })
      setToast({ message: "Account may not be registered!", error: true })
      return
    }
    if (result.status === "wrong_password") {
      setErrors({ username: "", password: "Invalid Password" })
      return
    }

    setErrors({ username: "", password: "" })
    setToast({ message: `Logged in as ${result.employee.fullName}!`, error: false })

    setTimeout(() => {
      if (result.employee.firstLogin) {
        navigate("/update-username")
      } else {
        navigate(dashboardPath(result.employee.role))
      }
    }, 800)
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #0a0a0a 0%, #0a0a0a 26%, rgba(10,10,10,0.75) 42%, rgba(10,10,10,0.15) 75%, rgba(10,10,10,0.05) 100%)",
        }}
      />

      {toast && (
        <div
          className={`absolute right-6 top-6 z-20 rounded-full bg-white px-6 py-2 text-xs font-semibold shadow-lg ${
            toast.error ? "text-red-800" : "text-neutral-900"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="absolute left-8 top-8 z-10 flex items-center gap-3">
        <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4 2h16v20h-6v-4h-4v4H4V2zm3 3v3h3V5H7zm7 0v3h3V5h-3zM7 10v3h3v-3H7zm7 0v3h3v-3h-3z"
          />
        </svg>
        <span className="text-2xl font-semibold">FND&apos;s FIRM</span>
      </div>

      <section className="relative z-10 flex min-h-screen w-full max-w-md flex-col justify-center px-14">
        <h1 className="text-4xl font-semibold">Welcome Back !</h1>
        <p className="mt-1 text-[10px] text-white/70">
          Your work, your team, your flow, all in one place
        </p>

        <h2 className="mt-12 text-3xl font-semibold">Sign In</h2>

        <form onSubmit={handleSubmit} noValidate className="mt-4">
          <label className="block text-xs">Username</label>
          {errors.username && (
            <p className="text-[11px] text-red-500">{errors.username}</p>
          )}
          <input
            type="text"
            placeholder="yi_FND"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`mt-1 w-full rounded-md bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 ${
              errors.username ? "text-red-700" : "text-neutral-900"
            }`}
          />

          <label className="mt-4 block text-xs">Password</label>
          {errors.password && (
            <p className="text-[11px] text-red-500">{errors.password}</p>
          )}
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 w-full rounded-md bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 ${
              errors.password ? "text-red-700" : "text-neutral-900"
            }`}
          />

          <Link
            to="/change-password"
            className="mt-2 inline-block text-[10px] text-white/60 hover:text-white"
          >
            Change password
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="mt-10 w-full rounded-md bg-neutral-300 py-2 text-xs font-semibold text-neutral-900 hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-white/80">
          Account not Activated?{" "}
          <Link to="/activate" className="underline hover:text-white">
            Click Here
          </Link>
        </p>
        <p className="mt-1 text-center text-[10px] text-white/60">
          <Link to="/update-username" className="hover:text-white">
            Change Default Username
          </Link>
        </p>
      </section>
    </main>
  )
}