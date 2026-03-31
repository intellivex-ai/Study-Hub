import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'

export default function XPToast() {
  const xpToast = useAppStore((s) => s.xpToast)

  return (
    <AnimatePresence>
      {xpToast && (
        <motion.div
          key="xp-toast"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-primary/40 px-5 py-3 rounded-full shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <span className="xp-shimmer font-black text-lg font-mono">+{xpToast.amount} XP</span>
            {xpToast.label && (
              <span className="text-on-surface-variant text-xs font-medium pl-1">{xpToast.label}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
