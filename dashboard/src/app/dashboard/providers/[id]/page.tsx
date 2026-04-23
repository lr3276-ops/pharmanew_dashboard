export const dynamic = 'force-dynamic'
import { getSupabase } from '@/lib/supabase'
import { format } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { RepActivity, Provider } from '@/types'

function outcomeColor(outcome: string) {
  if (outcome.includes('Very Positive')) return 'bg-green-100 text-green-800'
  if (outcome.includes('Positive')) return 'bg-emerald-100 text-emerald-800'
  if (outcome.includes('Neutral')) return 'bg-slate-100 text-slate-600'
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/providers" className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to providers
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{p.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-medium">{p.specialty}</span>
              <span className="text-slate-500 text-sm">{p.city}, PR</span>
              {p.phone && <span className="text-slate-500 text-sm">{p.phone}</span>}
            </div>
          </div>
          <Link
            href={`/dashboard/log`}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total visits</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{acts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Last visit</p>
          <p className="text-sm font-semibold text-slate-800 mt-1">
            {lastActivity ? format(new Date(lastActivity.visit_date + 'T12:00:00'), 'MMM d, yyyy') : '—'}
          </p>
          {lastActivity && <p className="text-xs text-slate-400 mt-0.5">by {lastActivity.rep_name}</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Next visit</p>
          <p className={`text-sm font-semibold mt-1 ${nextVisit ? 'text-green-700' : 'text-slate-400'}`}>
            {nextVisit ? format(new Date(nextVisit + 'T12:00:00'), 'MMM d, yyyy') : 'Not scheduled'}
          </p>
        </div>
      </div>

      {p.best_visit_times && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Best time to visit</p>
            <p className="text-sm text-amber-900 mt-0.5">{p.best_visit_times}</p>
          </div>
        </div>
      )}
      {!p.best_visit_times && <div className="mb-8" />}

      {/* Activity history */}
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Activity history</h2>
      {acts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          No activities logged yet for this provider.
        </div>
      ) : (
        <div className="space-y-3">
          {acts.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-medium text-slate-800">{format(new Date(a.visit_date + 'T12:00:00'), 'MMMM d, yyyy')}</p>
                  {(a.time_arrived || a.time_left) && (
                    <span className="text-slate-400 text-xs">
                      {a.time_arrived && a.time_left
                        ? `${a.time_arrived} – ${a.time_left}`
                        : a.time_arrived
                        ? `Arrived ${a.time_arrived}`
                        : `Left ${a.time_left}`}
                    </span>
                  )}
                  <span className="text-slate-400 text-sm">{a.call_type}</span>
                  <span className="text-slate-400 text-sm">· {a.rep_name}</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${outcomeColor(a.outcome)}`}>
                  {a.outcome}
                </span>
              </div>

              {a.products_discussed && a.products_discussed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {a.products_discussed.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{p}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mb-3">
                {a.samples_left && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Samples left
                  </span>
                )}
                {a.literature_left && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Literature left
                  </span>
                )}
              </div>

              {a.next_steps && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Next steps</p>
                  <p className="text-sm text-slate-700">{a.next_steps}</p>
                </div>
              )}
              {a.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                  <p className="text-sm text-slate-600">{a.notes}</p>
                </div>
              )}
              {a.next_visit_date && (
                <p className="text-xs text-green-700 font-medium mt-2">
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
