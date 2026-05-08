import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi } from 'lucide-react'

const links = [
  { href: '#fall-detection',      label: 'Fall Detection' },
  { href: '#activity-monitor',    label: 'Activity Monitor' },
  { href: '#social-prescription', label: 'Social Rx' },
  { href: '#post-agi',            label: 'Post-AGI Vision' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <Wifi size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Mitr</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#fall-detection"
          className="hidden md:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-brand-500/30"
        >
          Try Demo
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            {open
              ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4"
        >
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-brand-500">{l.label}</a>
          ))}
          <a href="#fall-detection" onClick={() => setOpen(false)}
            className="bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center">
            Try Demo
          </a>
        </motion.div>
      )}
    </motion.header>
  )
}
