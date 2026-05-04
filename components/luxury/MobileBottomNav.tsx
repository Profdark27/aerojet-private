'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Search, Plane, LayoutDashboard } from 'lucide-react'

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Cerca' },
  { href: '/#emptylegs', icon: Plane, label: 'Voli' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
]

export default function MobileBottomNav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[150] lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-4 mb-4 glass-panel bg-dark-glass/95 border-white/10 rounded-2xl h-16 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {tabs.map(tab => {
          const active = path === tab.href || (tab.href !== '/' && path.startsWith(tab.href))
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 group no-underline"
            >
              <div className="relative">
                <tab.icon 
                  size={20} 
                  className={`transition-all duration-500 ${
                    active ? 'text-gold scale-110' : 'text-cream/30 group-hover:text-gold/60'
                  }`}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                {active && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute -inset-2 bg-gold/10 rounded-full blur-sm -z-10"
                  />
                )}
              </div>
              <span className={`text-[8px] uppercase tracking-[0.2em] font-bold transition-all duration-500 ${
                active ? 'text-gold' : 'text-cream/20'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
