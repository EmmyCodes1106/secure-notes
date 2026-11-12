import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions'
import ThemeSelect from '@/components/ThemeSelect'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-3 text-sm text-muted">Email address</p>
        <p className="font-medium">{user?.email}</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-semibold">Appearance</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Choose how Secure Notes looks on this device.
        </p>
        <ThemeSelect />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-semibold">Session</h2>
        <form action={logout} className="mt-3">
          <button className="btn-secondary">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </section>
    </div>
  )
}