'use client'

import { useActionState } from 'react'
import { createNote } from './actions'

export default function NoteForm() {
  const [state, action, pending] = useActionState(createNote, null)

  return (
    <form action={action} className="mb-8 flex flex-col gap-3">
      <input
        name="title"
        type="text"
        placeholder="Title (e.g. Tolu, maths)"
        className="rounded border p-2 text-black"
      />
      <textarea
        name="body"
        rows={4}
        placeholder="Write your note..."
        className="rounded border p-2 text-black"
      />

      {state?.error && <p className="text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Save note'}
      </button>
    </form>
  )
}