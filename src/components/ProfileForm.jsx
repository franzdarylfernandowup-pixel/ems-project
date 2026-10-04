import { useEffect, useState } from "react"
import { getCurrentUser } from "../lib/mockDb"
import { updateProfile, changePassword } from "../lib/profileApi"
import Sidebar from "./Sidebar"

export default function ProfileForm({ menuItems, activePath }) {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    birthdate: "",
    gender: "",
    contact_number: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    emergency_contact_number: "",
  })

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState(null)

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u)
      if (u) {
        setForm({
          birthdate: u.birthdate || "",
          gender: u.gender || "",
          contact_number: u.contactNumber || "",
          address: u.address || "",
          emergency_contact_name: u.emergencyContactName || "",
          emergency_contact_relation: u.emergencyContactRelation || "",
          emergency_contact_number: u.emergencyContactNumber || "",
        })
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const result = await updateProfile(user.id, form)
    setSaving(false)

    if (result.status === "error") {
      setMessage({ error: true, text: result.message })
      return
    }
    setMessage({ error: false, text: "Profile updated!" })
    setEditing(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwMessage(null)

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMessage({ error: true, text: "All password fields are required." })
      return
    }
    if (pwForm.next.length < 8) {
      setPwMessage({ error: true, text: "New password must be at least 8 characters." })
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMessage({ error: true, text: "New password and confirmation don't match." })
      return
    }

    setPwSaving(true)
    const result = await changePassword(user.email, pwForm.current, pwForm.next)
    setPwSaving(false)

    if (result.status === "wrong_password") {
      setPwMessage({ error: true, text: "Current password is incorrect." })
      return
    }
    if (result.status === "error") {
      setPwMessage({ error: true, text: result.message })
      return
    }

    setPwMessage({ error: false, text: "Password changed successfully!" })
    setPwForm({ current: "", next: "", confirm: "" })
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-100 md:h-screen md:flex-row md:overflow-hidden">
        <Sidebar user={user} items={menuItems} activePath={activePath} />
        <main className="flex-1 p-8 text-sm text-neutral-400">Loading...</main>
      </div>
    )
  }

  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-neutral-100 md:pl-60">
      <Sidebar user={user} items={menuItems} activePath={activePath} />

      <main className="p-8">
        <p className="text-xs text-neutral-400">Dashboard &gt; Profile</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Profile</h1>
        <p className="text-xs text-neutral-400">Manage your personal information</p>

        {/* Header card */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-neutral-900">{user.fullName}</p>
              <p className="text-xs text-neutral-500">{user.position} · {user.department}</p>
              <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium capitalize text-neutral-600">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
          {editing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <p className={`mt-3 text-xs ${message.error ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Section icon={<PersonIcon />} title="Personal Information">
            <Field label="Full Name" value={user.fullName} readOnly />
            <Field label="Email" value={user.email} readOnly />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Birthdate"
                type="date"
                value={form.birthdate}
                editing={editing}
                onChange={(v) => setForm({ ...form, birthdate: v })}
              />
              <Field
                label="Gender"
                type="select"
                options={["", "Male", "Female", "Other", "Prefer not to say"]}
                value={form.gender}
                editing={editing}
                onChange={(v) => setForm({ ...form, gender: v })}
              />
            </div>
            <Field
              label="Contact Number"
              value={form.contact_number}
              editing={editing}
              onChange={(v) => setForm({ ...form, contact_number: v })}
            />
            <Field
              label="Address"
              value={form.address}
              editing={editing}
              onChange={(v) => setForm({ ...form, address: v })}
            />
          </Section>

          <div className="space-y-5">
            <Section icon={<BriefcaseIcon />} title="Employment Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employee ID" value={user.id} readOnly />
                <Field label="Position" value={user.position} readOnly />
              </div>
              <Field label="Department" value={user.department} readOnly />
            </Section>

            <Section icon={<ShieldIcon />} title="Emergency Contact">
              <Field
                label="Full Name"
                value={form.emergency_contact_name}
                editing={editing}
                onChange={(v) => setForm({ ...form, emergency_contact_name: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Relationship"
                  value={form.emergency_contact_relation}
                  editing={editing}
                  onChange={(v) => setForm({ ...form, emergency_contact_relation: v })}
                />
                <Field
                  label="Contact Number"
                  value={form.emergency_contact_number}
                  editing={editing}
                  onChange={(v) => setForm({ ...form, emergency_contact_number: v })}
                />
              </div>
            </Section>
          </div>
        </div>

        <div className="mt-5 max-w-md">
          <Section icon={<LockIcon />} title="Change Password">
            <form onSubmit={handleChangePassword} className="space-y-3">
              <PasswordField
                label="Current Password"
                value={pwForm.current}
                onChange={(v) => setPwForm({ ...pwForm, current: v })}
              />
              <PasswordField
                label="New Password"
                value={pwForm.next}
                onChange={(v) => setPwForm({ ...pwForm, next: v })}
              />
              <PasswordField
                label="Confirm New Password"
                value={pwForm.confirm}
                onChange={(v) => setPwForm({ ...pwForm, confirm: v })}
              />

              {pwMessage && (
                <p className={`text-xs ${pwMessage.error ? "text-red-600" : "text-green-600"}`}>
                  {pwMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </Section>
        </div>
      </main>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-neutral-400">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, editing, readOnly, type = "text", options }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-neutral-500">{label}</label>
      {readOnly || !editing ? (
        <p className="mt-1 text-sm text-neutral-800">{value || <span className="text-neutral-300">—</span>}</p>
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o || "Select..."}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
      )}
    </div>
  )
}

function PasswordField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-neutral-500">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
      />
    </div>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.6-9.8 4.9v2.7h19.6v-2.7c0-3.3-6.5-4.9-9.8-4.9z" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}