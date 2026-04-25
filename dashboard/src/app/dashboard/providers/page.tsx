export const dynamic = 'force-dynamic'
import { getSupabase } from '@/lib/supabase'
import { format, differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import type { Provider } from '@/types'

export default async function ProvidersPage() {
  const supabase = getSupabase()

  const [{ data: providers }, { data: activities }] = await Promise.all([
    supabase.from('providers').select('*').eq('active', true).order('name'),
    supabase.from('rep_activities').select('provider_id, visit_date, next_visit_date').order('visit_date', { ascending: false }),
  ])

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
        <h1 className="text-2xl font-extrabold text-pn-dark">Providers</h1>
        <p className="text-pn-muted text-sm mt-1 font-medium">{(providers || []).length} providers in Puerto Rico</p>
      </div>

      <ProvidersClient providers={providers || []} statsMap={Object.fromEntries(statsMap)} specialties={specialties as string[]} />
    </div>
  )
}

function ProvidersClient({
  providers,
  statsMap,
}: {
  providers: Provider[]
  statsMap: Record<number, { lastVisit: string; nextVisit: string | null; count: number }>
  specialties: string[]
}) {
  return (
    <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-pn-border bg-pn-bg">
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Provider</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Specialty</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">City</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Visits</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Last visit</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Next visit</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p, i) => {
            const stats = statsMap[p.id]
            return (
              <tr key={p.id} className={`hover:bg-pn-bg transition-colors ${i < providers.length - 1 ? 'border-b border-pn-border' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-pn-dark">{p.name}</span>
                    {(() => {
                      if (!stats?.lastVisit) return (
                        <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold rounded">Never visited</span>
                      )
                      const days = differenceInDays(new Date(), parseISO(stats.lastVisit))
                      if (days >= 30) return (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded">⚠ {days}d overdue</span>
                      )
                      return null
                    })()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 bg-pn-sky text-pn-navy text-xs rounded font-semibold">
                    {p.specialty || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-pn-muted">{p.city || '—'}</td>
                <td className="px-4 py-3 font-semibold text-pn-navy">{stats?.count ?? 0}</td>
                <td className="px-4 py-3 text-pn-muted">
                  {stats?.lastVisit ? format(new Date(stats.lastVisit + 'T12:00:00'), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-4 py-3">
                  {stats?.nextVisit ? (
                    <span className="text-pn-green font-semibold">
                      {format(new Date(stats.nextVisit + 'T12:00:00'), 'MMM d, yyyy')}
                    </span>
                  ) : <span className="text-pn-faint">—</span>}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/providers/${p.id}`} className="text-xs text-pn-blue hover:text-pn-navy font-bold transition-colors">
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
