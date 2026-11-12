import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteNoteButton from '@/components/DeleteNoteButton'
import EditForm from './EditForm'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
    .select('id, title, body, created_at, updated_at')
    .eq('id', noteId)
    .maybeSingle()

  if (!note) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/notes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All notes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit note</h1>
          <p className="mt-1 text-xs text-muted">
            Created {formatDateTime(note.created_at)} · Last updated{' '}
            {formatDateTime(note.updated_at)}
          </p>
        </div>
        <DeleteNoteButton id={note.id} title={note.title} />
      </div>

      <EditForm note={note} />
    </div>
  )
}