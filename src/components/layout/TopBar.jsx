import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import Avatar from '../ui/Avatar'

export default function TopBar() {
  const { user } = useAppStore()
  const [hasNotifications] = useState(true) // Replace with real notification state/context

  return (
    <header className="fixed top-0 w-full z-50">
      {/* Frosted glass bar */}
      <div className="bg-black/50 backdrop-blur-2xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
                <span
                  className="material-symbols-outlined text-[#003915] text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
            </div>
            <span className="text-white font-black tracking-widest text-base uppercase font-headline">
              Study<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              aria-label={hasNotifications ? 'View notifications (new)' : 'View notifications'}
              aria-pressed={false}
              onClick={() => { /* TODO: open notification panel */ }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {/* Notification dot — only shown when there are notifications */}
              {hasNotifications && (
                <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </motion.button>

            {/* Avatar → Settings */}
            <Link to="/settings" className="group relative">
              <div className="absolute -inset-0.5 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative">
                <Avatar name={user?.name ?? 'Scholar'} size="sm" border />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
