import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NoteCard from '@/components/NoteCard'

const SORTS = {
  newest: { label: 'Newest first', column: 'created_at', ascending: false },
  oldest: { label: 'Oldest first', column: 'created_at', ascending: true },
  updated: { label: 'Recently updated', column: 'updated_at', ascending: false },
} as const

type SortKey = keyof typeof SORTS

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>
}) {
  const params = await searchParams
  const rawQ = typeof params.q === 'string' ? params.q : ''
  const rawSort = typeof params.sort === 'string' ? params.sort : ''

  // Remove characters that have special meaning in database filters
  const q = rawQ.replace(/[%_\\",()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100)
  const sort: SortKey =
    (['newest', 'oldest', 'updated'] as const).find((s) => s === rawSort) ??
    'newest'

  const supabase = await createClient()

  let query = supabase
    .from('notes')
    .select('id, title, body, created_at, updated_at')

  if (q) {
    query = query.or(`title.ilike."%${q}%",body.ilike."%${q}%"`)
  }

  const { column, ascending } = SORTS[sort]
  const { data: notes } = await query.order(column, { ascending })

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">All notes</h1>
        <Link href="/notes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New note
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title or content..."
            className="input pl-9"
          />
        </div>
        <select name="sort" defaultValue={sort} className="input sm:w-48">
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Apply
        </button>
      </form>

      {notes && notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          {q ? (
            <>
              <h2 className="text-lg font-semibold">No matching notes</h2>
              <p className="mt-1 text-sm text-muted">
                Nothing matches “{q}”. Try different words.
              </p>
              <Link href="/notes" className="btn-secondary mt-5">
                Clear search
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">No notes yet</h2>
              <p className="mt-1 text-sm text-muted">
                Your notes will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            {notes?.length} {notes?.length === 1 ? 'note' : 'notes'}
            {q && ` matching “${q}”`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes?.map((n) => <NoteCard key={n.id} note={n} />)}
          </div>
        </>
      )}
    </div>
  )
}