import { useState } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import {
  PROJECT_COLORS,
  DEAL_PROJECT_STATUSES,
  DEAL_PROJECT_STATUS_CLASSES,
  MILESTONE_NEXT,
} from '../../lib/constants.js'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function ProgressBar({ milestones }) {
  const total = milestones?.length || 0
  if (!total) return <span className="text-[11px] text-pn-faint italic">No milestones</span>
  const done = milestones.filter(m => m.status === 'Done').length
  const pct = Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-pn-border rounded-full h-1.5 overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-pn-green' : 'bg-pn-blue'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-pn-faint whitespace-nowrap">{done}/{total}</span>
    </div>
  )
}

function MilestoneDot({ status }) {
  if (status === 'Done') return (
    <div className="w-5 h-5 rounded-full bg-pn-green flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
  if (status === 'In Progress') return (
    <div className="w-5 h-5 rounded-full border-2 border-pn-blue bg-pn-sky flex-shrink-0" />
  )
  return <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white flex-shrink-0" />
}

// ── ProjectRow ────────────────────────────────────────────────────────────────
function ProjectRow({ project, partners, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    owner: project.owner ?? '',
    start_date: project.start_date ?? '',
    target_date: project.target_date ?? '',
    partner_id: project.partner_id ?? '',
    color: project.color,
  })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [newMilestone, setNewMilestone] = useState('')
  const [addingMs, setAddingMs] = useState(false)
  const [togglingMs, setTogglingMs] = useState(null)

  const milestones = project.milestones || []
  const partner = partners.find(p => p.id === project.partner_id)
  const doneCt = milestones.filter(m => m.status === 'Done').length
  const isOverdue = project.target_date &&
    isPast(parseISO(project.target_date + 'T23:59:59')) &&
    project.status !== 'Completed'

  function resetForm() {
    setForm({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      owner: project.owner ?? '',
      start_date: project.start_date ?? '',
      target_date: project.target_date ?? '',
      partner_id: project.partner_id ?? '',
      color: project.color,
    })
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onUpdate(project.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        owner: form.owner.trim() || null,
        start_date: form.start_date || null,
        target_date: form.target_date || null,
        partner_id: form.partner_id || null,
        color: form.color,
      })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function toggleMilestone(id) {
    setTogglingMs(id)
    const updated = milestones.map(m =>
      m.id === id ? { ...m, status: MILESTONE_NEXT[m.status] } : m
    )
    try { await onUpdate(project.id, { milestones: updated }) } catch (_) {}
    setTogglingMs(null)
  }

  async function addMilestone() {
    if (!newMilestone.trim()) return
    setAddingMs(true)
    const updated = [
      ...milestones,
      { id: uid(), title: newMilestone.trim(), status: 'Not Started', due_date: null },
    ]
    try {
      await onUpdate(project.id, { milestones: updated })
      setNewMilestone('')
    } catch (_) {}
    setAddingMs(false)
  }

  async function deleteMilestone(id) {
    const updated = milestones.filter(m => m.id !== id)
    try { await onUpdate(project.id, { milestones: updated }) } catch (_) {}
  }

  async function handleDelete() {
    setDeleting(true)
    try { await onDelete(project.id) }
    catch (err) { setError(err.message); setDeleting(false); setConfirmDelete(false) }
  }

  const inp = 'w-full px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy bg-white'
  const labelCls = 'block text-xs font-bold text-pn-faint uppercase tracking-wider mb-1'

  return (
    <div className={`border-b border-pn-border last:border-0 ${isOverdue ? 'bg-red-50/40' : ''}`}>

      {/* ── Row header ── */}
      {!editing ? (
        <div
          className="flex items-start gap-3 px-5 py-4 hover:bg-pn-bg/70 transition-colors cursor-pointer group"
          onClick={() => setExpanded(e => !e)}
        >
          <svg
            className={`w-3.5 h-3.5 text-pn-faint flex-shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: project.color }} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-pn-dark">{project.name}</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${DEAL_PROJECT_STATUS_CLASSES[project.status]}`}>
                {project.status}
              </span>
              {isOverdue && (
                <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">Overdue</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {partner && <span className="text-xs font-medium text-pn-muted">{partner.company_name}</span>}
              {project.owner && <span className="text-xs text-pn-faint">{project.owner}</span>}
              {project.target_date && (
                <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-pn-faint'}`}>
                  Due {format(parseISO(project.target_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            {milestones.length > 0 && (
              <div className="mt-2">
                <ProgressBar milestones={milestones} />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { setEditing(true); setExpanded(true) }}
              className="p-1.5 text-pn-faint hover:text-pn-navy hover:bg-white rounded-lg transition-colors"
              title="Edit project"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-pn-faint hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-white border border-pn-border rounded-lg px-2 py-1">
                <span className="text-xs text-pn-dark font-medium">Delete?</span>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-60">
                  {deleting ? '…' : 'Yes'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="text-xs font-bold text-pn-faint hover:text-pn-dark">No</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit form ── */
        <div className="px-5 py-5 bg-pn-bg space-y-3">
          <p className="text-xs font-bold text-pn-dark">Edit project</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Name *</label>
              <input type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inp} placeholder="Project name" autoFocus />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={inp}>
                {DEAL_PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Partner</label>
              <select value={form.partner_id}
                onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))}
                className={inp}>
                <option value="">No partner linked</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Owner / Lead</label>
              <input type="text" value={form.owner}
                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                className={inp} placeholder="e.g. Jane Doe" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Start date</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className={inp} />
              </div>
              <div>
                <label className={labelCls}>Target date</label>
                <input type="date" value={form.target_date}
                  onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  className={inp} />
              </div>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Goals, context, or key notes…"
                className={`${inp} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                      form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                    }`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); resetForm(); setError('') }}
              className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-1.5 rounded-lg border border-pn-border-mid transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Expanded detail ── */}
      {expanded && !editing && (
        <div className="px-5 pb-5 pl-12 space-y-4">
          {project.description && (
            <p className="text-sm text-pn-muted leading-relaxed">{project.description}</p>
          )}

          {/* Meta row */}
          {(project.start_date || project.partner_id) && (
            <div className="flex gap-4 flex-wrap text-xs text-pn-faint">
              {project.start_date && (
                <span>Started {format(parseISO(project.start_date), 'MMM d, yyyy')}</span>
              )}
              {partner && (
                <span>Partner: <span className="font-semibold text-pn-muted">{partner.company_name}</span></span>
              )}
            </div>
          )}

          {/* Milestones */}
          <div>
            <p className="text-xs font-bold text-pn-faint uppercase tracking-wider mb-2">
              Milestones {milestones.length > 0 && `· ${doneCt} of ${milestones.length} done`}
            </p>

            {milestones.length === 0 ? (
              <p className="text-xs text-pn-faint italic mb-2">No milestones yet — add one below.</p>
            ) : (
              <div className="space-y-1.5 mb-3">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5 group/m">
                    <button
                      onClick={() => toggleMilestone(m.id)}
                      disabled={togglingMs === m.id}
                      title={`Status: ${m.status} — click to advance`}
                      className="flex-shrink-0 disabled:opacity-50"
                    >
                      <MilestoneDot status={m.status} />
                    </button>
                    <span className={`flex-1 text-sm min-w-0 ${m.status === 'Done' ? 'line-through text-pn-faint' : 'text-pn-dark'}`}>
                      {m.title}
                    </span>
                    {m.status !== 'Done' && (
                      <span className="text-[11px] text-pn-faint flex-shrink-0">{m.status}</span>
                    )}
                    <button
                      onClick={() => deleteMilestone(m.id)}
                      className="p-0.5 text-pn-faint hover:text-red-500 opacity-0 group-hover/m:opacity-100 transition-opacity flex-shrink-0"
                      title="Remove milestone"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add milestone */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addMilestone() }}
                placeholder="Add a milestone or phase…"
                className="flex-1 px-2.5 py-1.5 text-xs border border-pn-border-mid rounded-lg focus:outline-none focus:ring-1 focus:ring-pn-navy text-pn-dark"
              />
              <button
                onClick={addMilestone}
                disabled={addingMs || !newMilestone.trim()}
                className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                {addingMs ? '…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── New project form ──────────────────────────────────────────────────────────
function NewProjectForm({ partners, onCreate, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'Planning',
    owner: '',
    start_date: '',
    target_date: '',
    partner_id: '',
    color: PROJECT_COLORS[0],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onCreate({
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        owner: form.owner.trim() || null,
        start_date: form.start_date || null,
        target_date: form.target_date || null,
        partner_id: form.partner_id || null,
        color: form.color,
        milestones: [],
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const inp = 'w-full px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy bg-white'
  const labelCls = 'block text-xs font-bold text-pn-faint uppercase tracking-wider mb-1'

  return (
    <div className="bg-white border border-pn-border rounded-xl p-5 mb-5 space-y-3">
      <p className="text-xs font-bold text-pn-dark">New project</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Name *</label>
          <input type="text" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            autoFocus placeholder="e.g. ACME Corp — Licensing Agreement"
            className={inp}
            onKeyDown={e => { if (e.key === 'Escape') onCancel() }} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className={inp}>
            {DEAL_PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Partner</label>
          <select value={form.partner_id}
            onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))}
            className={inp}>
            <option value="">No partner linked</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Owner / Lead</label>
          <input type="text" value={form.owner}
            onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
            className={inp} placeholder="e.g. Jane Doe" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className={inp} />
          </div>
          <div>
            <label className={labelCls}>Target date</label>
            <input type="date" value={form.target_date}
              onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
              className={inp} />
          </div>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Description</label>
          <textarea value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} placeholder="Goals, context, key notes…"
            className={`${inp} resize-none`} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PROJECT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                }`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
          className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors">
          {saving ? 'Creating…' : 'Create project'}
        </button>
        <button onClick={onCancel}
          className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-1.5 rounded-lg border border-pn-border-mid transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function PartnerProjectsView({ partnerProjects, partners, onCreate, onUpdate, onDelete }) {
  const [showNew, setShowNew] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = statusFilter === 'All'
    ? partnerProjects
    : partnerProjects.filter(p => p.status === statusFilter)

  const counts = {
    All: partnerProjects.length,
    Planning: partnerProjects.filter(p => p.status === 'Planning').length,
    Active: partnerProjects.filter(p => p.status === 'Active').length,
    'On Hold': partnerProjects.filter(p => p.status === 'On Hold').length,
    Completed: partnerProjects.filter(p => p.status === 'Completed').length,
  }

  const filterTabs = ['All', ...DEAL_PROJECT_STATUSES]

  return (
    <div className="p-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-pn-dark">Deal Projects</h2>
          <p className="text-xs text-pn-faint mt-0.5">
            {counts.Active} active · {counts.Completed} completed
          </p>
        </div>
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-pn-navy hover:bg-pn-navy-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === tab
                ? 'bg-pn-navy text-white'
                : 'bg-white border border-pn-border text-pn-muted hover:text-pn-dark hover:border-pn-border-mid'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1.5 ${statusFilter === tab ? 'text-white/70' : 'text-pn-faint'}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New project form */}
      {showNew && (
        <NewProjectForm
          partners={partners}
          onCreate={async (data) => { await onCreate(data); setShowNew(false) }}
          onCancel={() => setShowNew(false)}
        />
      )}

      {/* Project list */}
      {filtered.length === 0 && !showNew ? (
        <div className="bg-white rounded-xl border border-pn-border p-12 text-center">
          <p className="text-pn-faint text-sm">
            {statusFilter === 'All'
              ? 'No projects yet. Create one to start tracking milestones.'
              : `No ${statusFilter.toLowerCase()} projects.`}
          </p>
        </div>
      ) : filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
          {filtered.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              partners={partners}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
