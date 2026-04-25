export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, specialty, city, phone, npi, best_visit_days, best_visit_times')
    .order('name')

  if (error) return NextResponse.json({ error: error.message, hint: error.hint }, { status: 500 })
  return NextResponse.json(data ?? [])
}
