import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SUGGESTED_CATEGORIES } from '@/lib/suggested-categories'
import { addSuggestedCategories, deleteCategory } from '@/app/actions'
import CategoryForm from '@/components/CategoryForm'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: notes }] = await Promise.all([
    supabase.from('note_categories').select('id, name').order('name'),
    supabase.from('notes').select('category_id'),
  ])

  const counts = new Map<number, number>()
  notes?.forEach((n) => {
    if (n.category_id !== null) {
      counts.set(n.category_id, (counts.get(n.category_id) ?? 0) + 1)
    }
  })

  const existing = new Set((categories ?? []).map((c) => c.name.toLowerCase()))
  const missing = SUGGESTED_CATEGORIES.filter(
    (name) => !existing.has(name.toLowerCase())
  ).length

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Categories</h1>
      <p className="mb-6 text-sm text-muted">
        Organise your notes by subject. Only you can see your categories.
      </p>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <CategoryForm />
        {missing > 0 && (
          <form action={addSuggestedCategories} className="mt-4">
            <button type="submit" className="btn-secondary">
              Add suggested subjects ({missing})
            </button>
          </form>
        )}
      </div>

      {categories && categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">No categories yet</h2>
          <p className="mt-1 text-sm text-muted">
            Add your own above, or use the suggested subjects.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm">
          {categories?.map((c) => {
            const count = counts.get(c.id) ?? 0
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 p-4">
                <Link
                  href={`/notes?category=${c.id}`}
                  className="min-w-0 flex-1 hover:text-primary"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-sm text-muted">
                    {count} {count === 1 ? 'note' : 'notes'}
                  </span>
                </Link>
                <form action={deleteCategory.bind(null, c.id)}>
                  <button
                    type="submit"
                    aria-label={`Delete category ${c.name}`}
                    title="Deleting a category keeps its notes"
                    className="rounded-lg p-2 text-muted transition hover:bg-surface-muted hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}