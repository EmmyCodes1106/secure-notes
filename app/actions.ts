'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type NoteFormState = { error: string } | null

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

function checkNote(title: string, body: string): string | null {
  if (!title) return 'A note needs a title.'
  if (title.length > 200) return 'The title is too long (200 characters max).'
  if (body.length > 10000) return 'The note is too long (10,000 characters max).'
  return null
}

export async function createNote(
  _prev: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')

  const problem = checkNote(title, body)
  if (problem) return { error: problem }

  const supabase = await createClient()

  // No user_id here: the database fills it in with auth.uid()
  const { error } = await supabase.from('notes').insert({ title, body })

  if (error) return { error: 'Could not save the note. Try again.' }

  revalidatePath('/')
  return null
}

export async function updateNote(
  id: number,
  _prev: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')

  if (!Number.isInteger(id)) return { error: 'Note not found.' }

  const problem = checkNote(title, body)
  if (problem) return { error: problem }

  const supabase = await createClient()

  // Row-level security makes sure this can only touch the user's own notes
  const { data, error } = await supabase
    .from('notes')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')

  if (error || !data || data.length === 0)
    return { error: 'Could not save the changes.' }

  revalidatePath('/')
  redirect('/')
}

export async function deleteNote(id: number) {
  if (!Number.isInteger(id)) return

  const supabase = await createClient()
  await supabase.from('notes').delete().eq('id', id)

  revalidatePath('/')
  redirect('/')
}