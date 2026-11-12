import { createClient } from '@/lib/supabase/server'
import NoteForm from '@/components/NoteForm'

export default async function NewNotePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('note_categories')
    .select('id, name')
    .order('name')

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">New note</h1>
      <NoteForm categories={categories ?? []} />
    </div>
  )
}