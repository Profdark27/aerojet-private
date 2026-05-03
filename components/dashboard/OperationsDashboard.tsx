'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, CheckCircle2, AlertCircle, Clock, 
  MapPin, Users, Briefcase, FileText, 
  ChevronRight, Sparkles, Bell, ArrowRight,
  ShieldCheck, Activity, Terminal, MessageSquare
} from 'lucide-react'

interface Task {
  id: string
  title: string
  category: string
  status: string
  priority: string
  description?: string
  vendorName?: string
  vendorContact?: string
  cost?: number
  currency?: string
  notesInternal?: string
  notesClient?: string
  isClientVisible: boolean
}

interface Booking {
  id: string
  fromCity: string
  toCity: string
  departureDate: string
  status: string
  totalPrice: number
  confirmationCode: string
  tailNumber?: string
  handlingAgentFrom?: string
  handlingAgentTo?: string
  flightStatus: string
  user?: { name: string; email: string; phone?: string }
  operationalTasks: Task[]
  documents?: any[]
}

export default function OperationsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [aiData, setAiData] = useState<{ alerts: any[], insights: string[], agentStatus: any[] }>({
    alerts: [],
    insights: [],
    agentStatus: []
  })

  const fetchInsights = async () => {
    try {
      const r = await fetch('/api/dashboard/operations/insights')
      if (r.ok) {
        const data = await r.json()
        setAiData(data)
      }
    } catch (err) {
      console.error('Failed to fetch AI insights', err)
    }
  }

  const fetchBookings = async () => {
    try {
      const r = await fetch('/api/dashboard/operations')
      if (!r.ok) throw new Error('Errore nel caricamento dei dati')
      const data = await r.json()
      setBookings(data)
      if (data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0])
      } else if (selectedBooking) {
        const updated = data.find((b: Booking) => b.id === selectedBooking.id)
        if (updated) setSelectedBooking(updated)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchInsights()
    const interval = setInterval(fetchInsights, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleVendorAction = async (action: string, data: any) => {
    setActionLoading(action)
    setActionStatus(null)
    try {
      const endpoints: Record<string, string> = {
        flight: '/api/operations/vendors/flight-status',
        transfer: '/api/operations/vendors/transfer-quote',
        catering: '/api/operations/vendors/catering-quote',
        whatsapp: '/api/operations/vendors/whatsapp-message'
      }
      
      const r = await fetch(endpoints[action], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const res = await r.json()
      if (!r.ok) throw new Error(res.error || 'Azione fallita')
      
      setActionStatus({ type: 'success', message: 'Operazione completata con successo' })
      if (action === 'flight') {
        await fetchBookings()
      }
    } catch (err: any) {
      setActionStatus({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDocumentVerify = async (docId: string, status: string, notesInternal?: string, notesClient?: string) => {
    setActionLoading(`doc-${docId}`)
    try {
      const r = await fetch(`/api/operations/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notesInternal, notesClient })
      })
      if (!r.ok) throw new Error('Failed to update document')
      await fetchBookings()
      setActionStatus({ type: 'success', message: 'Documento aggiornato' })
    } catch (err: any) {
      setActionStatus({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    setUpdatingTask(taskId)
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      const r = await fetch(`/api/operations/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (r.ok) {
        await fetchBookings()
      }
    } catch (err) {
      console.error('Failed to update task:', err)
    } finally {
      setUpdatingTask(null)
    }
  }

  const updateBookingDetails = async (bookingId: string, data: any) => {
    setActionLoading('update-booking')
    try {
      const r = await fetch(`/api/operations/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!r.ok) throw new Error('Failed to update booking')
      await fetchBookings()
    } catch (err: any) {
      setActionStatus({ type: 'error', message: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-darker">
        <div className="flex flex-col items-center gap-4">
          <Plane className="text-gold animate-bounce" size={32} />
          <div className="animate-pulse text-gold font-light tracking-[0.4em] uppercase text-[10px]">Sincronizzazione Operativa...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-darker text-cream overflow-hidden">
      
      {/* 1. Left Feed: Bookings */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-dark/30">
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-gold animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] text-gold uppercase font-bold">Live Logistics</span>
          </div>
          <h2 className="text-2xl font-serif font-medium">Voli Attivi</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {bookings.map(booking => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedBooking(booking)}
              className={`p-6 cursor-pointer transition-all relative ${
                selectedBooking?.id === booking.id 
                  ? 'bg-gold/[0.04] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-gold' 
                  : 'hover:bg-white/[0.02] border-b border-white/[0.02]'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] tracking-widest text-gold/60 font-mono font-bold uppercase">{booking.confirmationCode}</span>
                <span className={`text-[8px] px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase ${
                  booking.flightStatus === 'ARRIVED' ? 'bg-emerald-500/10 text-emerald-400' :
                  booking.flightStatus === 'AIRBORNE' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gold/10 text-gold'
                }`}>
                  {booking.flightStatus}
                </span>
              </div>
              <div className="text-sm font-medium mb-2 tracking-wide">{booking.fromCity} → {booking.toCity}</div>
              <div className="flex items-center justify-between text-[11px] text-white/30">
                <div className="flex items-center gap-2 font-light">
                  <Clock size={12} /> 
                  {new Date(booking.departureDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </div>
                <div className="text-gold/40 font-bold tracking-wider">{booking.tailNumber || 'TBD'}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="bg-noise opacity-[0.02]" />
        <AnimatePresence mode="wait">
          {selectedBooking ? (
            <motion.div 
              key={selectedBooking.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col z-10"
            >
              {/* Header Detail */}
              <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-4xl font-serif font-light mb-8 flex items-center gap-4">
                      {selectedBooking.fromCity} 
                      <ArrowRight className="text-gold/40" size={28} /> 
                      {selectedBooking.toCity}
                    </h1>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                      {[
                        { label: 'Cliente', value: selectedBooking.user?.name || 'Cliente', sub: selectedBooking.user?.email },
                        { label: 'Tail Number', field: 'tailNumber', placeholder: 'NON ASSEGNATO' },
                        { label: 'FBO Origin', field: 'handlingAgentFrom', placeholder: 'DA CONFERMARE' },
                        { label: 'FBO Dest.', field: 'handlingAgentTo', placeholder: 'DA CONFERMARE' },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2 font-bold">{item.label}</div>
                          {item.field ? (
                            <input 
                              type="text"
                              defaultValue={(selectedBooking as any)[item.field]}
                              onBlur={(e) => updateBookingDetails(selectedBooking.id, { [item.field as string]: e.target.value })}
                              className="luxury-input !py-1 text-sm text-gold font-medium"
                              placeholder={item.placeholder}
                            />
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-cream">{item.value}</div>
                              {item.sub && <div className="text-[10px] text-white/20 font-light mt-1">{item.sub}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap gap-4 items-center">
                      {[
                        { id: 'flight', icon: Plane, label: 'Check Status', color: 'gold', disabled: !selectedBooking.tailNumber },
                        { id: 'transfer', icon: MapPin, label: 'Request Transfer', color: 'blue' },
                        { id: 'catering', icon: Sparkles, label: 'Order Catering', color: 'emerald' },
                        { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', color: 'pink' }
                      ].map(action => (
                        <button 
                          key={action.id}
                          disabled={actionLoading === action.id || action.disabled}
                          onClick={() => handleVendorAction(action.id, { bookingId: selectedBooking.id })}
                          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all border border-white/5
                            ${action.color === 'gold' ? 'bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold/30' : ''}
                            ${action.color === 'blue' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30' : ''}
                            ${action.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30' : ''}
                            ${action.color === 'pink' ? 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/30' : ''}
                            disabled:opacity-20 disabled:grayscale
                          `}
                        >
                          <action.icon size={14} />
                          {actionLoading === action.id ? 'Processing...' : action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] tracking-[0.4em] text-gold/60 mb-2 font-bold uppercase">Operations Status</div>
                    <select 
                      value={selectedBooking.flightStatus}
                      onChange={(e) => updateBookingDetails(selectedBooking.id, { flightStatus: e.target.value })}
                      className="bg-dark/40 border border-white/10 rounded-sm px-4 py-2 text-lg font-light text-right outline-none cursor-pointer hover:border-gold/40 transition-all text-cream"
                    >
                      {['SCHEDULED', 'AIRBORNE', 'ARRIVED', 'DELAYED', 'CANCELLED'].map(s => (
                        <option key={s} value={s} className="bg-darker">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Area */}
              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <AnimatePresence>
                    {selectedBooking.operationalTasks.map(task => (
                      <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group p-6 glass-panel transition-all rounded-sm border-white/[0.03] ${
                          task.status === 'COMPLETED' ? 'opacity-40 grayscale-[0.5]' : 'hover:border-gold/30 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-2.5 rounded-sm ${
                            task.category === 'DOCUMENTS' ? 'bg-blue-500/10 text-blue-400' :
                            task.category === 'FLIGHT' ? 'bg-purple-500/10 text-purple-400' :
                            task.category === 'TRANSFER' ? 'bg-orange-500/10 text-orange-400' :
                            task.category === 'CATERING' ? 'bg-emerald-500/10 text-emerald-400' :
                            task.category === 'CLIENT' ? 'bg-pink-500/10 text-pink-400' :
                            'bg-gold/10 text-gold'
                          }`}>
                            {task.category === 'DOCUMENTS' ? <FileText size={20} /> : 
                             task.category === 'FLIGHT' ? <Plane size={20} /> : 
                             task.category === 'TRANSFER' ? <MapPin size={20} /> :
                             task.category === 'CATERING' ? <Sparkles size={20} /> :
                             task.category === 'CLIENT' ? <Users size={20} /> :
                             <Briefcase size={20} />}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {task.priority === 'URGENT' && (
                              <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-sm font-bold tracking-[0.2em] uppercase">Urgent</span>
                            )}
                            <button 
                              onClick={() => toggleTask(task.id, task.status)}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                task.status === 'COMPLETED' 
                                  ? 'bg-emerald-500 border-emerald-500 text-darker' 
                                  : 'border-white/10 hover:border-gold/50 group-hover:bg-gold/5'
                              }`}
                            >
                              {task.status === 'COMPLETED' ? <CheckCircle2 size={14} strokeWidth={3} /> : (
                                updatingTask === task.id ? <div className="w-2 h-2 rounded-full bg-gold animate-ping" /> : null
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-md font-medium mb-2 tracking-wide">{task.title}</h3>
                          <p className="text-[12px] text-white/30 leading-relaxed font-light">{task.description}</p>
                        </div>

                        {(task.vendorName || task.cost) && (
                          <div className="pt-5 border-t border-white/[0.05] flex justify-between items-end">
                            <div>
                              <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-1.5 font-bold">Vendor</div>
                              <div className="text-[11px] text-gold font-medium">{task.vendorName || 'Not Assigned'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] mb-1.5 font-bold">Estimated Cost</div>
                              <div className="text-[12px] text-white/70 font-mono">€{task.cost?.toLocaleString('it-IT') || '—'}</div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-6">
              <ShieldCheck size={64} className="opacity-10 stroke-1" />
              <div className="text-[10px] tracking-[0.5em] uppercase font-light">Seleziona un'operazione per iniziare</div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Right Sidebar: AI Intelligence */}
      <div className="w-80 border-l border-white/5 bg-dark/50 flex flex-col p-8 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-sm bg-gold/10 flex items-center justify-center text-gold">
            <Terminal size={16} />
          </div>
          <h2 className="text-[11px] tracking-[0.4em] text-gold font-bold uppercase">AeroJet AI OS</h2>
        </div>

        {/* Dynamic Alerts */}
        <div className="mb-12">
          <div className="text-[9px] text-white/20 uppercase mb-6 tracking-[0.4em] font-bold">Operational Alerts</div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {aiData.alerts.length > 0 ? aiData.alerts.map(alert => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    const b = bookings.find(bk => bk.id === alert.bookingId)
                    if (b) setSelectedBooking(b)
                  }}
                  className={`p-4 rounded-sm cursor-pointer border-l-2 transition-all ${
                    alert.type === 'CRITICAL' 
                      ? 'bg-red-500/[0.03] border-red-500/40 hover:bg-red-500/[0.08]' 
                      : 'bg-orange-500/[0.03] border-orange-500/40 hover:bg-orange-500/[0.08]'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <AlertCircle size={14} className={alert.type === 'CRITICAL' ? 'text-red-400 mt-0.5' : 'text-orange-400 mt-0.5'} />
                    <div className={`text-[11px] leading-relaxed font-light ${alert.type === 'CRITICAL' ? 'text-red-100/60' : 'text-orange-100/60'}`}>
                      {alert.message}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-[11px] text-white/10 italic font-light">Nessun alert critico rilevato</div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Agents Status */}
        <div className="mb-12">
          <div className="text-[9px] text-white/20 uppercase mb-6 tracking-[0.4em] font-bold">Active Agents</div>
          <div className="space-y-5">
            {aiData.agentStatus.map(agent => (
              <div key={agent.name} className="flex items-center justify-between">
                <div className="text-[12px] font-light text-white/60">{agent.name}</div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{agent.status}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${agent.color} shadow-[0_0_8px] ${agent.color === 'bg-green-500' ? 'shadow-green-500/40' : 'shadow-gold/40'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-auto p-6 glass-panel border-gold/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <Sparkles size={40} className="text-gold" />
          </div>
          <div className="text-[9px] text-gold mb-4 uppercase font-black tracking-[0.3em] flex items-center gap-2">
            <Sparkles size={12} /> Strategic Suggestions
          </div>
          <div className="space-y-4">
            {aiData.insights.map((insight, idx) => (
              <p key={idx} className="text-[11px] text-white/50 leading-relaxed italic font-light border-b border-white/[0.03] pb-3 last:border-0 last:pb-0">
                "{insight}"
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
