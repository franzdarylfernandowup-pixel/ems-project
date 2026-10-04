import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../lib/mockDb"

function SidebarContent({ user, items, activePath, onNavigate }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-6 text-white">
      <div>
        <div className="flex flex-col items-center gap-2 border-b border-white/10 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/70" fill="currentColor">
              <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9v2.7h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold">{user?.fullName || "..."}</p>
          <p className="truncate text-[10px] text-white/50">{user?.email}</p>
        </div>

        <p className="mb-2 mt-6 px-2 text-[10px] uppercase tracking-wide text-white/40">Menu</p>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`rounded-md px-3 py-2 text-sm transition ${
                activePath === item.path
                  ? "bg-white font-semibold text-neutral-900"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-md bg-white/10 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/20"
      >
        Logout
      </button>
    </div>
  )
}

export default function Sidebar({ user, items, activePath }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile / tablet top bar */}
      <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 2h16v20h-6v-4h-4v4H4V2zm3 3v3h3V5H7zm7 0v3h3V5h-3zM7 10v3h3v-3H7zm7 0v3h3v-3h-3z"
            />
          </svg>
          <span className="text-sm font-semibold">FND&apos;s FIRM</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-1.5 hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-neutral-950 shadow-xl">
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-white/70 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <SidebarContent user={user} items={items} activePath={activePath} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar — fixed to the viewport, independent of page scroll */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col md:bg-neutral-950">
        <SidebarContent user={user} items={items} activePath={activePath} />
      </aside>
    </>
  )
}