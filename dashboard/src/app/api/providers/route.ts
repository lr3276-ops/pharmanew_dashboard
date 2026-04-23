export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, specialty, city')
    .eq('active', true)
    .order('name')

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}
