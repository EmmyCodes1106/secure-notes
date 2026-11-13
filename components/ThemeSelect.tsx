'use client'

import { useSyncExternalStore } from 'react'
import { Laptop, Moon, Sun } from 'lucide-react'

type Pref = 'light' | 'dark' | 'system'

function subscribe(callback: () => void) {
  window.addEventListener('theme-change', callback)
  return () => window.removeEventListener('theme-change', callback)
}

function getSnapshot(): Pref {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(pref: Pref) {
  try {
    localStorage.setItem('theme', pref)
  } catch {}
  const dark =
    pref === 'dark' ||
    (pref === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  window.dispatchEvent(new Event('theme-change'))
}

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
] as const

export default function ThemeSelect() {
  const current = useSyncExternalStore<Pref>(
    subscribe,
    getSnapshot,
    () => 'system'
  )

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => applyTheme(value)}
          aria-pressed={current === value}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
            current === value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface text-muted hover:text-foreground'
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  )
}