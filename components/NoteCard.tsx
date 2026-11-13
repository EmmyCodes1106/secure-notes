import Link from 'next/link'
import { Archive, ArchiveRestore, Pin, PinOff } from 'lucide-react'
import { setArchived, setPinned } from '@/app/actions'

export type NoteSummary = {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
  pinned: boolean
  archived: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const iconButton =
  'rounded-lg p-2 text-muted transition hover:bg-surface-muted hover:text-foreground'

export default function NoteCard({
  note,
  categoryName,
}: {
  note: NoteSummary
  categoryName?: string | null
}) {
  const preview = note.body.replace(/\s+/g, ' ').trim().slice(0, 140)
  const edited = note.updated_at !== note.created_at

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface shadow-sm transition hover:border-primary/50 hover:shadow-md">
      <Link href={`/notes/${note.id}`} className="block flex-1 p-5 pb-3">
        {(categoryName || note.pinned) && (
          <div className="mb-2 flex items-center gap-2">
            {note.pinned && (
              <Pin
                className="h-3.5 w-3.5 fill-current text-primary"
                aria-label="Pinned"
              />
            )}
            {categoryName && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {categoryName}
              </span>
            )}
          </div>
        )}
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

      <div className="flex justify-end gap-1 border-t border-border px-3 py-1.5">
        {!note.archived && (
          <form action={setPinned.bind(null, note.id, !note.pinned)}>
            <button
              type="submit"
              className={iconButton}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              {note.pinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </button>
          </form>
        )}
        <form action={setArchived.bind(null, note.id, !note.archived)}>
          <button
            type="submit"
            className={iconButton}
            aria-label={note.archived ? 'Restore note' : 'Archive note'}
            title={note.archived ? 'Restore' : 'Archive'}
          >
            {note.archived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}