import { useEffect, useState } from "react"

// Small helper for the white message pill at the top right.
// Usage: const [toast, setToast] = useToast()
//        setToast({ message: "Saved!", error: false })
export function useToast(duration = 3500) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), duration)
    return () => clearTimeout(timer)
  }, [toast, duration])

  return [toast, setToast]
}
