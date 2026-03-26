import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] shadow-lg shadow-primary/20',
  secondary: 'bg-surface-container-high text-on-surface border border-outline-variant/10 hover:bg-surface-variant',
  ghost: 'text-on-surface-variant hover:text-primary hover:bg-white/5',
  danger: 'bg-red-900/30 text-red-400 border border-red-900/20',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  icon,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-bold px-6 py-3 rounded-xl flex items-center gap-2 
        transition-colors duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </motion.button>
  )
}
