export const dynamic = 'force-dynamic'
import { getSupabase } from '@/lib/supabase'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Provider, RepActivity } from '@/types'

export default async function ProvidersPage() {
  const supabase = getSupabase()

  const [{ data: providers }, { data: activities }] = await Promise.all([
    supabase.from('providers').select('*').eq('active', true).order('name'),
    supabase.from('rep_activities').select('provider_id, visit_date, next_visit_date').order('visit_date', { ascending: false }),
  ])

  // Build stats map per provider
  const statsMap = new Map<number, { lastVisit: string; nextVisit: string | null; count: number }>()
  for (const a of (activities || []) as { provider_id: number; visit_date: string; next_visit_date: string | null }[]) {
    if (!statsMap.has(a.provider_id)) {
      statsMap.set(a.provider_id, { lastVisit: a.visit_date, nextVisit: a.next_visit_date, count: 1 })
    } else {
      const s = statsMap.get(a.provider_id)!
      s.count++
      if (a.next_visit_date && (!s.nextVisit || a.next_visit_date > s.nextVisit)) {
        s.nextVisit = a.next_visit_date
      }
    }
  }

  const specialties = Array.from(new Set((providers || []).map((p: Provider) => p.specialty).filter(Boolean))).sort()

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Providers</h1>
        <p className="text-slate-500 text-sm mt-1">{(providers || []).length} providers in Puerto Rico</p>
      </div>

      <ProvidersClient providers={providers || []} statsMap={Object.fromEntries(statsMap)} specialties={specialties as string[]} />
    </div>
  )
}

// Inline client component using a trick — we'll make the page a server component
// and render a simple filterable list as a server-rendered static list
// (filtering will require a separate client component file for full interactivity)
function ProvidersClient({
  providers,
  statsMap,
  specialties,
}: {
  providers: Provider[]
  statsMap: Record<number, { lastVisit: string; nextVisit: string | null; count: number }>
  specialties: string[]
}) {
  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialty</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">City</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Visits</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last visit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Next visit</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p, i) => {
              const stats = statsMap[p.id]
              return (
                <tr key={p.id} className={i < providers.length - 1 ? 'border-b border-slate-50' : ''}>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">
                      {p.specialty || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.city || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{stats?.count ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {stats?.lastVisit ? format(new Date(stats.lastVisit + 'T12:00:00'), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {stats?.nextVisit ? (
                      <span className="text-green-700 font-medium">
                        {format(new Date(stats.nextVisit + 'T12:00:00'), 'MMM d, yyyy')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/providers/${p.id}`} className="text-xs text-green-700 hover:underline font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
