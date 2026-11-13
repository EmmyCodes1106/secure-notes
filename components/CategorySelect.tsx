import Link from 'next/link'

export type Category = { id: number; name: string }

export default function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: Category[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
        Category
      </label>
      <select
        id="category"
        name="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {categories.length === 0 && (
        <p className="mt-1.5 text-xs text-muted">
          No categories yet.{' '}
          <Link href="/categories" className="text-primary hover:underline">
            Create some
          </Link>
        </p>
      )}
    </div>
  )
}