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
    <form action={action} className="mb-6 flex flex-col gap-3">
      <input
        name="title"
        type="text"
        defaultValue={note.title}
        className="rounded border p-2 text-black"
      />
      <textarea
        name="body"
        rows={6}
        defaultValue={note.body}
        className="rounded border p-2 text-black"
      />

      {state?.error && <p className="text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save changes'}
        </button>
        <Link href="/" className="rounded border px-4 py-2">
          Cancel
        </Link>
      </div>
    </form>
  )
}