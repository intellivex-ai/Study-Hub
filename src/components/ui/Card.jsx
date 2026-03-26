import { motion } from 'framer-motion'

export default function Card({ children, className = '', glass = false, hover = false, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        rounded-2xl p-6
        ${glass ? 'glass-card' : 'bg-surface-container-high'}
        ${hover ? 'cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
