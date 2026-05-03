'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Plane, 
  BarChart3, 
  Users, 
  ArrowLeft,
  Sparkles
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/requests', label: 'Richieste', icon: MessageSquare, badge: 3 },
  { href: '/dashboard/quotes', label: 'Preventivi', icon: FileText },
  { href: '/dashboard/operations', label: 'Operations', icon: Plane },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/operators', label: 'Operatori', icon: Users },
]

export default function DashboardSidebar() {
  const path = usePathname()

  return (
    <aside className="w-64 bg-darker border-r border-white/5 min-h-screen flex-shrink-0 flex flex-col pt-24">
      
      {/* Branding */}
      <div className="px-8 mb-10">
        <Link href="/" className="group flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-darker transition-all">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-sm font-serif tracking-[0.4em] text-white font-bold block">AEROJET</span>
            <span className="text-[9px] tracking-[0.2em] text-gold uppercase opacity-70">Broker OS</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = path === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all relative no-underline ${
                active ? 'text-gold' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {active && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gold/5 border-l-2 border-gold rounded-sm"
                />
              )}
              <Icon size={18} className={`${active ? 'text-gold' : 'text-white/20 group-hover:text-white/40'} transition-colors relative z-10`} />
              <span className="text-[13px] font-light tracking-wide relative z-10">{item.label}</span>
              
              {item.badge && (
                <span className="ml-auto bg-gold text-darker text-[9px] font-bold px-1.5 py-0.5 rounded-full relative z-10 shadow-lg shadow-gold/20">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Area */}
      <div className="p-8 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-bold text-xs">C</div>
          <div>
            <p className="text-[12px] text-white/80 font-medium leading-none mb-1">Corrado</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Aerojet Partner</p>
          </div>
        </div>
        
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[11px] text-gold/60 hover:text-gold no-underline transition-colors uppercase tracking-widest font-medium"
        >
          <ArrowLeft size={12} /> Torna al sito
        </Link>
      </div>
    </aside>
  )
}
