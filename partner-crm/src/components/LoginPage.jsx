import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function LoginPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  const inputClass = "w-full px-3 py-2.5 border border-pn-border-mid rounded-lg text-pn-dark text-sm focus:outline-none focus:ring-2 focus:ring-pn-navy focus:border-transparent"

  return (
    <div className="min-h-screen bg-pn-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-pn-border shadow-sm w-full max-w-sm p-8">

        <div className="text-center mb-8">
          <img src="/logo-landscape.png" alt="PHARMAnew" className="h-10 object-contain mx-auto mb-5" />
          <h1 className="text-lg font-extrabold text-pn-dark">
            {mode === 'signin' ? 'Sign in' : 'Create an account'}
          </h1>
          <p className="text-pn-faint text-sm mt-1">Partner Pipeline & Team Tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@pharmanew.com"
              className={inputClass}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-pn-dark uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-pn-green text-xs bg-pn-lime/40 px-3 py-2 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pn-navy hover:bg-pn-navy-dark disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
          >
            {loading
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-xs text-pn-faint mt-6">
          {mode === 'signin' ? (
            <>New user?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                className="text-pn-blue font-bold hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                className="text-pn-blue font-bold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
