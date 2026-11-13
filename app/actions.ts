'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SUGGESTED_CATEGORIES } from '@/lib/suggested-categories'
import { VAULT_COOKIE } from '@/lib/supabase/vault'
import { cookies } from 'next/headers'

export type NoteFormState = { error: string } | null

export async function logout() {
  const supabase = await createClient()

  // Lock the vault first, while we're still logged in
  await supabase.rpc('vault_lock')
  const cookieStore = await cookies()
  cookieStore.delete(VAULT_COOKIE)

  await supabase.auth.signOut()
  redirect('/login')
}

function checkNote(title: string, body: string): string | null {
  if (!title) return 'A note needs a title.'
  if (title.length > 200) return 'The title is too long (200 characters max).'
  if (body.length > 10000) return 'The note is too long (10,000 characters max).'
  return null
}

function readCategoryId(formData: FormData): number | null | 'invalid' {
  const raw = String(formData.get('category') ?? '').trim()
  if (raw === '') return null
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : 'invalid'
}

export async function createNote(
  _prev: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')
  const categoryId = readCategoryId(formData)

  const problem = checkNote(title, body)
  if (problem) return { error: problem }
  if (categoryId === 'invalid') return { error: 'Choose a valid category.' }

  const supabase = await createClient()

  // No user_id here: the database fills it in with auth.uid().
  // The database also rejects a category that belongs to someone else.
  const { error } = await supabase
    .from('notes')
    .insert({ title, body, category_id: categoryId })

  if (error) return { error: 'Could not save the note. Try again.' }

  revalidatePath('/', 'layout')
  redirect('/notes')
}

export async function updateNote(
  id: number,
  _prev: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')
  const categoryId = readCategoryId(formData)

  if (!Number.isInteger(id)) return { error: 'Note not found.' }

  const problem = checkNote(title, body)
  if (problem) return { error: problem }
  if (categoryId === 'invalid') return { error: 'Choose a valid category.' }

  const supabase = await createClient()

  // Row-level security makes sure this can only touch the user's own notes
  const { data, error } = await supabase
    .from('notes')
    .update({
      title,
      body,
      category_id: categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')

  if (error || !data || data.length === 0)
    return { error: 'Could not save the changes.' }

  revalidatePath('/', 'layout')
  redirect('/notes')
}

export async function deleteNote(id: number) {
  if (!Number.isInteger(id)) return

  const supabase = await createClient()
  await supabase.from('notes').delete().eq('id', id)

  revalidatePath('/', 'layout')
  redirect('/notes')
}

export async function createCategory(
  _prev: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const name = String(formData.get('name') ?? '').trim()

  if (!name) return { error: 'Give the category a name.' }
  if (name.length > 50) return { error: 'The name is too long (50 characters max).' }

  const supabase = await createClient()
  const { error } = await supabase.from('note_categories').insert({ name })

  if (error) {
    if (error.code === '23505')
      return { error: 'You already have a category with that name.' }
    return { error: 'Could not create the category. Try again.' }
  }

  revalidatePath('/', 'layout')
  return null
}

export async function deleteCategory(id: number) {
  if (!Number.isInteger(id)) return

  const supabase = await createClient()
  await supabase.from('note_categories').delete().eq('id', id)

  revalidatePath('/', 'layout')
}

export async function addSuggestedCategories() {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('note_categories')
    .select('name')

  const have = new Set((existing ?? []).map((c) => c.name.toLowerCase()))
  const missing = SUGGESTED_CATEGORIES.filter(
    (name) => !have.has(name.toLowerCase())
  ).map((name) => ({ name }))

  if (missing.length > 0) {
    await supabase.from('note_categories').insert(missing)
  }

  revalidatePath('/', 'layout')
}

export async function setPinned(id: number, pinned: boolean) {
  if (!Number.isInteger(id)) return

  const supabase = await createClient()

  // Row-level security makes sure this can only touch the user's own notes
  await supabase.from('notes').update({ pinned }).eq('id', id)

  revalidatePath('/', 'layout')
}

export async function setArchived(id: number, archived: boolean) {
  if (!Number.isInteger(id)) return

  const supabase = await createClient()

  // Archiving also unpins; restoring leaves the note unpinned
  await supabase
    .from('notes')
    .update(archived ? { archived: true, pinned: false } : { archived: false })
    .eq('id', id)

  revalidatePath('/', 'layout')
}