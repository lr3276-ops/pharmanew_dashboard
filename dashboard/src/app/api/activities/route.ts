import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('rep_activities')
    .insert([{
      rep_name: session.repName,
      visit_date: body.visit_date,
      provider_id: body.provider_id,
      provider_name: body.provider_name,
      provider_city: body.provider_city || null,
      provider_specialty: body.provider_specialty || null,
      call_type: body.call_type,
      products_discussed: body.products_discussed,
      outcome: body.outcome,
      next_steps: body.next_steps || null,
      notes: body.notes || null,
      samples_left: body.samples_left ?? false,
      literature_left: body.literature_left ?? false,
      materials_left: body.materials_left || null,
      gatekeeper_name: body.gatekeeper_name || null,
      gatekeeper_role: body.gatekeeper_role || null,
      next_visit_date: body.next_visit_date || null,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
