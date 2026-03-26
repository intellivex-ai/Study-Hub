import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function PageLoader() {
  const [progress, setProgress] = useState(0)

  // Simulate indeterministic progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        // Stop progressing artificially at 90%
        if (old >= 90) return old
        // Progress slower as it gets higher
        const jump = Math.random() * 15 * (1 - old / 100)
        return Math.min(old + jump + 1, 90)
      })
    }, 300)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-mesh">
      {/* Top progress bar overlay */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface-container-high overflow-hidden z-50">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
          className="h-full bg-gradient-to-r from-primary/50 to-primary"
        />
      </div>

      {/* Subtle center spinner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: 0.4 }}
        className="w-12 h-12 border-2 border-primary/20 border-t-primary/80 rounded-full animate-spin shadow-[0_0_30px_rgba(74,225,118,0.1)]" 
      />
    </div>
  )
}
