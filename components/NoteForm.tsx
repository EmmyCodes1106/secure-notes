'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createNote } from '@/app/actions'

export default function NoteForm() {
  const [state, action, pending] = useActionState(createNote, null)

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
          placeholder="e.g. Tolu, maths"
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
          rows={12}
          placeholder="Write your note..."
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
          {pending ? 'Saving...' : 'Save note'}
        </button>
        <Link href="/notes" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}