import { STAGES, PRIORITIES } from '../lib/constants.js'

export default function FilterBar({ filters, setFilters, partners }) {
  const therapeuticAreas = [...new Set(
    partners.map(p => p.therapeutic_area).filter(Boolean)
  )].sort()

  const hasFilters = filters.search || filters.stage || filters.priority || filters.therapeuticArea

  function set(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
  }

  const selectClass = "px-3 py-1.5 border border-pn-border rounded-lg text-xs font-medium text-pn-dark bg-white focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent cursor-pointer"

  return (
    <div className="bg-white border-b border-pn-border px-6 py-2.5 flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pn-faint pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search company, contact, product…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="pl-8 pr-3 py-1.5 border border-pn-border rounded-lg text-xs font-medium text-pn-dark placeholder-pn-faint focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent w-56"
        />
      </div>

      <select value={filters.stage} onChange={e => set('stage', e.target.value)} className={selectClass}>
        <option value="">All stages</option>
        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={filters.priority} onChange={e => set('priority', e.target.value)} className={selectClass}>
        <option value="">All priorities</option>
        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {therapeuticAreas.length > 0 && (
        <select value={filters.therapeuticArea} onChange={e => set('therapeuticArea', e.target.value)} className={selectClass}>
          <option value="">All therapeutic areas</option>
          {therapeuticAreas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={() => setFilters({ search: '', stage: '', priority: '', therapeuticArea: '' })}
          className="text-xs font-bold text-pn-blue hover:text-pn-navy transition-colors ml-1"
        >
          Clear ×
        </button>
      )}
    </div>
  )
}
