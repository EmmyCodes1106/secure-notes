import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">
        This page does not exist, or it is not yours to see.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </main>
  )
}