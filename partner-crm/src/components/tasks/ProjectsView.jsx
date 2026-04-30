import { useState } from 'react'
import { PROJECT_COLORS } from '../../lib/constants.js'

function ProjectRow({ project, taskCount, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [color, setColor] = useState(project.color)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onUpdate(project.id, { name: name.trim(), color })
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
    setError('')
  }

  if (editing) {
    return (
      <div className="bg-pn-bg border border-pn-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            className="flex-1 px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy"
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          />
        </div>
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
    )
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-pn-bg transition-colors group">
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-pn-dark">{project.name}</p>
        <p className="text-xs text-pn-faint mt-0.5">
          {taskCount === 0 ? 'No tasks' : taskCount === 1 ? '1 task' : `${taskCount} tasks`}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
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
              className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-60 transition-colors"
            >
              {deleting ? '…' : 'Yes'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-bold text-pn-faint hover:text-pn-dark transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectsView({ projects, tasks, onCreateProject, onUpdateProject, onDeleteProject }) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const taskCountByProject = Object.fromEntries(
    projects.map(p => [p.id, tasks.filter(t => t.project_id === p.id).length])
  )

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      await onCreateProject({ name: newName.trim(), color: newColor })
      setNewName('')
      setNewColor(PROJECT_COLORS[0])
      setShowNew(false)
    } catch (err) {
      setError(err.message)
    }
    setCreating(false)
  }

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
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: newColor }} />
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              placeholder="Project name"
              className="flex-1 px-3 py-2 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy"
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowNew(false); setNewName('') } }}
            />
          </div>
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
              onClick={() => { setShowNew(false); setNewName(''); setError('') }}
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
        <div className="bg-white rounded-xl border border-pn-border divide-y divide-pn-border overflow-hidden">
          {projects.map(project => (
            <ProjectRow
              key={project.id}
              project={project}
              taskCount={taskCountByProject[project.id] ?? 0}
              onUpdate={onUpdateProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
