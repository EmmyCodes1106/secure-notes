import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NoteCard from '@/components/NoteCard'

const columns = 'id, title, body, created_at, updated_at'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const name = (user?.email ?? '').split('@')[0]

  // No "where user_id" anywhere: row-level security returns only this user's notes
  const [{ count }, { data: updated }, { data: created }] = await Promise.all([
    supabase.from('notes').select('id', { count: 'exact', head: true }),
    supabase.from('notes').select(columns).order('updated_at', { ascending: false }).limit(4),
    supabase.from('notes').select(columns).order('created_at', { ascending: false }).limit(4),
  ])

  const total = count ?? 0

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
          <p className="mt-1 text-sm text-muted">Logged in as {user?.email}</p>
        </div>
        <Link href="/notes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New note
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">Total notes</p>
          <p className="mt-1 text-3xl font-bold">{total}</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">No notes yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Write your first note about a student's progress. Only you can see it.
          </p>
          <Link href="/notes/new" className="btn-primary mt-5">
            <Plus className="h-4 w-4" />
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently updated</h2>
              <Link href="/notes" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {updated?.map((n) => <NoteCard key={n.id} note={n} />)}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Recently created</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {created?.map((n) => <NoteCard key={n.id} note={n} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}