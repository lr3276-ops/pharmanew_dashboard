export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { format, startOfMonth } from 'date-fns'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { RepActivity } from '@/types'

function KPICard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-pn-border p-5">
      <p className="text-xs font-bold text-pn-faint uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${accent || 'text-pn-dark'}`}>{value}</p>
      {sub && <p className="text-xs text-pn-faint mt-1">{sub}</p>}
    </div>
  )
}

function outcomeColor(outcome: string | null | undefined) {
  if (!outcome) return 'bg-pn-bg text-pn-muted'
  if (outcome.includes('Very Positive')) return 'bg-pn-lime text-pn-green-dark'
  if (outcome.includes('Positive')) return 'bg-green-100 text-green-800'
  if (outcome.includes('Neutral')) return 'bg-pn-bg text-pn-muted'
  if (outcome.includes('Follow')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-700'
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
          <p className="font-semibold mb-1">Missing Supabase environment variables</p>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING'}</p>
          <p>SUPABASE_SERVICE_ROLE_KEY: {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING'}</p>
        </div>
      </div>
    )
  }

  let supabaseError: string | null = null
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthLabel = format(today, 'MMMM yyyy')

  let myTotal = 0, myVisits = 0, myCalls = 0
  let myProviders: { provider_id: number }[] = []
  let recentMine: RepActivity[] = []
  let recentTeam: RepActivity[] = []

  try {
  const supabase = getSupabase()
  const [
    { count: _myTotal },
    { count: _myVisits },
    { count: _myCalls },
    { data: _myProviders },
    { data: _recentMine },
    { data: _recentTeam },
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
    myTotal = _myTotal ?? 0
    myVisits = _myVisits ?? 0
    myCalls = _myCalls ?? 0
    myProviders = (_myProviders || []) as { provider_id: number }[]
    recentMine = (_recentMine || []) as RepActivity[]
    recentTeam = (_recentTeam || []) as RepActivity[]
  } catch (e: unknown) {
    supabaseError = e instanceof Error ? e.message : String(e)
  }

  if (supabaseError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
          <p className="font-semibold mb-1">Supabase connection error</p>
          <p className="font-mono text-xs mt-2 break-all">{supabaseError}</p>
          <p className="mt-3 text-pn-muted">Check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct in Vercel.</p>
        </div>
      </div>
    )
  }

  const uniqueProviders = new Set(myProviders.map((a) => a.provider_id)).size

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-pn-dark">Welcome back, {session!.repName}</h1>
          <p className="text-pn-muted text-sm mt-1 font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link
          href="/dashboard/log"
          className="flex items-center gap-2 bg-pn-green hover:bg-pn-green-dark text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Log Activity
        </Link>
      </div>

      {/* KPIs */}
      <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-3">My activity — {monthLabel}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KPICard label="Total activities" value={myTotal ?? 0} accent="text-pn-navy" />
        <KPICard label="In-person visits" value={myVisits ?? 0} accent="text-pn-green" />
        <KPICard label="Phone calls" value={myCalls ?? 0} accent="text-pn-blue" />
        <KPICard label="Providers covered" value={uniqueProviders} accent="text-pn-navy" />
      </div>

      {/* My recent activities */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-pn-dark mb-3">My recent activities</h2>
        {!recentMine || recentMine.length === 0 ? (
          <div className="bg-white rounded-xl border border-pn-border p-8 text-center text-pn-faint text-sm">
            No activities yet. <Link href="/dashboard/log" className="text-pn-green font-bold">Log your first one.</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pn-border bg-pn-bg">
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Products</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {(recentMine as RepActivity[]).map((a, i) => (
                  <tr key={a.id} className={i < recentMine!.length - 1 ? 'border-b border-pn-border' : ''}>
                    <td className="px-4 py-3 text-pn-muted whitespace-nowrap">{a.visit_date ? format(new Date(a.visit_date + 'T12:00:00'), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-pn-dark">{a.provider_name}</td>
                    <td className="px-4 py-3 text-pn-muted">{a.call_type}</td>
                    <td className="px-4 py-3 text-pn-muted">{(a.products_discussed || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${outcomeColor(a.outcome)}`}>
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
        <h2 className="text-sm font-bold text-pn-dark mb-3">Team — recent activity</h2>
        {!recentTeam || recentTeam.length === 0 ? (
          <div className="bg-white rounded-xl border border-pn-border p-8 text-center text-pn-faint text-sm">
            No team activity yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pn-border bg-pn-bg">
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Rep</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {(recentTeam as RepActivity[]).map((a, i) => (
                  <tr key={a.id} className={i < recentTeam!.length - 1 ? 'border-b border-pn-border' : ''}>
                    <td className="px-4 py-3 text-pn-muted whitespace-nowrap">{a.visit_date ? format(new Date(a.visit_date + 'T12:00:00'), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-pn-muted font-medium">{a.rep_name}</td>
                    <td className="px-4 py-3 font-semibold text-pn-dark">{a.provider_name}</td>
                    <td className="px-4 py-3 text-pn-muted">{a.call_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${outcomeColor(a.outcome)}`}>
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
