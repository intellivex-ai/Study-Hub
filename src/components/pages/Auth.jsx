import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/auth'

const floatVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return }
      const { error } = await signUp(form.email, form.password, form.name)
      if (error) setError(error.message)
      else setMode('confirm')
    } else {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const inputClass = "w-full bg-white/5 border border-white/8 hover:border-primary/30 focus:border-primary/60 focus:bg-white/8 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none transition-all duration-200 text-sm font-body"

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Ambient Background ─────────────────────────────────── */}
      {/* Large center glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/4 rounded-full blur-[140px] -z-10 pointer-events-none" />
      {/* Top right accent */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
      {/* Bottom left accent */}
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-primary/2 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" />

      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-[0.03] -z-10 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#4ae176 39px,#4ae176 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#4ae176 39px,#4ae176 40px)' }}
      />

      <div className="w-full max-w-sm">

        {/* ── Logo / Brand ────────────────────────────────────── */}
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          {/* Animated logo mark */}
          <div className="relative mb-5">
            <div className="absolute -inset-3 rounded-3xl bg-primary/15 blur-lg animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-2xl shadow-primary/30">
              <span
                className="material-symbols-outlined text-[#003915] text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
          </div>
          <h1 className="font-headline font-black text-4xl tracking-tighter text-white mb-1">
            Study<span className="text-primary">Hub</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-medium">
            Your AI-powered <span className="text-primary/70">focus sanctuary</span>.
          </p>
        </motion.div>

        {/* ── Card ────────────────────────────────────────────── */}
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Gradient border container */}
          <div className="relative rounded-3xl p-px"
            style={{ background: 'linear-gradient(135deg, rgba(74,225,118,0.25), rgba(0,0,0,0.4), rgba(255,255,255,0.05))' }}
          >
            <div className="relative bg-[#080a0a] rounded-3xl p-7 overflow-hidden">
              {/* Ambient ray */}
              <div className="absolute top-0 left-0 w-64 h-16 bg-primary/4 blur-3xl -translate-x-1/4 -translate-y-1/2 pointer-events-none" />

              <AnimatePresence mode="wait">
                {mode === 'confirm' ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-4 py-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto shadow-lg shadow-primary/10">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                    </div>
                    <h2 className="font-headline font-black text-xl text-white">Check your email</h2>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      We sent a confirmation link to{' '}
                      <span className="text-primary font-bold">{form.email}</span>.
                      Click it to activate your account.
                    </p>
                    <button
                      onClick={() => setMode('login')}
                      className="text-sm text-primary font-black hover:underline"
                    >
                      ← Back to Login
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Mode toggle */}
                    <div className="relative flex bg-white/4 rounded-2xl p-1 mb-7 border border-white/5">
                      {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
                        <button
                          key={m}
                          onClick={() => { setMode(m); setError(null) }}
                          className={`relative flex-1 py-2.5 rounded-xl text-sm font-black transition-all duration-300 z-10 ${
                            mode === m ? 'text-[#003915]' : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {mode === m && (
                            <motion.div
                              layoutId="auth-tab-bg"
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary-container"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                            />
                          )}
                          <span className="relative z-10">{label}</span>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <AnimatePresence>
                        {mode === 'signup' && (
                          <motion.div
                            key="name-field"
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <label htmlFor="auth-name" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Your Name</label>
                            <input
                              id="auth-name"
                              type="text"
                              value={form.name}
                              onChange={update('name')}
                              placeholder="Alex Scholar"
                              autoComplete="name"
                              className={inputClass}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                         <label htmlFor="auth-email" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
                        <input
                          id="auth-email"
                          type="email"
                          value={form.email}
                          onChange={update('email')}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="auth-password" className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                          <input
                            id="auth-password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={update('password')}
                            placeholder="Min. 6 characters"
                            required
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            className={`${inputClass} pr-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-lg"
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            className="flex items-center gap-2.5 bg-red-950/40 border border-red-900/40 rounded-xl px-4 py-3"
                          >
                            <span className="material-symbols-outlined text-red-400 text-sm flex-shrink-0">error</span>
                            <p className="text-red-400 text-sm">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 mt-1 bg-gradient-to-br from-primary to-primary-container text-[#003915] font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        {/* Shimmer on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
                        {loading ? (
                          <span className="flex items-center justify-center gap-2 relative">
                            <span className="w-4 h-4 border-2 border-[#003915]/30 border-t-[#003915] rounded-full animate-spin" />
                            {mode === 'signup' ? 'Creating Account…' : 'Signing In…'}
                          </span>
                        ) : (
                          <span className="relative">{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.25 }}
          className="text-center text-xs text-on-surface-variant/50 mt-6"
        >
          Secured by Supabase Row-Level Security.
        </motion.p>
      </div>
    </div>
  )
}
