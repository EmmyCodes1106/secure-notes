'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error: string } | null

function readCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  return { email, password }
}

export async function login(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { email, password } = readCredentials(formData)

  if (!email || !password) return { error: 'Wrong email or password' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Wrong email or password' }

  redirect('/')
}

export async function signup(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { email, password } = readCredentials(formData)

  if (!email.includes('@')) return { error: 'Enter a valid email address' }
  if (password.length < 8)
    return { error: 'Password must be at least 8 characters' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: 'Could not create the account. Try another email.' }
  if (!data.session)
    return { error: 'Account created but not logged in. Is Confirm email off?' }

  redirect('/')
}