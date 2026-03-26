import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, className = '', label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs text-on-surface-variant font-medium">
          <span>{label}</span>
          <span className="font-mono text-primary">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#4ae176] to-[#00a74b] rounded-full"
        />
      </div>
    </div>
  )
}
