'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { REPS } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [repName, setRepName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repName, password }),
      })
      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        const data = await res.json()
        setError(data.debug ? `${data.error} (${data.debug})` : data.error || 'Invalid credentials')
        setLoading(false)
      }
    } catch {
      setError('Connection error — please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pn-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo-symbol.png"
              alt="PharmaNew"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold text-pn-dark">Sales Dashboard</h1>
          <p className="text-pn-muted text-sm mt-1 font-medium">Internal access only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pn-border p-7">
          <h2 className="text-base font-bold text-pn-dark mb-5">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5">Your name</label>
              <select
                value={repName}
                onChange={e => setRepName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark bg-white focus:outline-none focus:ring-2 focus:ring-pn-green focus:border-transparent text-sm font-medium"
              >
                <option value="">Select your name</option>
                {REPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Team password"
                className="w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark focus:outline-none focus:ring-2 focus:ring-pn-green focus:border-transparent text-sm"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pn-green hover:bg-pn-green-dark disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-pn-faint text-xs mt-5 font-medium">PharmaNew — Authorized access only</p>
      </div>
    </div>
  )
}
