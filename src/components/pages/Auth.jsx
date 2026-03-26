import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/auth'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      if (!form.name.trim()) {
        setError('Please enter your name.')
        setLoading(false)
        return
      }
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) {
        setError(error.message)
      } else {
        setError(null)
        // Supabase sends a confirmation email by default.
        // If email confirmations are disabled in Supabase settings,
        // the auth listener will fire and log the user in automatically.
        setMode('confirm')
      }
    } else {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
      // On success AuthProvider updates user state → App.jsx renders main app
    }

    setLoading(false)
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(74,225,118,0.2)]">
            <span className="material-symbols-outlined text-[#003915] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <h1 className="font-headline font-black text-3xl tracking-tight text-white">STUDY HUB</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium">Your AI-powered focus sanctuary.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-8 border border-outline-variant/10"
        >
          {mode === 'confirm' ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <h2 className="font-headline font-bold text-xl text-on-surface">Check your email</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                We sent a confirmation link to <span className="text-primary font-semibold">{form.email}</span>.
                Click it to activate your account, then come back and log in.
              </p>
              <button
                onClick={() => setMode('login')}
                className="mt-2 text-sm text-primary font-semibold hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex bg-surface-container-low rounded-2xl p-1 mb-8">
                {[['login', 'Log In'], ['signup', 'Sign Up']].map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(null) }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      mode === m
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="auth-name" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        Your Name
                      </label>
                      <input
                        id="auth-name"
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Alex Scholar"
                        autoComplete="name"
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors font-body text-sm"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label htmlFor="auth-email" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors font-body text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors font-body text-sm"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-3"
                  >
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 mt-2 bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] font-bold rounded-xl shadow-[0_8px_24px_rgba(0,167,75,0.3)] hover:shadow-[0_12px_32px_rgba(0,167,75,0.4)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#003915]/30 border-t-[#003915] rounded-full animate-spin" />
                      {mode === 'signup' ? 'Creating Account…' : 'Signing In…'}
                    </span>
                  ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          Your data is private and secured by Supabase Row Level Security.
        </p>
      </div>
    </div>
  )
}
