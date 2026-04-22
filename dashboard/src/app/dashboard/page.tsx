export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { format, startOfMonth } from 'date-fns'
import Link from 'next/link'
import type { RepActivity } from '@/types'

function KPICard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function outcomeColor(outcome: string) {
  if (outcome.includes('Very Positive')) return 'bg-green-100 text-green-800'
  if (outcome.includes('Positive')) return 'bg-emerald-100 text-emerald-800'
  if (outcome.includes('Neutral')) return 'bg-slate-100 text-slate-600'
  if (outcome.includes('Follow')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-700'
}

export default async function DashboardPage() {
  const session = await getSession()
  const supabase = getSupabase()
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthLabel = format(today, 'MMMM yyyy')

  const [
    { count: myTotal },
    { count: myVisits },
    { count: myCalls },
    { data: myProviders },
    { data: recentMine },
    { data: recentTeam },
  ] = await Promise.all([
    supabase.from('rep_activities').select('*', { count: 'exact', head: true })
      .eq('rep_name', session!.repName).gte('visit_date', monthStart),
    supabase.from('rep_activities').select('*', { count: 'exact', head: true })
      .eq('rep_name', session!.repName).gte('visit_date', monthStart)
      .eq('call_type', 'In-person Visit'),
    supabase.from('rep_activities').select('*', { count: 'exact', head: true })
      .eq('rep_name', session!.repName).gte('visit_date', monthStart)
      .eq('call_type', 'Phone Call'),
    supabase.from('rep_activities').select('provider_id')
      .eq('rep_name', session!.repName).gte('visit_date', monthStart),
    supabase.from('rep_activities')
      .select('id, visit_date, provider_name, call_type, outcome, products_discussed')
      .eq('rep_name', session!.repName)
      .order('visit_date', { ascending: false })
      .limit(8),
    supabase.from('rep_activities')
      .select('id, visit_date, rep_name, provider_name, call_type, outcome')
      .order('visit_date', { ascending: false })
      .limit(10),
  ])

  const uniqueProviders = new Set((myProviders || []).map((a: { provider_id: number }) => a.provider_id)).size

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {session!.repName}</h1>
          <p className="text-slate-500 text-sm mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link
          href="/dashboard/log"
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Log Activity
        </Link>
      </div>

      {/* KPIs */}
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">My activity — {monthLabel}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KPICard label="Total activities" value={myTotal ?? 0} />
        <KPICard label="In-person visits" value={myVisits ?? 0} />
        <KPICard label="Phone calls" value={myCalls ?? 0} />
        <KPICard label="Providers covered" value={uniqueProviders} />
      </div>

      {/* My recent activities */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">My recent activities</h2>
        {!recentMine || recentMine.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No activities yet. <Link href="/dashboard/log" className="text-green-700 font-medium">Log your first one.</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {(recentMine as RepActivity[]).map((a, i) => (
                  <tr key={a.id} className={i < recentMine!.length - 1 ? 'border-b border-slate-50' : ''}>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{format(new Date(a.visit_date + 'T12:00:00'), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.provider_name}</td>
                    <td className="px-4 py-3 text-slate-500">{a.call_type}</td>
                    <td className="px-4 py-3 text-slate-500">{(a.products_discussed || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${outcomeColor(a.outcome)}`}>
                        {a.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team feed */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Team — recent activity</h2>
        {!recentTeam || recentTeam.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No team activity yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rep</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {(recentTeam as RepActivity[]).map((a, i) => (
                  <tr key={a.id} className={i < recentTeam!.length - 1 ? 'border-b border-slate-50' : ''}>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{format(new Date(a.visit_date + 'T12:00:00'), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-slate-600">{a.rep_name}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.provider_name}</td>
                    <td className="px-4 py-3 text-slate-500">{a.call_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${outcomeColor(a.outcome)}`}>
                        {a.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
