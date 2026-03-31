import { motion, AnimatePresence } from 'framer-motion'
import Loader from './Loader'

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
            <Loader />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
