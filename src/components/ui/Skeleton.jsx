import { motion } from 'framer-motion'

const shimmerVariants = {
  animate: { 
    opacity: [0.3, 0.7, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export function SkeletonCard({ className = '', children }) {
  return (
    <motion.div 
      variants={shimmerVariants}
      animate="animate"
      className={`bg-surface-container-high rounded-2xl border border-outline-variant/10 p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SkeletonText({ className = '', lines = 1 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1 && lines > 1
        return (
          <motion.div
            key={i}
            variants={shimmerVariants}
            animate="animate"
            className={`h-4 bg-surface-variant rounded-md ${isLast ? 'w-2/3' : 'w-full'}`}
          />
        )
      })}
    </div>
  )
}

export function SkeletonAvatar({ size = 'w-12 h-12', className = '' }) {
  return (
    <motion.div
      variants={shimmerVariants}
      animate="animate"
      className={`bg-surface-variant rounded-full ${size} ${className}`}
    />
  )
}
