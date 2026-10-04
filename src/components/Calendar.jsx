import { useState } from "react"

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleString("default", { month: "long" })

  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const cells = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="px-2 text-neutral-400 hover:text-neutral-900"
        >
          ‹
        </button>
        <p className="text-sm font-semibold">{monthName} {year}</p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="px-2 text-neutral-400 hover:text-neutral-900"
        >
          ›
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-400">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={`rounded-md py-1 ${
              day === null ? "" : isToday(day) ? "bg-neutral-900 text-white" : "text-neutral-600"
            }`}
          >
            {day || ""}
          </span>
        ))}
      </div>
    </div>
  )
}