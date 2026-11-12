import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteNote } from '@/app/actions'
import EditForm from './EditForm'

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const noteId = Number(id)

  if (!Number.isInteger(noteId)) notFound()

  const supabase = await createClient()

  // If this note belongs to someone else, row-level security returns nothing
  const { data: note } = await supabase
    .from('notes')
    .select('id, title, body')
    .eq('id', noteId)
    .maybeSingle()

  if (!note) notFound()

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit note</h1>

      <EditForm note={note} />

      <form action={deleteNote.bind(null, note.id)}>
        <button className="rounded border border-red-500 px-4 py-2 text-red-500">
          Delete note
        </button>
      </form>
    </main>
  )
}