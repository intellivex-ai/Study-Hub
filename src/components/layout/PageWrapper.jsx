import { motion } from 'framer-motion'
import TopBar from './TopBar'
import Navbar from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`pt-24 pb-32 px-6 max-w-7xl mx-auto ${className}`}
      >
        {children}
      </motion.main>

      {/* Ambient glow decoratives */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  )
}
