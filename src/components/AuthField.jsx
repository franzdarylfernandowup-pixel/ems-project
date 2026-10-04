// One label + white input + red error text. Used on all the auth screens.
// Give it an `id`, `label`, and (optionally) an `error` message.
export default function AuthField({ label, error, className = "", ...inputProps }) {
  return (
    <div className={className}>
      <label htmlFor={inputProps.id} className="block text-xs">
        {label}
      </label>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <input
        {...inputProps}
        className={`mt-1 w-full rounded-md bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 ${
          error ? "text-red-700" : "text-neutral-900"
        }`}
      />
    </div>
  )
}
