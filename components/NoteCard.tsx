import Link from 'next/link'

export type NoteSummary = {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function NoteCard({ note }: { note: NoteSummary }) {
  const preview = note.body.replace(/\s+/g, ' ').trim().slice(0, 140)
  const edited = note.updated_at !== note.created_at

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group block rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
    >
      <h3 className="truncate font-semibold group-hover:text-primary">
        {note.title}
      </h3>
      <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm text-muted">
        {preview || 'No content'}
      </p>
      <p className="mt-4 text-xs text-muted">
        Created {formatDate(note.created_at)}
        {edited && ` · Updated ${formatDate(note.updated_at)}`}
      </p>
    </Link>
  )
}