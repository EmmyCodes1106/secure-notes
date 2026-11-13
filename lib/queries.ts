import type { SupabaseClient } from '@supabase/supabase-js'

export async function getCategoryNames(supabase: SupabaseClient) {
  const { data } = await supabase.from('note_categories').select('id, name')
  return new Map<number, string>((data ?? []).map((c) => [c.id, c.name]))
}