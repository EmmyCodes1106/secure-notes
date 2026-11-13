import { createClient } from '@/lib/supabase/server'
import { getCategoryNames } from '@/lib/queries'
import NoteCard from '@/components/NoteCard'

export default async function PinnedPage() {
  const supabase = await createClient()

  const [{ data: notes }, names] = await Promise.all([
    supabase
      .from('notes')
      .select('id, title, body, category_id, pinned, archived, created_at, updated_at')
      .eq('archived', false)
      .eq('pinned', true)
      .order('updated_at', { ascending: false }),
    getCategoryNames(supabase),
  ])

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Pinned notes</h1>
      <p className="mb-6 text-sm text-muted">Your most important notes, one click away.</p>

      {notes && notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">Nothing pinned yet</h2>
          <p className="mt-1 text-sm text-muted">
            Use the pin icon on any note to keep it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes?.map((n) => (
            <NoteCard key={n.id} note={n} categoryName={n.category_id ? names.get(n.category_id) : null} />
          ))}
        </div>
      )}
    </div>
  )
}