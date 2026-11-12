import NoteForm from '@/components/NoteForm'

export default function NewNotePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">New note</h1>
      <NoteForm />
    </div>
  )
}