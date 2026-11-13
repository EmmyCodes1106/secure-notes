'use client'

import { useActionState } from 'react'
import { Plus } from 'lucide-react'
import { createCategory } from '@/app/actions'

export default function CategoryForm() {
  const [state, action, pending] = useActionState(createCategory, null)

  return (
    <form action={action}>
      <div className="flex gap-3">
        <input
          name="name"
          type="text"
          maxLength={50}
          placeholder="New category, e.g. SS2 Physics"
          aria-label="Category name"
          className="input"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  )
}