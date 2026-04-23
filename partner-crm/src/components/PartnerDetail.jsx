import { useState, useEffect, useRef } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase.js'
import { STAGES, STAGE_CLASSES, PRIORITY_CLASSES } from '../lib/constants.js'

function Section({ title, children }) {
  return (
    <div className="py-4 border-b border-pn-border last:border-0">
      <h3 className="text-xs font-extrabold text-pn-faint uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  if (!children || (typeof children === 'string' && !children.trim())) return null
  return (
    <div className="flex items-start gap-3 mb-2 last:mb-0">
      <span className="text-xs font-semibold text-pn-faint w-32 flex-shrink-0 pt-0.5 leading-tight">{label}</span>
      <span className="text-sm text-pn-dark leading-snug flex-1">{children}</span>
    </div>
  )
}

export default function PartnerDetail({ partner, onClose, onUpdate, onDelete, onEdit }) {
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [author, setAuthor] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [stageBusy, setStageBusy] = useState(false)
  const notesEndRef = useRef(null)

  useEffect(() => {
    loadNotes()
  }, [partner.id])

  async function loadNotes() {
    setNotesLoading(true)
    const { data } = await supabase
      .from('partner_notes')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: true })
    setNotes(data || [])
    setNotesLoading(false)
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!newNote.trim()) return
    setSavingNote(true)
    const { data, error } = await supabase
      .from('partner_notes')
      .insert([{ partner_id: partner.id, content: newNote.trim(), author: author.trim() || null }])
      .select()
      .single()
    if (!error && data) {
      setNotes(prev => [...prev, data])
      setNewNote('')
      // bump last activity date
      await onUpdate(partner.id, { last_activity_date: new Date().toISOString().split('T')[0] })
      setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    }
    setSavingNote(false)
  }

  async function changeStage(stage) {
    if (stage === partner.stage) return
    setStageBusy(true)
    await onUpdate(partner.id, { stage, last_activity_date: new Date().toISOString().split('T')[0] })
    setStageBusy(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${partner.company_name}"? This cannot be undone.`)) return
    await onDelete(partner.id)
  }

  const overdue = partner.next_followup_date && isPast(parseISO(partner.next_followup_date + 'T23:59:59'))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[540px] max-w-[95vw] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-pn-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-pn-dark leading-tight mb-1 truncate">
                {partner.company_name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {partner.country && (
                  <span className="text-sm text-pn-muted font-medium">{partner.country}</span>
                )}
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${PRIORITY_CLASSES[partner.priority]}`}>
                  {partner.priority} priority
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onEdit}
                className="text-xs font-bold text-pn-blue hover:text-pn-navy border border-pn-border hover:border-pn-navy px-3 py-1.5 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-pn-faint hover:text-pn-dark hover:bg-pn-bg rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stage selector */}
        <div className="px-6 py-3 bg-pn-bg border-b border-pn-border flex-shrink-0">
          <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-2">Pipeline Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s}
                onClick={() => changeStage(s)}
                disabled={stageBusy}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                  partner.stage === s
                    ? `${STAGE_CLASSES[s]} border-current`
                    : 'bg-white text-pn-muted border-pn-border hover:border-pn-navy hover:text-pn-navy'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Contact */}
          {(partner.contact_name || partner.contact_email || partner.contact_phone) && (
            <Section title="Primary Contact">
              <Field label="Name">
                {[partner.contact_name, partner.contact_title].filter(Boolean).join(' · ')}
              </Field>
              <Field label="Email">
                {partner.contact_email && (
                  <a href={`mailto:${partner.contact_email}`} className="text-pn-blue hover:underline">
                    {partner.contact_email}
                  </a>
                )}
              </Field>
              <Field label="Phone">{partner.contact_phone}</Field>
            </Section>
          )}

          {/* Products */}
          {(partner.products?.length > 0 || partner.therapeutic_area) && (
            <Section title="Products & Therapeutic Area">
              {partner.products?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {partner.products.map(pr => (
                    <span key={pr} className="bg-pn-sky text-pn-navy text-xs px-2 py-0.5 rounded-md font-semibold">
                      {pr}
                    </span>
                  ))}
                </div>
              )}
              <Field label="Therapeutic Area">{partner.therapeutic_area}</Field>
            </Section>
          )}

          {/* Timeline */}
          <Section title="Timeline & Source">
            <Field label="Source">{partner.source}</Field>
            <Field label="Last activity">
              {partner.last_activity_date
                ? format(parseISO(partner.last_activity_date), 'MMMM d, yyyy')
                : '—'}
            </Field>
            <Field label="Next follow-up">
              {partner.next_followup_date ? (
                <span className={overdue ? 'text-red-600 font-bold' : ''}>
                  {overdue && '⚠ '}
                  {format(parseISO(partner.next_followup_date), 'MMMM d, yyyy')}
                  {overdue && ' · overdue'}
                </span>
              ) : '—'}
            </Field>
            <Field label="Added">
              {format(parseISO(partner.created_at), 'MMMM d, yyyy')}
            </Field>
          </Section>

          {/* Notes / Activity log */}
          <Section title={`Activity Log (${notes.length})`}>
            {notesLoading ? (
              <p className="text-xs text-pn-faint">Loading…</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-pn-faint italic mb-3">No notes yet. Add the first entry below.</p>
            ) : (
              <div className="space-y-2.5 mb-4 max-h-72 overflow-y-auto pr-1">
                {notes.map(note => (
                  <div key={note.id} className="bg-pn-bg rounded-lg border border-pn-border p-3">
                    <p className="text-sm text-pn-dark leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-pn-faint">
                        {format(parseISO(note.created_at), 'MMM d, yyyy · h:mm a')}
                      </span>
                      {note.author && (
                        <>
                          <span className="text-pn-faint text-xs">·</span>
                          <span className="text-[11px] font-bold text-pn-muted">{note.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={notesEndRef} />
              </div>
            )}

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a call log entry or note…"
                rows={3}
                className="w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-sm text-pn-dark placeholder-pn-faint focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent resize-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-3 py-2 border border-pn-border rounded-lg text-xs text-pn-dark placeholder-pn-faint focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={savingNote || !newNote.trim()}
                  className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  {savingNote ? 'Saving…' : 'Add Note'}
                </button>
              </div>
            </form>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pn-border bg-pn-bg flex-shrink-0 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
          >
            Delete partner
          </button>
          <button
            onClick={onClose}
            className="text-xs font-bold text-pn-muted hover:text-pn-dark border border-pn-border hover:border-pn-navy px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
