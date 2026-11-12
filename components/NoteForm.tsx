'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createNote } from '@/app/actions'
import WordCount from './WordCount'
import CategorySelect, { type Category } from './CategorySelect'

export default function NoteForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createNote, null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')

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
          placeholder="e.g. Tolu, maths"
          className="input"
        />
      </div>

      <CategorySelect
        categories={categories}
        value={category}
        onChange={setCategory}
      />

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium">
          Note
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your note..."
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
          {pending ? 'Saving...' : 'Save note'}
        </button>
        <Link href="/notes" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}