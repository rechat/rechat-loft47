
import React from '@libs/react'

export function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue as T
    try {
      const saved = window.localStorage.getItem(key)
      return saved !== null ? (saved as unknown as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, String(value))
    } catch {
      /* ignore storage errors */
    }
  }, [key, value])

  return [value, setValue]
} 