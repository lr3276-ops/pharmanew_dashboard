export const dynamic = 'force-dynamic'
import { getSupabase } from '@/lib/supabase'
import { format, differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { RepActivity, Provider } from '@/types'

function outcomeColor(outcome: string) {
  if (outcome.includes('Very Positive')) return 'bg-pn-lime text-pn-green-dark'
  if (outcome.includes('Positive')) return 'bg-green-100 text-green-800'
  if (outcome.includes('Neutral')) return 'bg-pn-bg text-pn-muted'
  if (outcome.includes('Follow')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-700'
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const id = parseInt(params.id)

  const [{ data: provider }, { data: activities }] = await Promise.all([
    supabase.from('providers').select('*').eq('id', id).single(),
    supabase.from('rep_activities')
      .select('*')
      .eq('provider_id', id)
      .order('visit_date', { ascending: false }),
  ])

  if (!provider) notFound()

  const p = provider as Provider
  const acts = (activities || []) as RepActivity[]

  const lastActivity = acts[0]
  const nextVisit = acts.find(a => a.next_visit_date)?.next_visit_date
  const daysSinceVisit = lastActivity ? differenceInDays(new Date(), parseISO(lastActivity.visit_date)) : null

  return (
    <div className="p-8 max-w-4xl">
      {/* 30-day overdue banner */}
      {(daysSinceVisit === null || daysSinceVisit >= 30) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-extrabold text-red-700">
              {daysSinceVisit === null ? 'This provider has never been visited' : `This provider has not been visited in ${daysSinceVisit} days`}
            </p>
            <p className="text-xs text-red-500 mt-0.5">Prioritize on your next route.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/providers" className="text-xs font-bold text-pn-faint hover:text-pn-navy flex items-center gap-1 mb-4 uppercase tracking-wider transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to providers
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-pn-dark">{p.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="inline-block px-2 py-0.5 bg-pn-sky text-pn-navy text-xs rounded font-bold">{p.specialty}</span>
              <span className="text-pn-muted text-sm font-medium">{p.city}, PR</span>
              {p.phone && <span className="text-pn-muted text-sm">{p.phone}</span>}
              {p.npi && <span className="text-pn-faint text-xs font-medium">NPI: {p.npi}</span>}
            </div>
          </div>
          <Link
            href="/dashboard/log"
            className="flex items-center gap-2 bg-pn-green hover:bg-pn-green-dark text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Log visit
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-pn-border p-4">
          <p className="text-xs text-pn-faint uppercase tracking-wider font-bold">Total visits</p>
          <p className="text-2xl font-extrabold text-pn-navy mt-1">{acts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-pn-border p-4">
          <p className="text-xs text-pn-faint uppercase tracking-wider font-bold">Last visit</p>
          <p className="text-sm font-semibold text-pn-dark mt-1">
            {lastActivity ? format(new Date(lastActivity.visit_date + 'T12:00:00'), 'MMM d, yyyy') : '—'}
          </p>
          {lastActivity && <p className="text-xs text-pn-faint mt-0.5">by {lastActivity.rep_name}</p>}
        </div>
        <div className="bg-white rounded-xl border border-pn-border p-4">
          <p className="text-xs text-pn-faint uppercase tracking-wider font-bold">Next visit</p>
          <p className={`text-sm font-semibold mt-1 ${nextVisit ? 'text-pn-green' : 'text-pn-faint'}`}>
            {nextVisit ? format(new Date(nextVisit + 'T12:00:00'), 'MMM d, yyyy') : 'Not scheduled'}
          </p>
        </div>
      </div>

      {/* Best visit info banner */}
      {(p.best_visit_days || p.best_visit_times) && (
        <div className="bg-pn-sky border border-[#b6ddf5] rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-4 h-4 text-pn-blue mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex gap-6 flex-wrap">
            {p.best_visit_days && (
              <div>
                <p className="text-xs font-bold text-pn-navy uppercase tracking-wider">Best days to visit</p>
                <p className="text-sm text-pn-dark mt-0.5 font-medium">{p.best_visit_days}</p>
              </div>
            )}
            {p.best_visit_times && (
              <div>
                <p className="text-xs font-bold text-pn-navy uppercase tracking-wider">Best times to visit</p>
                <p className="text-sm text-pn-dark mt-0.5 font-medium">{p.best_visit_times}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {!p.best_visit_days && !p.best_visit_times && <div className="mb-8" />}

      {/* Activity history */}
      <h2 className="text-sm font-bold text-pn-dark mb-3">Activity history</h2>
      {acts.length === 0 ? (
        <div className="bg-white rounded-xl border border-pn-border p-8 text-center text-pn-faint text-sm">
          No activities logged yet for this provider.
        </div>
      ) : (
        <div className="space-y-3">
          {acts.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-pn-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-bold text-pn-dark">{format(new Date(a.visit_date + 'T12:00:00'), 'MMMM d, yyyy')}</p>
                  {(a.time_arrived || a.time_left) && (
                    <span className="text-pn-faint text-xs font-medium bg-pn-bg px-2 py-0.5 rounded">
                      {a.time_arrived && a.time_left
                        ? `${a.time_arrived} – ${a.time_left}`
                        : a.time_arrived
                        ? `Arrived ${a.time_arrived}`
                        : `Left ${a.time_left}`}
                    </span>
                  )}
                  <span className="text-pn-muted text-sm">{a.call_type}</span>
                  <span className="text-pn-faint text-sm">· {a.rep_name}</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${outcomeColor(a.outcome)}`}>
                  {a.outcome}
                </span>
              </div>

              {a.products_discussed && a.products_discussed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {a.products_discussed.map(prod => (
                    <span key={prod} className="px-2 py-0.5 bg-pn-sky text-pn-navy text-xs rounded font-semibold">{prod}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mb-3">
                {a.samples_left && (
                  <span className="text-xs text-pn-muted flex items-center gap-1">
                    <svg className="w-3 h-3 text-pn-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Samples left
                  </span>
                )}
                {a.literature_left && (
                  <span className="text-xs text-pn-muted flex items-center gap-1">
                    <svg className="w-3 h-3 text-pn-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Literature left
                  </span>
                )}
                {a.materials_left && a.materials_left.length > 0 && (
                  <div className="flex gap-1.5">
                    {a.materials_left.map(m => (
                      <span key={m} className="text-xs text-pn-muted flex items-center gap-1">
                        <svg className="w-3 h-3 text-pn-blue" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {a.gatekeeper_name && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-0.5">Gatekeeper</p>
                  <p className="text-sm text-pn-muted">{a.gatekeeper_name}{a.gatekeeper_role ? ` · ${a.gatekeeper_role}` : ''}</p>
                </div>
              )}
              {a.next_steps && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-0.5">Next steps</p>
                  <p className="text-sm text-pn-dark">{a.next_steps}</p>
                </div>
              )}
              {a.notes && (
                <div>
                  <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-0.5">Notes</p>
                  <p className="text-sm text-pn-muted">{a.notes}</p>
                </div>
              )}
              {a.next_visit_date && (
                <p className="text-xs text-pn-green font-bold mt-2">
                  Next visit: {format(new Date(a.next_visit_date + 'T12:00:00'), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
