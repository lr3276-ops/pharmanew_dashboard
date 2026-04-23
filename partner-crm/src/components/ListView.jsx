import { useState } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { STAGE_CLASSES, PRIORITY_CLASSES } from '../lib/constants.js'

function Th({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left px-4 py-3 text-xs font-bold text-pn-faint uppercase tracking-wider cursor-pointer hover:text-pn-dark transition-colors whitespace-nowrap select-none"
    >
      {label}
      <span className="ml-1 opacity-60">{active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    </th>
  )
}

export default function ListView({ partners, onSelect }) {
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...partners].sort((a, b) => {
    let av = a[sortField] ?? ''
    let bv = b[sortField] ?? ''
    if (Array.isArray(av)) av = av[0] ?? ''
    if (Array.isArray(bv)) bv = bv[0] ?? ''
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  function isOverdue(dateStr) {
    return dateStr ? isPast(parseISO(dateStr + 'T23:59:59')) : false
  }

  const thProps = { sortField, sortDir, onSort: handleSort }

  return (
    <div className="px-6 py-5">
      <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
        {/* Count bar */}
        <div className="px-4 py-2.5 border-b border-pn-border bg-pn-bg">
          <span className="text-xs font-bold text-pn-faint">
            {partners.length} partner{partners.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-pn-border">
                <Th label="Company" field="company_name" {...thProps} />
                <Th label="Country" field="country" {...thProps} />
                <Th label="Therapeutic Area" field="therapeutic_area" {...thProps} />
                <Th label="Stage" field="stage" {...thProps} />
                <Th label="Priority" field="priority" {...thProps} />
                <Th label="Last Activity" field="last_activity_date" {...thProps} />
                <Th label="Next Follow-up" field="next_followup_date" {...thProps} />
                <Th label="Source" field="source" {...thProps} />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-pn-faint text-sm">
                    No partners match your filters.
                  </td>
                </tr>
              ) : sorted.map((p, i) => {
                const overdue = isOverdue(p.next_followup_date)
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`cursor-pointer transition-colors hover:bg-pn-bg ${
                      i < sorted.length - 1 ? 'border-b border-pn-border' : ''
                    } ${overdue ? 'bg-red-50/40' : ''}`}
                  >
                    {/* Company + products */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-pn-dark text-sm">{p.company_name}</p>
                      {p.products?.length > 0 && (
                        <p className="text-xs text-pn-faint mt-0.5">
                          {p.products.slice(0, 2).join(', ')}
                          {p.products.length > 2 ? ` +${p.products.length - 2}` : ''}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-pn-muted text-xs">{p.country || '—'}</td>

                    <td className="px-4 py-3 text-pn-muted text-xs">{p.therapeutic_area || '—'}</td>

                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${STAGE_CLASSES[p.stage] || 'bg-gray-100 text-gray-600'}`}>
                        {p.stage}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_CLASSES[p.priority] || PRIORITY_CLASSES.Low}`}>
                        {p.priority}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-pn-muted text-xs whitespace-nowrap">
                      {p.last_activity_date
                        ? format(parseISO(p.last_activity_date), 'MMM d, yyyy')
                        : '—'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.next_followup_date ? (
                        <span className={`text-xs font-semibold ${overdue ? 'text-red-600' : 'text-pn-muted'}`}>
                          {overdue ? '⚠ ' : ''}
                          {format(parseISO(p.next_followup_date), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-pn-faint text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-pn-muted text-xs">{p.source || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
