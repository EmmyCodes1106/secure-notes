export default function WordCount({ text }: { text: string }) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0

  return (
    <p className="text-xs text-muted">
      {words} {words === 1 ? 'word' : 'words'} · {text.length} characters
    </p>
  )
}