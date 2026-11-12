'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { updateNote } from '@/app/actions'
import WordCount from '@/components/WordCount'

export default function EditForm({
  note,
}: {
  note: { id: number; title: string; body: string }
}) {
  const [state, action, pending] = useActionState(
    updateNote.bind(null, note.id),
    null
  )
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)

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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input"
        />
        <div className="mt-1.5">
          <WordCount text={body} />
        </div>
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