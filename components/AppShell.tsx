'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Archive,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  Pin,
  Settings,
  Tags,
  X,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { logout } from '@/app/actions'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'All Notes', icon: FileText },
  { href: '/pinned', label: 'Pinned', icon: Pin },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <NotebookPen className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold">Secure Notes</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <p className="truncate text-sm text-muted" title={email}>
          {email}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <form action={logout} className="flex-1">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-muted">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:sticky md:top-0 md:block md:h-screen">
        {nav}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 hover:bg-surface-muted"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold">Secure Notes</span>
        <span className="w-10" />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-2 hover:bg-surface-muted"
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}