import loginBg from "../assets/login-bg.jpg"

// Shared frame for Login, Activate and Update Username:
// skyline photo, logo, toast message, and the content on top.
//   variant="panel"  -> form on a dark left panel (Login, Activate)
//   variant="center" -> form in the middle, whole photo dimmed (Update Username)
export default function AuthLayout({ toast, variant = "panel", children }) {
  const shade =
    variant === "panel"
      ? "linear-gradient(to right, #0a0a0a 0%, #0a0a0a 26%, rgba(10,10,10,0.75) 42%, rgba(10,10,10,0.15) 75%, rgba(10,10,10,0.05) 100%)"
      : "rgba(10,10,10,0.85)"

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-neutral-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center grayscale"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0" style={{ background: shade }} />

      {toast && (
        <div
          role="status"
          className={`absolute right-6 top-6 z-20 max-w-xs rounded-2xl bg-white px-6 py-2 text-center text-xs font-semibold shadow-lg ${
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

      {variant === "panel" ? (
        <section className="relative z-10 flex min-h-screen w-full max-w-md flex-col justify-center px-14">
          {children}
        </section>
      ) : (
        <section className="relative z-10 flex min-h-screen w-full items-center justify-center px-6">
          {children}
        </section>
      )}
    </main>
  )
}
