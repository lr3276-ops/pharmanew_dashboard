import { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from './lib/supabase.js'
import Navbar from './components/Navbar.jsx'
import FilterBar from './components/FilterBar.jsx'
import KanbanView from './components/KanbanView.jsx'
import ListView from './components/ListView.jsx'
import PartnerDetail from './components/PartnerDetail.jsx'
import AddPartnerModal from './components/AddPartnerModal.jsx'
import SetupModal from './components/SetupModal.jsx'
import LoginPage from './components/LoginPage.jsx'
import TaskBoard from './components/tasks/TaskBoard.jsx'
import TaskCalendar from './components/tasks/TaskCalendar.jsx'
import TaskLog from './components/tasks/TaskLog.jsx'
import ProjectsView from './components/tasks/ProjectsView.jsx'
import AddTaskModal from './components/tasks/AddTaskModal.jsx'
import PartnerProjectsView from './components/projects/PartnerProjectsView.jsx'

export default function App() {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Section ───────────────────────────────────────────────────────────────────
  const [section, setSection] = useState('crm') // 'crm' | 'tasks' | 'projects'

  // ── CRM state ─────────────────────────────────────────────────────────────────
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [crmView, setCrmView] = useState('kanban')
  const [selectedId, setSelectedId] = useState(null)
  const [editingPartner, setEditingPartner] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [filters, setFilters] = useState({ search: '', stage: '', priority: '', therapeuticArea: '' })

  // ── Partner Projects state ────────────────────────────────────────────────────
  const [partnerProjects, setPartnerProjects] = useState([])

  // ── Tasks state ───────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [taskView, setTaskView] = useState('kanban')
  const [editingTask, setEditingTask] = useState(null)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)

  const selectedPartner = partners.find(p => p.id === selectedId) ?? null

  // ── Fetch CRM data ────────────────────────────────────────────────────────────
  const fetchPartners = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setFetchError(error.message)
    else setPartners(data || [])
    setLoading(false)
  }, [])

  // ── Fetch Partner Projects ────────────────────────────────────────────────────
  const fetchPartnerProjects = useCallback(async () => {
    const { data } = await supabase
      .from('partner_projects')
      .select('*')
      .order('created_at', { ascending: false })
    setPartnerProjects(data || [])
  }, [])

  // ── Fetch Tasks data ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true)
    const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('name'),
    ])
    setTasks(tasksData || [])
    setProjects(projectsData || [])
    setTasksLoading(false)
  }, [])

  useEffect(() => {
    if (session && isConfigured) {
      fetchPartners()
      fetchTasks()
      fetchPartnerProjects()
    } else if (!session && !authLoading) {
      setLoading(false)
    }
  }, [session, authLoading, fetchPartners, fetchTasks, fetchPartnerProjects])

  // ── CRM CRUD ──────────────────────────────────────────────────────────────────
  async function addPartner(formData) {
    const { data, error } = await supabase.from('partners').insert([formData]).select().single()
    if (error) throw error
    setPartners(prev => [data, ...prev])
    return data
  }

  async function updatePartner(id, updates) {
    const { data, error } = await supabase.from('partners').update(updates).eq('id', id).select().single()
    if (error) throw error
    setPartners(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  async function deletePartner(id) {
    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) throw error
    setPartners(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // ── Tasks CRUD ────────────────────────────────────────────────────────────────
  async function addTask(formData) {
    const completed_at = formData.status === 'Done' ? new Date().toISOString() : null
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...formData, completed_at, created_by: session?.user?.email }])
      .select()
      .single()
    if (error) throw error
    setTasks(prev => [data, ...prev])
    return data
  }

  async function updateTask(id, updates) {
    const prev = tasks.find(t => t.id === id)
    let completed_at
    if (updates.status === 'Done') {
      completed_at = prev?.status === 'Done' ? (prev.completed_at ?? new Date().toISOString()) : new Date().toISOString()
    } else {
      completed_at = null
    }
    const { data, error } = await supabase.from('tasks').update({ ...updates, completed_at }).eq('id', id).select().single()
    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function createProject(formData) {
    const { data, error } = await supabase.from('projects').insert([formData]).select().single()
    if (error) throw error
    setProjects(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function updateProject(id, updates) {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    if (error) throw error
    setProjects(prev => prev.map(p => p.id === id ? data : p).sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    setProjects(prev => prev.filter(p => p.id !== id))
    setTasks(prev => prev.map(t => t.project_id === id ? { ...t, project_id: null } : t))
  }

  // ── Partner Projects CRUD ─────────────────────────────────────────────────────
  async function createPartnerProject(formData) {
    const { data, error } = await supabase.from('partner_projects').insert([formData]).select().single()
    if (error) throw error
    setPartnerProjects(prev => [data, ...prev])
    return data
  }

  async function updatePartnerProject(id, updates) {
    const { data, error } = await supabase.from('partner_projects').update(updates).eq('id', id).select().single()
    if (error) throw error
    setPartnerProjects(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  async function deletePartnerProject(id) {
    const { error } = await supabase.from('partner_projects').delete().eq('id', id)
    if (error) throw error
    setPartnerProjects(prev => prev.filter(p => p.id !== id))
  }

  // ── Derived ───────────────────────────────────────────────────────────────────
  const filteredPartners = partners.filter(p => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const hit = p.company_name?.toLowerCase().includes(q) ||
        p.contact_name?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        (p.products || []).some(pr => pr.toLowerCase().includes(q))
      if (!hit) return false
    }
    if (filters.stage && p.stage !== filters.stage) return false
    if (filters.priority && p.priority !== filters.priority) return false
    if (filters.therapeuticArea && p.therapeutic_area !== filters.therapeuticArea) return false
    return true
  })

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-pn-bg flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-pn-border shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-pn-sky rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-pn-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-pn-dark mb-2">Setup Required</h1>
          <p className="text-pn-muted text-sm mb-6 leading-relaxed">
            Add <code className="bg-pn-bg px-1.5 py-0.5 rounded text-xs font-bold text-pn-navy">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-pn-bg px-1.5 py-0.5 rounded text-xs font-bold text-pn-navy">VITE_SUPABASE_ANON_KEY</code>{' '}
            to your environment variables, then create the Supabase tables.
          </p>
          <button onClick={() => setShowSetupModal(true)}
            className="bg-pn-navy hover:bg-pn-navy-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors">
            View Setup Instructions
          </button>
        </div>
        {showSetupModal && <SetupModal onClose={() => setShowSetupModal(false)} />}
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pn-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pn-border border-t-pn-navy rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <LoginPage />

  // ── Main app ──────────────────────────────────────────────────────────────────
  const currentView = section === 'crm' ? crmView : taskView
  const setCurrentView = section === 'crm' ? setCrmView : setTaskView

  return (
    <div className="min-h-screen bg-pn-bg">
      <Navbar
        section={section}
        setSection={setSection}
        view={currentView}
        setView={setCurrentView}
        onAdd={section === 'crm'
          ? () => { setEditingPartner(null); setShowAddModal(true) }
          : section === 'projects' ? null
          : taskView === 'projects' ? null
          : () => { setEditingTask(null); setShowAddTaskModal(true) }
        }
        onSetup={() => setShowSetupModal(true)}
        onSignOut={() => supabase.auth.signOut()}
        userEmail={session.user.email}
      />

      <div className="pt-16">
        {section === 'crm' ? (
          <>
            <FilterBar filters={filters} setFilters={setFilters} partners={partners} />
            {loading ? (
              <div className="flex items-center justify-center h-64 text-pn-muted text-sm font-medium">
                Loading partners…
              </div>
            ) : fetchError ? (
              <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
                  <p className="font-bold mb-1">Error loading data</p>
                  <p className="font-mono text-xs break-all">{fetchError}</p>
                  <p className="mt-2 text-red-600 text-xs">Check that your Supabase env vars are correct and the tables exist.</p>
                </div>
              </div>
            ) : crmView === 'kanban' ? (
              <KanbanView partners={filteredPartners} onSelect={setSelectedId} />
            ) : (
              <ListView partners={filteredPartners} onSelect={setSelectedId} />
            )}
          </>
        ) : section === 'projects' ? (
          <PartnerProjectsView
            partnerProjects={partnerProjects}
            partners={partners}
            onCreate={createPartnerProject}
            onUpdate={updatePartnerProject}
            onDelete={deletePartnerProject}
          />
        ) : (
          tasksLoading ? (
            <div className="flex items-center justify-center h-64 text-pn-muted text-sm font-medium">
              Loading tasks…
            </div>
          ) : taskView === 'kanban' ? (
            <TaskBoard
              tasks={tasks}
              projects={projects}
              onEdit={t => { setEditingTask(t); setShowAddTaskModal(true) }}
            />
          ) : taskView === 'calendar' ? (
            <TaskCalendar
              tasks={tasks}
              projects={projects}
              onEdit={t => { setEditingTask(t); setShowAddTaskModal(true) }}
            />
          ) : taskView === 'log' ? (
            <TaskLog
              tasks={tasks}
              projects={projects}
              onEdit={t => { setEditingTask(t); setShowAddTaskModal(true) }}
            />
          ) : (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              onCreateProject={createProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              onEditTask={t => { setEditingTask(t); setShowAddTaskModal(true) }}
            />
          )
        )}
      </div>

      {/* ── CRM modals ── */}
      {selectedPartner && (
        <PartnerDetail
          partner={selectedPartner}
          onClose={() => setSelectedId(null)}
          onUpdate={updatePartner}
          onDelete={deletePartner}
          onEdit={() => { setEditingPartner(selectedPartner); setSelectedId(null) }}
        />
      )}
      {(showAddModal || editingPartner) && (
        <AddPartnerModal
          partner={editingPartner ?? null}
          onClose={() => { setShowAddModal(false); setEditingPartner(null) }}
          onSave={async (data) => {
            if (editingPartner) { await updatePartner(editingPartner.id, data); setEditingPartner(null) }
            else { await addPartner(data); setShowAddModal(false) }
          }}
        />
      )}
      {showSetupModal && <SetupModal onClose={() => setShowSetupModal(false)} />}

      {/* ── Task modal ── */}
      {showAddTaskModal && (
        <AddTaskModal
          task={editingTask}
          tasks={tasks}
          projects={projects}
          onClose={() => { setShowAddTaskModal(false); setEditingTask(null) }}
          onSave={async (data) => {
            if (editingTask) await updateTask(editingTask.id, data)
            else await addTask(data)
            setShowAddTaskModal(false)
            setEditingTask(null)
          }}
          onDelete={async () => {
            if (editingTask) await deleteTask(editingTask.id)
            setShowAddTaskModal(false)
            setEditingTask(null)
          }}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
        />
      )}
    </div>
  )
}
