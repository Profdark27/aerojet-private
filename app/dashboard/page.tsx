'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from 'recharts'
import { 
  Users, TrendingUp, DollarSign, Send, 
  Search, Filter, MoreHorizontal, MessageCircle, 
  Zap, Crown, Calendar, MapPin, ArrowUpRight,
  LayoutDashboard, Mail, Settings, Bell, Linkedin,
  Shield, Activity, Globe
} from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/tracking'
import { formatCurrency } from '@/lib/utils'
import SocialCenter from '@/components/dashboard/SocialCenter'

export default function DashboardPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      fetch('/api/inquiries?limit=20&orderBy=score').then(r => r.json()),
      fetch('/api/dashboard/stats?period=quarter').then(r => r.json())
    ])
    .then(([inq, st]) => {
      setInquiries(inq.inquiries || [])
      setStats(st)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const kpis = [
    { label: 'Revenue YTD', value: formatCurrency(stats?.kpis?.revenueYTD || 0), icon: DollarSign, color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.1)]' },
    { label: 'Commissioni', value: formatCurrency(stats?.kpis?.commissionYTD || 0), icon: TrendingUp, color: 'text-gold', glow: 'shadow-[0_0_20px_rgba(201,168,76,0.1)]' },
    { label: 'Lead Attivi', value: stats?.kpis?.inquiriesTotal || 0, icon: Users, color: 'text-neon-blue', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
    { label: 'Conversion', value: `${stats?.kpis?.conversionRate || 0}%`, icon: Zap, color: 'text-neon-purple', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.1)]' },
  ]

  return (
    <div className="min-h-screen bg-darker flex text-white/90 selection:bg-gold/30">
      
      {/* 1. Futuristic Sidebar */}
      <aside className="w-20 lg:w-72 border-r border-white/5 flex flex-col py-10 px-6 gap-16 sticky top-0 h-screen bg-black/20 backdrop-blur-3xl z-50">
        <Link href="/" className="flex items-center gap-4 px-2 no-underline group">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-all duration-500 shadow-2xl">
            <Crown size={20} className="text-gold" />
          </div>
          <div className="flex flex-col hidden lg:block">
            <span className="text-sm font-bold tracking-[0.4em] text-white">AEROJET</span>
            <span className="text-[8px] tracking-[0.3em] text-gold uppercase font-bold">Command Center</span>
          </div>
        </Link>

        <nav className="flex-1 w-full space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Mission Overview' },
            { id: 'requests', icon: Activity, label: 'Active Pipeline' },
            { id: 'social', icon: Linkedin, label: 'Marketing Hub' },
            { id: 'calendar', icon: Calendar, label: 'Flight Ops' },
            { id: 'clients', icon: Globe, label: 'Global Clients' },
            { id: 'settings', icon: Settings, label: 'Configuratore' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative ${
                activeTab === item.id 
                  ? 'bg-white/5 text-white border border-white/10' 
                  : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="navGlow" className="absolute left-0 w-1 h-6 bg-gold rounded-full shadow-[0_0_15px_#C9A84C]" />
              )}
              <item.icon size={20} className={activeTab === item.id ? 'text-gold' : ''} />
              <span className="text-[11px] uppercase tracking-widest font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Security Badge */}
        <div className="hidden lg:flex flex-col gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
          <Shield size={24} className="text-emerald-500/50" />
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest font-bold text-white/40">Secure Session</div>
            <div className="text-[10px] text-emerald-500 font-bold tracking-tighter">AES-256 ENCRYPTED</div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Space */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.05),transparent_50%)]">
        
        {/* Cinematic Header */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16 relative">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-gold/50" />
               <span className="text-[8px] uppercase tracking-[0.5em] text-gold font-bold">Terminal 01</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
              {activeTab === 'social' ? 'Social Elite' : 'Mission Command'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] uppercase tracking-widest text-white/30">System Status</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                ONLINE / OPERATIONAL
              </span>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <button className="btn-gold-premium px-10 py-5 rounded-full shadow-2xl">
              NUOVA MISSIONE ✦
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* KPI Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {kpis.map((kpi, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className={`glass-card p-10 rounded-[2.5rem] relative overflow-hidden group border border-white/5 ${kpi.glow}`}
                  >
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                      <kpi.icon size={80} />
                    </div>
                    <span className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold block mb-6">
                      {kpi.label}
                    </span>
                    <div className={`text-4xl font-light tracking-tighter ${kpi.color}`}>
                      {kpi.value}
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-400/5 py-2 px-4 rounded-full w-fit">
                      <ArrowUpRight size={12} /> +12.4%
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Data Intelligence Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card p-12 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-[10px] text-gold uppercase tracking-[0.5em] font-bold">Revenue Intelligence</h3>
                    <div className="flex gap-4">
                      {['7D', '30D', '90D'].map(p => (
                        <button key={p} className="text-[9px] text-white/20 hover:text-white font-bold px-3 py-1 rounded-full border border-white/5">{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.dailyInquiries || []}>
                        <defs>
                          <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" axisLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.2)" axisLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                          itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="commissioni" stroke="#C9A84C" fillOpacity={1} fill="url(#colorGold)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-12 rounded-[2.5rem] border border-white/5">
                  <h3 className="text-[10px] text-gold uppercase tracking-[0.5em] font-bold mb-12">Lead Optimization</h3>
                  <div className="space-y-10">
                    {stats?.leadFunnel?.map((item: any, i: number) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{item.status}</span>
                          <span className="text-xl font-light text-white">{item.count}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / (stats?.kpis?.inquiriesTotal || 1)) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full bg-gradient-to-r from-gold/40 to-gold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mission Table */}
              <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5">
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-[10px] text-gold uppercase tracking-[0.5em] font-bold">Active Missions Pipeline</h3>
                  <button className="text-white/20 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                </div>
                <div className="overflow-x-auto px-6 pb-6">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-[0.4em] text-white/20 border-b border-white/5">
                        <th className="px-8 py-8 font-bold">Mission Priority / ID</th>
                        <th className="px-8 py-8 font-bold">Route Vector</th>
                        <th className="px-8 py-8 font-bold">System Status</th>
                        <th className="px-8 py-8 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {inquiries.map((lead, idx) => (
                        <tr key={lead.id} className="hover:bg-white/[0.01] transition-all group">
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${idx % 3 === 0 ? 'bg-gold animate-pulse' : 'bg-white/10'}`} />
                              <div className="flex flex-col gap-1">
                                <span className="text-[13px] text-white font-bold tracking-tight">{lead.name}</span>
                                <span className="text-[10px] text-white/20 font-mono">AJ-X{lead.id.slice(-4).toUpperCase()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">{lead.fromCity}</span>
                              <ArrowUpRight size={12} className="text-gold opacity-30" />
                              <span className="text-white font-medium">{lead.toCity}</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className="text-[8px] uppercase tracking-[0.3em] font-black px-4 py-1.5 bg-gold/5 border border-gold/20 rounded-full text-gold">
                              {lead.pipelineStatus}
                            </span>
                          </td>
                          <td className="px-8 py-8 text-right">
                             <div className="flex items-center justify-end gap-4 opacity-20 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60"><MessageCircle size={16} /></button>
                               <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60"><ArrowUpRight size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div 
              key="social"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <SocialCenter />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

import Link from 'next/link'
