'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  VAULT_MINUTES,
  clearVaultCookie,
  createVaultClient,
  hashVaultToken,
  newVaultToken,
  setVaultCookie,
} from '@/lib/supabase/vault'

export type VaultState = { error: string } | null

const MIN_LENGTH = 8
const MAX_BYTES = 72 // bcrypt only uses the first 72 bytes

function passwordProblem(password: string): string | null {
  if (password.length < MIN_LENGTH)
    return `Use at least ${MIN_LENGTH} characters.`
  if (Buffer.byteLength(password, 'utf8') > MAX_BYTES)
    return 'That password is too long (72 bytes at most).'
  return null
}

function noteProblem(title: string, body: string): string | null {
  if (!title) return 'A note needs a title.'
  if (title.length > 200) return 'The title is too long (200 characters max).'
  if (body.length > 10000) return 'The note is too long (10,000 characters max).'
  return null
}

// Checks the password in the database. On success, stores the token cookie.
async function unlockWith(
  password: string
): Promise<'ok' | 'invalid' | 'throttled'> {
  const supabase = await createVaultClient()
  const token = newVaultToken()

  const { data, error } = await supabase.rpc('vault_unlock', {
    p_password: password,
    p_token_hash: hashVaultToken(token),
    p_minutes: VAULT_MINUTES,
  })

  if (error) return 'invalid'
  if (data === 'throttled') return 'throttled'
  if (data !== 'ok') return 'invalid'

  await setVaultCookie(token)
  return 'ok'
}

// Every secured-note action starts here. The database enforces it again via RLS.
async function requireUnlocked() {
  const supabase = await createVaultClient()
  const { data } = await supabase.rpc('vault_is_unlocked')

  if (data !== true) redirect('/secured-notes')

  // Activity keeps the vault open (sliding 5-minute expiry)
  await supabase.rpc('vault_touch', { p_minutes: VAULT_MINUTES })
  return supabase
}

export async function setupVault(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  const problem = passwordProblem(password)
  if (problem) return { error: problem }
  if (password !== confirm) return { error: 'The two passwords do not match.' }

  const supabase = await createVaultClient()
  const { data, error } = await supabase.rpc('vault_setup', {
    p_password: password,
  })

  if (error || data !== true) {
    return { error: 'Could not set up the vault. Try again.' }
  }

  const result = await unlockWith(password)
  if (result !== 'ok') {
    return { error: 'The vault was created but could not be opened. Try unlocking.' }
  }

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}

export async function unlockVault(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const password = String(formData.get('password') ?? '')
  if (!password) return { error: 'Enter your vault password.' }

  const result = await unlockWith(password)

  if (result === 'throttled') {
    return { error: 'Too many attempts. Try again in 15 minutes.' }
  }
  if (result !== 'ok') return { error: 'Incorrect password.' }

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}

export async function lockVault() {
  const supabase = await createVaultClient()
  await supabase.rpc('vault_lock')
  await clearVaultCookie()

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}

// Called by the page while the tutor is active, so the vault doesn't expire mid-edit
export async function touchVault(): Promise<boolean> {
  const supabase = await createVaultClient()
  const { data } = await supabase.rpc('vault_touch', { p_minutes: VAULT_MINUTES })
  return data === true
}

export async function createSecuredNote(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')

  const problem = noteProblem(title, body)
  if (problem) return { error: problem }

  const supabase = await requireUnlocked()

  // No user_id here: the database fills it in with auth.uid()
  const { error } = await supabase.from('secured_notes').insert({ title, body })
  if (error) return { error: 'Could not save the note. Try again.' }

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}

export async function updateSecuredNote(
  id: number,
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '')

  if (!Number.isInteger(id)) return { error: 'Note not found.' }

  const problem = noteProblem(title, body)
  if (problem) return { error: problem }

  const supabase = await requireUnlocked()

  const { data, error } = await supabase
    .from('secured_notes')
    .update({ title, body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')

  if (error || !data || data.length === 0) {
    return { error: 'Could not save the changes.' }
  }

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}

export async function deleteSecuredNote(id: number) {
  if (!Number.isInteger(id)) return

  const supabase = await requireUnlocked()
  await supabase.from('secured_notes').delete().eq('id', id)

  revalidatePath('/secured-notes')
  redirect('/secured-notes')
}