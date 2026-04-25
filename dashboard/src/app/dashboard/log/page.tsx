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
  phone: string | null
  npi: string | null
  best_visit_days: string | null
  best_visit_times: string | null
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
    time_arrived: '',
    time_left: '',
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
        time_arrived: form.time_arrived || null,
        time_left: form.time_left || null,
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
          <div className="w-14 h-14 bg-pn-lime rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-pn-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-extrabold text-pn-dark">Activity logged</p>
          <p className="text-pn-muted text-sm mt-1">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-green focus:border-transparent"
  const labelClass = "block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5"

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-pn-dark">Log Activity</h1>
        <p className="text-pn-muted text-sm mt-1 font-medium">Record a visit, call, or interaction with a provider.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider search */}
        <div>
          <label className={labelClass}>
            Provider * <span className="text-pn-faint font-normal normal-case tracking-normal">({providers.length} loaded)</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={providerSearch}
              onChange={e => { setProviderSearch(e.target.value); setSelectedProvider(null); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or city..."
              className={inputClass}
            />
            {selectedProvider && (
              <div className="mt-3 bg-pn-sky border border-[#b6ddf5] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-extrabold text-pn-dark">{selectedProvider.name}</span>
                  {selectedProvider.specialty && (
                    <span className="inline-block px-2 py-0.5 bg-white/70 text-pn-navy text-xs rounded font-bold">{selectedProvider.specialty}</span>
                  )}
                  {selectedProvider.city && (
                    <span className="text-xs text-pn-muted">{selectedProvider.city}, PR</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {selectedProvider.npi && (
                    <p className="text-xs text-pn-muted"><span className="font-bold text-pn-navy">NPI:</span> {selectedProvider.npi}</p>
                  )}
                  {selectedProvider.phone && (
                    <p className="text-xs text-pn-muted"><span className="font-bold text-pn-navy">Phone:</span> {selectedProvider.phone}</p>
                  )}
                  {selectedProvider.best_visit_days && (
                    <p className="text-xs text-pn-muted"><span className="font-bold text-pn-navy">Best days:</span> {selectedProvider.best_visit_days}</p>
                  )}
                  {selectedProvider.best_visit_times && (
                    <p className="text-xs text-pn-muted"><span className="font-bold text-pn-navy">Best times:</span> {selectedProvider.best_visit_times}</p>
                  )}
                </div>
              </div>
            )}
            {showDropdown && providerSearch.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-pn-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProviders.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-pn-faint">No providers found</p>
                ) : (
                  filteredProviders.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProvider(p)}
                      className="w-full text-left px-3 py-2.5 hover:bg-pn-bg border-b border-pn-border last:border-0 transition-colors"
                    >
                      <p className="text-sm font-semibold text-pn-dark">{p.name}</p>
                      <p className="text-xs text-pn-faint">{p.specialty} · {p.city}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Visit date *</label>
          <input
            type="date"
            value={form.visit_date}
            onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
            required
            className="px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-green focus:border-transparent"
          />
        </div>

        {/* Time arrived / left */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Time arrived</label>
            <input
              type="time"
              value={form.time_arrived}
              onChange={e => setForm(f => ({ ...f, time_arrived: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Time left</label>
            <input
              type="time"
              value={form.time_left}
              onChange={e => setForm(f => ({ ...f, time_left: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        {/* Call type */}
        <div>
          <label className={labelClass}>Call type *</label>
          <div className="flex flex-wrap gap-2">
            {CALL_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, call_type: t }))}
                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                  form.call_type === t
                    ? 'bg-pn-navy border-pn-navy text-white'
                    : 'border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <label className={labelClass}>Products discussed</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => toggleProduct(p)}
                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                  form.products_discussed.includes(p)
                    ? 'bg-pn-green border-pn-green text-white'
                    : 'border-pn-border-mid text-pn-muted hover:border-pn-green hover:text-pn-green'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label className={labelClass}>Outcome *</label>
          <select
            value={form.outcome}
            onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
            required
            className={`${inputClass} bg-white`}
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
              className="w-4 h-4 rounded border-pn-border-mid text-pn-green focus:ring-pn-green"
            />
            <span className="text-sm text-pn-dark font-medium">Samples left</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.literature_left}
              onChange={e => setForm(f => ({ ...f, literature_left: e.target.checked }))}
              className="w-4 h-4 rounded border-pn-border-mid text-pn-green focus:ring-pn-green"
            />
            <span className="text-sm text-pn-dark font-medium">Literature left</span>
          </label>
        </div>

        {/* Materials left */}
        <div>
          <label className={labelClass}>Materials left</label>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMaterial(m)}
                className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                  form.materials_left.includes(m)
                    ? 'bg-pn-blue border-pn-blue text-white'
                    : 'border-pn-border-mid text-pn-muted hover:border-pn-blue hover:text-pn-blue'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Gatekeeper */}
        <div>
          <label className={labelClass}>Gatekeeper</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.gatekeeper_name}
              onChange={e => setForm(f => ({ ...f, gatekeeper_name: e.target.value }))}
              placeholder="Name"
              className={inputClass}
            />
            <input
              type="text"
              value={form.gatekeeper_role}
              onChange={e => setForm(f => ({ ...f, gatekeeper_role: e.target.value }))}
              placeholder="Role (e.g. receptionist, nurse)"
              className={inputClass}
            />
          </div>
        </div>

        {/* Next steps */}
        <div>
          <label className={labelClass}>Next steps</label>
          <textarea
            value={form.next_steps}
            onChange={e => setForm(f => ({ ...f, next_steps: e.target.value }))}
            rows={2}
            placeholder="What needs to happen after this visit?"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Any additional notes..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-pn-green hover:bg-pn-green-dark disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Activity'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy font-medium rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
