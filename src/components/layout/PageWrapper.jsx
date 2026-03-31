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
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.035] grayscale contrast-150" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

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
      <div className="fixed top-[-10%] start-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[160px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
    </div>
  )
}
