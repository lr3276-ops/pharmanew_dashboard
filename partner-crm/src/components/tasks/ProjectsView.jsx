import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { PROJECT_COLORS, TASK_STATUS_CLASSES, PRIORITY_CLASSES } from '../../lib/constants.js'

function ProjectRow({ project, projectTasks, onUpdate, onDelete, onEditTask }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [color, setColor] = useState(project.color)
  const [description, setDescription] = useState(project.description ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onUpdate(project.id, { name: name.trim(), color, description: description.trim() || null })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(project.id)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleCancel() {
    setEditing(false)
    setName(project.name)
    setColor(project.color)
    setDescription(project.description ?? '')
    setError('')
  }

  const input = "w-full px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy"

  return (
    <div className="border-b border-pn-border last:border-0">
      {/* Row header */}
      {!editing ? (
        <div
          className="flex items-center gap-3 px-5 py-4 hover:bg-pn-bg transition-colors cursor-pointer group"
          onClick={() => setExpanded(e => !e)}
        >
          {/* Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-pn-faint flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>

          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-pn-dark">{project.name}</p>
            {project.description && !expanded && (
              <p className="text-xs text-pn-faint truncate mt-0.5">{project.description}</p>
            )}
          </div>

          <span className="text-[11px] font-bold text-pn-faint bg-pn-bg border border-pn-border px-2 py-0.5 rounded-full flex-shrink-0">
            {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}
          </span>

          {/* Action buttons — stop propagation so they don't toggle expand */}
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
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-60"
                >
                  {deleting ? '…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-bold text-pn-faint hover:text-pn-dark"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit form */
        <div className="px-5 py-4 space-y-3 bg-pn-bg">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              autoFocus className={input}
              onKeyDown={e => { if (e.key === 'Escape') handleCancel() }}
            />
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder="Add context or description for this project…"
            className={`${input} resize-none`}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-pn-faint font-medium">Color:</span>
            {PROJECT_COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  color === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-1.5 rounded-lg border border-pn-border-mid transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {expanded && !editing && (
        <div className="pb-3 px-5 pl-12 space-y-3">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-pn-muted leading-relaxed">{project.description}</p>
          )}

          {/* Task list */}
          {projectTasks.length === 0 ? (
            <p className="text-xs text-pn-faint italic">No tasks assigned to this project.</p>
          ) : (
            <div className="space-y-1.5">
              {projectTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="flex items-center gap-3 px-3 py-2.5 bg-white border border-pn-border rounded-lg cursor-pointer hover:border-pn-border-mid hover:shadow-sm transition-all group/task"
                >
                  <p className={`flex-1 text-sm font-medium text-pn-dark truncate min-w-0 ${task.status === 'Done' ? 'line-through text-pn-faint' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${TASK_STATUS_CLASSES[task.status]}`}>
                      {task.status}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${PRIORITY_CLASSES[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.assignee && (
                      <div className="w-5 h-5 rounded-full bg-pn-navy flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white leading-none">
                          {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {task.due_date && (
                      <span className="text-[11px] text-pn-faint whitespace-nowrap">
                        {format(parseISO(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectsView({ projects, tasks, onCreateProject, onUpdateProject, onDeleteProject, onEditTask }) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0])
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const tasksByProject = Object.fromEntries(
    projects.map(p => [p.id, tasks.filter(t => t.project_id === p.id)])
  )

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      await onCreateProject({ name: newName.trim(), color: newColor, description: newDescription.trim() || null })
      setNewName('')
      setNewColor(PROJECT_COLORS[0])
      setNewDescription('')
      setShowNew(false)
    } catch (err) {
      setError(err.message)
    }
    setCreating(false)
  }

  const input = "w-full px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy"

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-extrabold text-pn-dark uppercase tracking-wider">
          Projects / Initiatives
        </h2>
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

      {/* New project form */}
      {showNew && (
        <div className="bg-pn-bg border border-pn-border rounded-xl p-4 space-y-3 mb-4">
          <p className="text-xs font-bold text-pn-dark">New project</p>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: newColor }} />
            <input
              type="text" value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus placeholder="Project name"
              className={input}
              onKeyDown={e => { if (e.key === 'Escape') { setShowNew(false); setNewName('') } }}
            />
          </div>
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            rows={2}
            placeholder="Add context or description (optional)…"
            className={`${input} resize-none`}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-pn-faint font-medium">Color:</span>
            {PROJECT_COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-pn-dark' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              onClick={() => { setShowNew(false); setNewName(''); setNewDescription(''); setError('') }}
              className="text-xs font-bold text-pn-muted hover:text-pn-dark px-4 py-1.5 rounded-lg border border-pn-border-mid transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 && !showNew ? (
        <div className="bg-white rounded-xl border border-pn-border p-12 text-center text-pn-faint text-sm">
          No projects yet. Create one to group your tasks.
        </div>
      ) : projects.length > 0 && (
        <div className="bg-white rounded-xl border border-pn-border overflow-hidden">
          {projects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              projectTasks={tasksByProject[project.id] ?? []}
              onUpdate={onUpdateProject}
              onDelete={onDeleteProject}
              onEditTask={onEditTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
