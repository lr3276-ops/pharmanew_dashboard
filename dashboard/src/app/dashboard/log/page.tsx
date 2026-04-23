'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCTS, CALL_TYPES, OUTCOMES, MATERIALS } from '@/lib/constants'
import type { Provider } from '@/types'

interface ProviderOption {
  id: number
  name: string
  specialty: string | null
  city: string | null
}

export default function LogActivityPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [providerSearch, setProviderSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    call_type: '',
    products_discussed: [] as string[],
    outcome: '',
    samples_left: false,
    literature_left: false,
    materials_left: [] as string[],
    gatekeeper_name: '',
    gatekeeper_role: '',
    next_visit_date: '',
    next_steps: '',
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(providerSearch.toLowerCase())
  ).slice(0, 12)

  function selectProvider(p: ProviderOption) {
    setSelectedProvider(p)
    setProviderSearch(p.name)
    setShowDropdown(false)
  }

  function toggleProduct(product: string) {
    setForm(f => ({
      ...f,
      products_discussed: f.products_discussed.includes(product)
        ? f.products_discussed.filter(p => p !== product)
        : [...f.products_discussed, product],
    }))
  }

  function toggleMaterial(material: string) {
    setForm(f => ({
      ...f,
      materials_left: f.materials_left.includes(material)
        ? f.materials_left.filter(m => m !== material)
        : [...f.materials_left, material],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProvider) { setError('Please select a provider'); return }
    if (!form.call_type) { setError('Please select a call type'); return }
    if (!form.outcome) { setError('Please select an outcome'); return }

    setError('')
    setSubmitting(true)

    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visit_date: form.visit_date,
        provider_id: selectedProvider.id,
        provider_name: selectedProvider.name,
        provider_city: selectedProvider.city,
        provider_specialty: selectedProvider.specialty,
        call_type: form.call_type,
        products_discussed: form.products_discussed,
        outcome: form.outcome,
        samples_left: form.samples_left,
        literature_left: form.literature_left,
        materials_left: form.materials_left.length > 0 ? form.materials_left : null,
        gatekeeper_name: form.gatekeeper_name || null,
        gatekeeper_role: form.gatekeeper_role || null,
        next_visit_date: form.next_visit_date || null,
        next_steps: form.next_steps || null,
        notes: form.notes || null,
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save activity')
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">Activity logged</p>
          <p className="text-slate-500 text-sm mt-1">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Log Activity</h1>
        <p className="text-slate-500 text-sm mt-1">Record a visit, call, or interaction with a provider.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Provider * <span className="text-slate-400 font-normal text-xs">({providers.length} loaded)</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={providerSearch}
              onChange={e => { setProviderSearch(e.target.value); setSelectedProvider(null); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or city..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            {selectedProvider && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-green-700 font-medium">{selectedProvider.name}</span>
                <span className="text-xs text-slate-400">{selectedProvider.specialty} · {selectedProvider.city}</span>
              </div>
            )}
            {showDropdown && providerSearch.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProviders.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-400">No providers found</p>
                ) : (
                  filteredProviders.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProvider(p)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.specialty} · {p.city}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Visit date *</label>
          <input
            type="date"
            value={form.visit_date}
            onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
            required
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Call type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Call type *</label>
          <div className="flex flex-wrap gap-2">
            {CALL_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, call_type: t }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  form.call_type === t
                    ? 'bg-green-700 border-green-700 text-white font-medium'
                    : 'border-slate-300 text-slate-600 hover:border-green-600 hover:text-green-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Products discussed</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => toggleProduct(p)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  form.products_discussed.includes(p)
                    ? 'bg-slate-800 border-slate-800 text-white font-medium'
                    : 'border-slate-300 text-slate-600 hover:border-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Outcome *</label>
          <select
            value={form.outcome}
            onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
            required
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            <option value="">Select outcome</option>
            {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.samples_left}
              onChange={e => setForm(f => ({ ...f, samples_left: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
            />
            <span className="text-sm text-slate-700">Samples left</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.literature_left}
              onChange={e => setForm(f => ({ ...f, literature_left: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
            />
            <span className="text-sm text-slate-700">Literature left</span>
          </label>
        </div>

        {/* Materials left */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Materials left</label>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMaterial(m)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  form.materials_left.includes(m)
                    ? 'bg-slate-800 border-slate-800 text-white font-medium'
                    : 'border-slate-300 text-slate-600 hover:border-slate-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Gatekeeper */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Gatekeeper</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.gatekeeper_name}
              onChange={e => setForm(f => ({ ...f, gatekeeper_name: e.target.value }))}
              placeholder="Name"
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <input
              type="text"
              value={form.gatekeeper_role}
              onChange={e => setForm(f => ({ ...f, gatekeeper_role: e.target.value }))}
              placeholder="Role (e.g. receptionist, nurse)"
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Next visit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Next visit date</label>
          <input
            type="date"
            value={form.next_visit_date}
            onChange={e => setForm(f => ({ ...f, next_visit_date: e.target.value }))}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Next steps */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Next steps</label>
          <textarea
            value={form.next_steps}
            onChange={e => setForm(f => ({ ...f, next_steps: e.target.value }))}
            rows={2}
            placeholder="What needs to happen after this visit?"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Any additional notes..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Activity'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-300 text-slate-600 hover:border-slate-400 font-medium rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
