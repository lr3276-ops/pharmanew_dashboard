import { parseISO, differenceInDays, isPast, isToday } from 'date-fns'
import { STAGES, STAGE_CLASSES, PRIORITY_CLASSES } from '../lib/constants.js'

function daysAgo(dateStr) {
  if (!dateStr) return null
  return differenceInDays(new Date(), parseISO(dateStr))
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return isPast(parseISO(dateStr + 'T23:59:59'))
}

function PriorityDot({ priority }) {
  const colors = { High: 'bg-red-500', Medium: 'bg-orange-400', Low: 'bg-gray-300' }
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[priority] || colors.Low}`} />
}

function PartnerCard({ partner, onSelect }) {
  const days = daysAgo(partner.last_activity_date)
  const overdue = isOverdue(partner.next_followup_date)

  return (
    <div
      onClick={() => onSelect(partner.id)}
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md group select-none ${
        overdue ? 'border-red-300 hover:border-red-400' : 'border-pn-border hover:border-pn-navy'
      }`}
    >
      {/* Company name + priority dot */}
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot priority={partner.priority} />
        <h3 className="font-bold text-pn-dark text-sm leading-tight group-hover:text-pn-navy transition-colors flex-1">
          {partner.company_name}
        </h3>
      </div>

      {/* Country */}
      {partner.country && (
        <p className="text-xs text-pn-faint mb-2 pl-4">{partner.country}</p>
      )}

      {/* Products */}
      {partner.products?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {partner.products.slice(0, 2).map(pr => (
            <span key={pr} className="text-[10px] bg-pn-sky text-pn-navy px-1.5 py-0.5 rounded-md font-semibold">{pr}</span>
          ))}
          {partner.products.length > 2 && (
            <span className="text-[10px] bg-pn-bg text-pn-faint px-1.5 py-0.5 rounded-md font-semibold">
              +{partner.products.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Therapeutic area */}
      {partner.therapeutic_area && (
        <p className="text-[10px] text-pn-muted mb-2 font-medium">{partner.therapeutic_area}</p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-pn-border">
        <span className={`text-[10px] font-semibold ${
          days === null ? 'text-pn-faint' : days > 30 ? 'text-pn-orange-dark' : 'text-pn-faint'
        }`}>
          {days === null ? 'No activity' : days === 0 ? 'Today' : `${days}d ago`}
        </span>

        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CLASSES[partner.priority]}`}>
          {partner.priority}
        </span>
      </div>

      {/* Overdue banner */}
      {overdue && (
        <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-md text-center">
          ⚠ Follow-up overdue
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ stage, partners, onSelect }) {
  const stageHeaderColors = {
    'Lead':           'text-gray-600',
    'Contacted':      'text-sky-700',
    'NDA Signed':     'text-blue-700',
    'Term Sheet':     'text-violet-700',
    'Active Partner': 'text-emerald-700',
    'Closed / Lost':  'text-red-600',
  }

  const stageBorderTop = {
    'Lead':           'border-t-2 border-t-gray-300',
    'Contacted':      'border-t-2 border-t-sky-400',
    'NDA Signed':     'border-t-2 border-t-blue-500',
    'Term Sheet':     'border-t-2 border-t-violet-500',
    'Active Partner': 'border-t-2 border-t-emerald-500',
    'Closed / Lost':  'border-t-2 border-t-red-400',
  }

  return (
    <div className="flex-shrink-0 w-60">
      {/* Column header */}
      <div className={`bg-white rounded-t-xl px-3 py-2.5 mb-2 ${stageBorderTop[stage] || 'border-t-2 border-t-gray-300'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-extrabold uppercase tracking-wide ${stageHeaderColors[stage] || 'text-gray-600'}`}>
            {stage}
          </span>
          <span className="text-xs font-bold text-pn-faint bg-pn-bg px-1.5 py-0.5 rounded-full">
            {partners.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {partners.map(p => (
          <PartnerCard key={p.id} partner={p} onSelect={onSelect} />
        ))}
        {partners.length === 0 && (
          <div className="border-2 border-dashed border-pn-border rounded-xl p-5 text-center">
            <p className="text-xs text-pn-faint">No partners</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanView({ partners, onSelect }) {
  return (
    <div className="flex gap-4 px-6 py-5 overflow-x-auto pb-10" style={{ minHeight: 'calc(100vh - 112px)' }}>
      {STAGES.map(stage => (
        <KanbanColumn
          key={stage}
          stage={stage}
          partners={partners.filter(p => p.stage === stage)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
