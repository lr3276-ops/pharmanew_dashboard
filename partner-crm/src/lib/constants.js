export const STAGES = [
  'Lead',
  'Contacted',
  'NDA Signed',
  'Term Sheet',
  'Active Partner',
  'Closed / Lost',
]

export const PRIORITIES = ['High', 'Medium', 'Low']

export const SOURCES = [
  'Conference',
  'Referral',
  'Cold Outreach',
  'Inbound',
  'Other',
]

export const THERAPEUTIC_AREAS = [
  'Gastroenterology',
  'Cardiology',
  'Oncology',
  'Neurology',
  'Infectious Disease',
  'Vaccines',
  'Dermatology',
  'Endocrinology',
  'Pulmonology',
  'Rheumatology',
  'Other',
]

// Full static class strings so Tailwind JIT scanner picks them up
export const STAGE_CLASSES = {
  'Lead':           'bg-gray-100 text-gray-600',
  'Contacted':      'bg-sky-100 text-sky-700',
  'NDA Signed':     'bg-blue-100 text-blue-700',
  'Term Sheet':     'bg-violet-100 text-violet-700',
  'Active Partner': 'bg-emerald-100 text-emerald-700',
  'Closed / Lost':  'bg-red-100 text-red-600',
}

export const PRIORITY_CLASSES = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low:    'bg-gray-200 text-gray-500',
}

export const STAGE_BORDER = {
  'Lead':           'border-t-gray-300',
  'Contacted':      'border-t-sky-400',
  'NDA Signed':     'border-t-blue-500',
  'Term Sheet':     'border-t-violet-500',
  'Active Partner': 'border-t-emerald-500',
  'Closed / Lost':  'border-t-red-400',
}
