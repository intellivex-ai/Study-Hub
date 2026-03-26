import { motion, AnimatePresence } from 'framer-motion'

export default function SplashLoader({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] bg-mesh flex flex-col items-center justify-center p-6"
        >
          {/* Subtle background glow */}
          <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex flex-col items-center"
          >
            {/* Logo box with breathing effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0px 0px rgba(74, 225, 118, 0)',
                  '0 0 40px 10px rgba(74, 225, 118, 0.15)',
                  '0 0 0px 0px rgba(74, 225, 118, 0)'
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="w-20 h-20 rounded-[1.5rem] bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <span className="material-symbols-outlined text-primary text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </motion.div>

            {/* Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-headline font-black tracking-[0.15em] text-xl uppercase text-white mb-2"
            >
              STUDY HUB
            </motion.h1>
            
            {/* Loading dots */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex items-center gap-2 mt-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-1 rounded-full bg-primary"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
