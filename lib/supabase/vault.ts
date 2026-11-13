import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

export const VAULT_COOKIE = 'vault_token'
export const VAULT_MINUTES = 5

export function newVaultToken() {
  return randomBytes(32).toString('hex')
}

// The database stores only this hash, never the token itself
export function hashVaultToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

// A session cookie (no expiry date): it disappears when the browser closes
export async function setVaultCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(VAULT_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export async function clearVaultCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(VAULT_COOKIE)
}

export async function createVaultClient() {
  const cookieStore = await cookies()
  const token = cookieStore.get(VAULT_COOKIE)?.value

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a page where cookies can't be set; proxy.ts handles refresh.
          }
        },
      },
      global: {
        headers: token ? { 'x-vault-token': token } : {},
      },
    }
  )
}