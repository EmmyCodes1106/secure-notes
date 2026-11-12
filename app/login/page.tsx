'use client'

import { useActionState, useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loginState, loginAction, loginPending] = useActionState(login, null)
  const [signupState, signupAction, signupPending] = useActionState(signup, null)

  const state = mode === 'login' ? loginState : signupState
  const pending = mode === 'login' ? loginPending : signupPending

  return (
    <main className="mx-auto mt-16 max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">
        {mode === 'login' ? 'Log in' : 'Sign up'}
      </h1>

      <form
        action={mode === 'login' ? loginAction : signupAction}
        className="flex flex-col gap-3"
      >
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border p-2 text-black"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (8+ characters)"
          required
          className="rounded border p-2 text-black"
        />

        {state?.error && <p className="text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {pending ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="mt-4 text-sm underline"
      >
        {mode === 'login'
          ? 'No account? Sign up'
          : 'Have an account? Log in'}
      </button>
    </main>
  )
}