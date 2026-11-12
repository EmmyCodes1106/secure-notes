import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'
import NoteForm from './NoteForm'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No "where user_id = ..." here. Row-level security only returns this user's notes.
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <p>Logged in as {user?.email}</p>
        <form action={logout}>
          <button className="rounded border px-3 py-1">Log out</button>
        </form>
      </header>

      <h1 className="mb-4 text-2xl font-bold">My notes</h1>

      <NoteForm />

      {notes && notes.length === 0 && <p>No notes yet.</p>}

      <ul className="flex flex-col gap-4">
        {notes?.map((note) => (
          <li key={note.id} className="rounded border p-4">
            <h2 className="font-semibold">{note.title}</h2>
            <p className="whitespace-pre-wrap">{note.body}</p>
            <Link
              href={`/notes/${note.id}`}
              className="mt-2 inline-block text-sm underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}                                              