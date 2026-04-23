import { useState } from 'react'
import { STAGES, PRIORITIES, SOURCES, THERAPEUTIC_AREAS } from '../lib/constants.js'

export default function AddPartnerModal({ partner, onClose, onSave }) {
  const isEdit = !!partner

  const [form, setForm] = useState({
    company_name:      partner?.company_name      ?? '',
    country:           partner?.country           ?? '',
    contact_name:      partner?.contact_name      ?? '',
    contact_title:     partner?.contact_title     ?? '',
    contact_email:     partner?.contact_email     ?? '',
    contact_phone:     partner?.contact_phone     ?? '',
    products:          partner?.products?.join(', ') ?? '',
    therapeutic_area:  partner?.therapeutic_area  ?? '',
    stage:             partner?.stage             ?? 'Lead',
    priority:          partner?.priority          ?? 'Medium',
    source:            partner?.source            ?? '',
    last_activity_date:  partner?.last_activity_date  ?? '',
    next_followup_date:  partner?.next_followup_date  ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.company_name.trim()) { setError('Company name is required'); return }

    setSaving(true)
    setError('')
    try {
      const payload = {
        company_name:       form.company_name.trim(),
        country:            form.country.trim() || null,
        contact_name:       form.contact_name.trim() || null,
        contact_title:      form.contact_title.trim() || null,
        contact_email:      form.contact_email.trim() || null,
        contact_phone:      form.contact_phone.trim() || null,
        products:           form.products ? form.products.split(',').map(s => s.trim()).filter(Boolean) : [],
        therapeutic_area:   form.therapeutic_area || null,
        stage:              form.stage,
        priority:           form.priority,
        source:             form.source || null,
        last_activity_date: form.last_activity_date || null,
        next_followup_date: form.next_followup_date || null,
      }
      await onSave(payload)
    } catch (err) {
      setError(err.message || 'Failed to save. Check your Supabase connection.')
      setSaving(false)
    }
  }

  const input = "w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent"
  const label = "block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5"
  const sectionTitle = "text-xs font-extrabold text-pn-faint uppercase tracking-wider mb-3 mt-1"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="px-7 py-5 border-b border-pn-border flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-extrabold text-pn-dark">
            {isEdit ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-pn-faint hover:text-pn-dark hover:bg-pn-bg rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-5 space-y-6">

            {/* Company */}
            <div>
              <p className={sectionTitle}>Company</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={label}>Company Name *</label>
                  <input
                    type="text" value={form.company_name}
                    onChange={e => set('company_name', e.target.value)}
                    className={input} placeholder="e.g. BioPharm AG" required
                  />
                </div>
                <div>
                  <label className={label}>Country</label>
                  <input
                    type="text" value={form.country}
                    onChange={e => set('country', e.target.value)}
                    className={input} placeholder="e.g. Germany"
                  />
                </div>
                <div>
                  <label className={label}>Lead Source</label>
                  <select value={form.source} onChange={e => set('source', e.target.value)} className={`${input} bg-white`}>
                    <option value="">Select source</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className={sectionTitle}>Primary Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Full Name</label>
                  <input type="text" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className={input} placeholder="Contact person" />
                </div>
                <div>
                  <label className={label}>Title</label>
                  <input type="text" value={form.contact_title} onChange={e => set('contact_title', e.target.value)} className={input} placeholder="e.g. VP Business Dev" />
                </div>
                <div>
                  <label className={label}>Email</label>
                  <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className={input} placeholder="name@company.com" />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className={input} placeholder="+1 (xxx) xxx-xxxx" />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <p className={sectionTitle}>Products & Therapeutic Area</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={label}>
                    Products of Interest{' '}
                    <span className="normal-case font-normal tracking-normal text-pn-faint">(comma-separated)</span>
                  </label>
                  <input
                    type="text" value={form.products}
                    onChange={e => set('products', e.target.value)}
                    className={input} placeholder="e.g. Suprep, Trulance, Xifaxan"
                  />
                </div>
                <div>
                  <label className={label}>Therapeutic Area</label>
                  <select value={form.therapeutic_area} onChange={e => set('therapeutic_area', e.target.value)} className={`${input} bg-white`}>
                    <option value="">Select area</option>
                    {THERAPEUTIC_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Priority</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p} type="button" onClick={() => set('priority', p)}
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
              </div>
            </div>

            {/* Stage & timeline */}
            <div>
              <p className={sectionTitle}>Stage & Timeline</p>
              <div className="mb-4">
                <label className={label}>Pipeline Stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map(s => (
                    <button
                      key={s} type="button" onClick={() => set('stage', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        form.stage === s
                          ? 'bg-pn-navy border-pn-navy text-white'
                          : 'border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Last Activity Date</label>
                  <input type="date" value={form.last_activity_date} onChange={e => set('last_activity_date', e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>Next Follow-up Date</label>
                  <input type="date" value={form.next_followup_date} onChange={e => set('next_followup_date', e.target.value)} className={input} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-pn-border bg-pn-bg rounded-b-2xl flex items-center justify-between">
            <div>
              {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 border border-pn-border-mid text-pn-muted hover:border-pn-navy hover:text-pn-navy text-sm font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="bg-pn-green hover:bg-pn-green-dark disabled:opacity-60 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Partner'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
