export interface RepActivity {
  id: string
  created_at: string
  rep_name: string
  visit_date: string
  provider_id: number
  provider_name: string
  provider_city: string | null
  provider_specialty: string | null
  call_type: string
  products_discussed: string[]
  outcome: string
  next_steps: string | null
  notes: string | null
  samples_left: boolean
  literature_left: boolean
  materials_left: string[] | null
  gatekeeper_name: string | null
  gatekeeper_role: string | null
  next_visit_date: string | null
}

export interface Provider {
  id: number
  name: string
  specialty: string | null
  city: string | null
  phone: string | null
  npi: string | null
  active: boolean
}
