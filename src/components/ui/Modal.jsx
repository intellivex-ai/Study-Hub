import { motion, AnimatePresence } from 'framer-motion'

/**
 * Premium Modal — glassmorphism with emerald border accent and spring animation.
 */
export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            {/* Outer glow border */}
            <div className="relative rounded-3xl p-px"
              style={{ background: 'linear-gradient(135deg, rgba(74,225,118,0.3), rgba(0,57,21,0.4), rgba(255,255,255,0.04))' }}
            >
              <div className="relative bg-[#0c0e0e] rounded-3xl p-7 overflow-hidden">
                {/* Ambient ray */}
                <div className="absolute top-0 left-0 w-48 h-12 bg-primary/5 blur-2xl rounded-full -translate-x-1/4 -translate-y-1/2 pointer-events-none" />

                {/* Header — always shows close button; title is optional */}
                <div className="flex justify-between items-center mb-6 relative">
                  {title ? (
                    <h2 className="font-headline font-black text-xl text-white tracking-tight">
                      {title}
                    </h2>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="relative">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
