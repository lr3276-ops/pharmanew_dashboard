import { useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from './lib/supabase.js'
import Navbar from './components/Navbar.jsx'
import FilterBar from './components/FilterBar.jsx'
import KanbanView from './components/KanbanView.jsx'
import ListView from './components/ListView.jsx'
import PartnerDetail from './components/PartnerDetail.jsx'
import AddPartnerModal from './components/AddPartnerModal.jsx'
import SetupModal from './components/SetupModal.jsx'

export default function App() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [view, setView] = useState('kanban')
  const [selectedId, setSelectedId] = useState(null)
  const [editingPartner, setEditingPartner] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)

  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    priority: '',
    therapeuticArea: '',
  })

  const selectedPartner = partners.find(p => p.id === selectedId) ?? null

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

  useEffect(() => {
    if (isConfigured) fetchPartners()
    else setLoading(false)
  }, [fetchPartners])

  async function addPartner(formData) {
    const { data, error } = await supabase
      .from('partners')
      .insert([formData])
      .select()
      .single()
    if (error) throw error
    setPartners(prev => [data, ...prev])
    return data
  }

  async function updatePartner(id, updates) {
    const { data, error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
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

  const filteredPartners = partners.filter(p => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const hit =
        p.company_name?.toLowerCase().includes(q) ||
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

  function openEdit(partner) {
    setEditingPartner(partner)
    setShowAddModal(false)
  }

  // ── Not configured ─────────────────────────────────────────────────────────
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
          <button
            onClick={() => setShowSetupModal(true)}
            className="bg-pn-navy hover:bg-pn-navy-dark text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            View Setup Instructions
          </button>
        </div>
        {showSetupModal && <SetupModal onClose={() => setShowSetupModal(false)} />}
      </div>
    )
  }

  // ── Main app ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-pn-bg">
      <Navbar
        view={view}
        setView={setView}
        onAddPartner={() => { setEditingPartner(null); setShowAddModal(true) }}
        onSetup={() => setShowSetupModal(true)}
        totalCount={partners.length}
      />

      {/* Below fixed navbar (h-16) */}
      <div className="pt-16">
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
        ) : view === 'kanban' ? (
          <KanbanView partners={filteredPartners} onSelect={setSelectedId} />
        ) : (
          <ListView partners={filteredPartners} onSelect={setSelectedId} />
        )}
      </div>

      {/* Partner detail drawer */}
      {selectedPartner && (
        <PartnerDetail
          partner={selectedPartner}
          onClose={() => setSelectedId(null)}
          onUpdate={updatePartner}
          onDelete={deletePartner}
          onEdit={() => openEdit(selectedPartner)}
        />
      )}

      {/* Add / Edit modal */}
      {(showAddModal || editingPartner) && (
        <AddPartnerModal
          partner={editingPartner ?? null}
          onClose={() => { setShowAddModal(false); setEditingPartner(null) }}
          onSave={async (data) => {
            if (editingPartner) {
              await updatePartner(editingPartner.id, data)
              setEditingPartner(null)
            } else {
              await addPartner(data)
              setShowAddModal(false)
            }
          }}
        />
      )}

      {/* Setup modal */}
      {showSetupModal && <SetupModal onClose={() => setShowSetupModal(false)} />}
    </div>
  )
}
