import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from '../../lib/constants'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <>
      {/* ── Mobile Bottom Nav ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 w-full px-4 pb-5 z-50">
        <div
          className="w-full flex justify-around items-center py-2 px-2 rounded-[2rem] border border-white/5"
          style={{
            background: 'rgba(10, 12, 12, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300"
              >
                {/* Active pill background */}
                {active && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-primary-container"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    style={{ boxShadow: '0 4px 16px rgba(74,225,118,0.3)' }}
                  />
                )}
                <span
                  className={`material-symbols-outlined text-[22px] relative z-10 transition-colors duration-200 ${
                    active ? 'text-[#003915]' : 'text-slate-400'
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wide mt-0.5 relative z-10 transition-colors ${
                    active ? 'text-[#003915]' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Desktop Top Nav Links ──────────────────────────────── */}
      <div className="hidden md:flex fixed top-0 right-20 z-50 h-[56px] items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                active
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-on-surface hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/8 border border-primary/15"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span
                className="material-symbols-outlined text-[16px] relative z-10"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
