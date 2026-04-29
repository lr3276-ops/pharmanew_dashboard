import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { TASK_STATUSES, PRIORITIES, PROJECT_COLORS } from '../../lib/constants.js'
import { format, parseISO } from 'date-fns'

export default function AddTaskModal({ task, tasks = [], projects, onClose, onSave, onDelete, onCreateProject, onUpdateProject }) {
  const isEdit = !!task

  const [form, setForm] = useState({
    title:              task?.title              ?? '',
    description:        task?.description        ?? '',
    status:             task?.status             ?? 'To Do',
    priority:           task?.priority           ?? 'Medium',
    assignee:           task?.assignee           ?? '',
    due_date:           task?.due_date           ?? '',
    project_id:         task?.project_id         ?? '',
    blocked_by_task_id: task?.blocked_by_task_id ?? '',
  })

  // Notes
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Project edit
  const [editingProject, setEditingProject] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectColor, setEditProjectColor] = useState(PROJECT_COLORS[0])
  const [savingProject, setSavingProject] = useState(false)

  // New project form
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0])
  const [creatingProject, setCreatingProject] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit || !task?.id) return
    setNotesLoading(true)
    supabase
      .from('task_notes')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setNotes(data || [])
        setNotesLoading(false)
      })
  }, [isEdit, task?.id])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        title:              form.title.trim(),
        description:        form.description.trim() || null,
        status:             form.status,
        priority:           form.priority,
        assignee:           form.assignee.trim() || null,
        due_date:           form.due_date || null,
        project_id:         form.project_id || null,
        blocked_by_task_id: form.status === 'Blocked' ? (form.blocked_by_task_id || null) : null,
      })
    } catch (err) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  async function handleAddNote() {
    if (!newNote.trim() || !task?.id) return
    setSavingNote(true)
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('task_notes')
        .insert([{ task_id: task.id, content: newNote.trim(), author: noteAuthor.trim() || null }])
        .select()
        .single()
      if (err) throw err
      setNotes(prev => [...prev, data])
      setNewNote('')
    } catch (err) {
      setError(err.message)
    }
    setSavingNote(false)
  }

  async function handleCreateProject() {
    if (!newProjectName.trim()) return
    setCreatingProject(true)
    try {
      const project = await onCreateProject({ name: newProjectName.trim(), color: newProjectColor })
      set('project_id', project.id)
      setNewProjectName('')
      setShowNewProject(false)
    } catch (err) {
      setError(err.message)
    }
    setCreatingProject(false)
  }

  function startEditProject() {
    const proj = projects.find(p => p.id === form.project_id)
    if (!proj) return
    setEditProjectName(proj.name)
    setEditProjectColor(proj.color)
    setEditingProject(true)
    setShowNewProject(false)
  }

  async function handleSaveProject() {
    if (!editProjectName.trim()) return
    setSavingProject(true)
    try {
      await onUpdateProject(form.project_id, { name: editProjectName.trim(), color: editProjectColor })
      setEditingProject(false)
    } catch (err) {
      setError(err.message)
    }
    setSavingProject(false)
  }

  const otherTasks = tasks.filter(t => t.id !== task?.id)

  const input = "w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent"
  const label = "block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-10">

        {/* Header */}
        <div className="px-7 py-5 border-b border-pn-border flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-extrabold text-pn-dark">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1.5 text-pn-faint hover:text-pn-dark hover:bg-pn-bg rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-5 space-y-5">

            {/* Title */}
            <div>
              <label className={label}>Title *</label>
              <input
                type="text" value={form.title}
                onChange={e => set('title', e.target.value)}
                className={input} placeholder="What needs to be done?" autoFocus required
              />
            </div>

            {/* Description */}
            <div>
              <label className={label}>Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={2} className={`${input} resize-none`}
                placeholder="Add more details…"
              />
            </div>

            {/* Status */}
            <div>
              <label className={label}>Status</label>
              <div className="flex flex-wrap gap-1.5">
                {TASK_STATUSES.map(s => (
                  <button key={s} type="button" onClick={() => set('status', s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      form.status === s
                        ? 'bg-pn-navy border-pn-navy text-white'
                        : 'border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Blocked by — only shown when status is Blocked */}
            {form.status === 'Blocked' && (
              <div>
                <label className={label}>Blocked by</label>
                <select
                  value={form.blocked_by_task_id}
                  onChange={e => set('blocked_by_task_id', e.target.value)}
                  className={`${input} bg-white`}
                >
                  <option value="">— select blocker task —</option>
                  {otherTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority */}
            <div>
              <label className={label}>Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => set('priority', p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      form.priority === p
                        ? p === 'High'   ? 'bg-red-600 border-red-600 text-white'
                        : p === 'Medium' ? 'bg-orange-500 border-orange-500 text-white'
                        :                  'bg-gray-500 border-gray-500 text-white'
                        : 'border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Assignee</label>
                <input
                  type="text" value={form.assignee}
                  onChange={e => set('assignee', e.target.value)}
                  className={input} placeholder="Name"
                />
              </div>
              <div>
                <label className={label}>Due date</label>
                <input
                  type="date" value={form.due_date}
                  onChange={e => set('due_date', e.target.value)}
                  className={input}
                />
              </div>
            </div>

            {/* Project */}
            <div>
              <label className={label}>Project / Initiative</label>

              {!showNewProject && !editingProject && (
                <div className="flex gap-2">
                  <select
                    value={form.project_id}
                    onChange={e => { set('project_id', e.target.value); setEditingProject(false) }}
                    className={`${input} bg-white flex-1`}
                  >
                    <option value="">No project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {form.project_id && (
                    <button
                      type="button" onClick={startEditProject}
                      className="px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-muted hover:text-pn-navy hover:border-pn-navy transition-colors"
                      title="Edit project"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button" onClick={() => setShowNewProject(true)}
                    className="px-3 py-2.5 border border-pn-border-mid rounded-lg text-xs font-bold text-pn-muted hover:text-pn-navy hover:border-pn-navy transition-colors whitespace-nowrap"
                  >
                    + New
                  </button>
                </div>
              )}

              {editingProject && (
                <div className="bg-pn-bg border border-pn-border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-pn-dark">Edit project</p>
                  <input
                    type="text" value={editProjectName}
                    onChange={e => setEditProjectName(e.target.value)}
                    className={input} placeholder="Project name" autoFocus
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-pn-faint font-medium">Color:</span>
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c} type="button" onClick={() => setEditProjectColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                          editProjectColor === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button" onClick={handleSaveProject}
                      disabled={savingProject || !editProjectName.trim()}
                      className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingProject ? 'Saving…' : 'Save project'}
                    </button>
                    <button
                      type="button" onClick={() => setEditingProject(false)}
                      className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-2 rounded-lg border border-pn-border-mid transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showNewProject && (
                <div className="bg-pn-bg border border-pn-border rounded-xl p-4 space-y-3">
                  <input
                    type="text" value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    className={input} placeholder="Project name" autoFocus
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-pn-faint font-medium">Color:</span>
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c} type="button" onClick={() => setNewProjectColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                          newProjectColor === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button" onClick={handleCreateProject}
                      disabled={creatingProject || !newProjectName.trim()}
                      className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      {creatingProject ? 'Creating…' : 'Create project'}
                    </button>
                    <button
                      type="button" onClick={() => { setShowNewProject(false); setNewProjectName('') }}
                      className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-2 rounded-lg border border-pn-border-mid transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Updates / Notes — only for existing tasks */}
            {isEdit && (
              <div>
                <label className={label}>Updates</label>
                <div className="bg-pn-bg border border-pn-border rounded-xl overflow-hidden">
                  {notesLoading && (
                    <div className="px-4 py-3 text-xs text-pn-faint">Loading updates…</div>
                  )}
                  {!notesLoading && notes.length === 0 && (
                    <div className="px-4 py-3 text-xs text-pn-faint">No updates yet.</div>
                  )}
                  {notes.length > 0 && (
                    <div className="divide-y divide-pn-border max-h-52 overflow-y-auto">
                      {notes.map(note => (
                        <div key={note.id} className="px-4 py-3">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            {note.author
                              ? <span className="text-xs font-bold text-pn-dark">{note.author}</span>
                              : <span className="text-xs text-pn-faint italic">Anonymous</span>
                            }
                            <span className="text-[11px] text-pn-faint shrink-0">
                              {format(parseISO(note.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-pn-muted leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add note form */}
                  <div className="border-t border-pn-border px-4 py-3 space-y-2">
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy resize-none"
                      placeholder="Add an update or follow-up comment…"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote()
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text" value={noteAuthor}
                        onChange={e => setNoteAuthor(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-pn-border-mid rounded-lg text-pn-dark text-xs focus:outline-none focus:ring-1 focus:ring-pn-navy"
                        placeholder="Your name (optional)"
                      />
                      <button
                        type="button" onClick={handleAddNote}
                        disabled={savingNote || !newNote.trim()}
                        className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {savingNote ? 'Posting…' : 'Post update'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-pn-border bg-pn-bg rounded-b-2xl flex items-center justify-between">
            <div>
              {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
              {isEdit && !error && (
                <button type="button" onClick={onDelete}
                  className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                  Delete task
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy text-sm font-bold rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="bg-pn-green hover:bg-pn-green-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
