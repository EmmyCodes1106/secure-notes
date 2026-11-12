import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NoteCard from '@/components/NoteCard'

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, body, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">All notes</h1>
        <Link href="/notes/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New note
        </Link>
      </div>

      {notes && notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">No notes yet</h2>
          <p className="mt-1 text-sm text-muted">Your notes will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes?.map((n) => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
    </div>
  )
}