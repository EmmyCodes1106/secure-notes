'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateNote } from '@/app/actions'

export default function EditForm({
  note,
}: {
  note: { id: number; title: string; body: string }
}) {
  const [state, action, pending] = useActionState(
    updateNote.bind(null, note.id),
    null
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          defaultValue={note.title}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
          Note
        </label>
        <textarea
          id="body"
          name="body"
          rows={14}
          defaultValue={note.body}
          className="input"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : 'Save changes'}
        </button>
        <Link href="/notes" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}