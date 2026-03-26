import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import Avatar from '../ui/Avatar'

export default function TopBar() {
  const { user } = useAppStore()

  return (
    <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl flex justify-between items-center px-6 py-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4ae176] to-[#00a74b] flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-[#003915]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
        </div>
        <span className="text-primary font-black tracking-widest text-lg uppercase font-headline">
          STUDY HUB
        </span>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800/40 transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
        </motion.button>
        <Link to="/settings">
          <Avatar name={user.name} size="sm" border />
        </Link>
      </div>
    </header>
  )
}
