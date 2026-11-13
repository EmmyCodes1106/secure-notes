import { createClient } from '@/lib/supabase/server'
import { getCategoryNames } from '@/lib/queries'
import NoteCard from '@/components/NoteCard'

export default async function ArchivePage() {
  const supabase = await createClient()

  const [{ data: notes }, names] = await Promise.all([
    supabase
      .from('notes')
      .select('id, title, body, category_id, pinned, archived, created_at, updated_at')
      .eq('archived', true)
      .order('updated_at', { ascending: false }),
    getCategoryNames(supabase),
  ])

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Archive</h1>
      <p className="mb-6 text-sm text-muted">
        Archived notes are kept safe. Restore one any time with the restore icon.
      </p>

      {notes && notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">The archive is empty</h2>
          <p className="mt-1 text-sm text-muted">
            Notes you archive will appear here instead of being deleted.
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