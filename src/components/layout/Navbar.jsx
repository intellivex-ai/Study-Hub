import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from '../../lib/constants'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full px-4 pb-6 z-50">
        <div className="bg-[#2d3449]/60 backdrop-blur-[20px] w-full flex justify-around items-center py-2 px-2 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-outline-variant/10">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-br from-[#4ae176] to-[#00a74b] text-[#003915] scale-110 shadow-lg'
                    : 'text-slate-400 hover:text-green-300'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium tracking-wide mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Top Nav Links */}
      <div className="hidden md:flex fixed top-0 right-16 z-50 h-[72px] items-center gap-7">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-semibold transition-colors duration-200 ${
                active
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-slate-400 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
