'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plane, MapPin, Clock, Users, 
  MessageSquare, ChevronLeft, ShieldCheck, 
  Car, Coffee, FileText, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface TripData {
  id: string
  confirmationCode: string
  fromCity: string
  toCity: string
  departureDate: string
  pax: number
  status: string
  flightStatus: string
  tailNumber?: string
  handlingAgentFrom?: string
  handlingAgentTo?: string
  depositPaid: boolean
  operationalTasks: any[]
  clientName: string
}

export default function TripPortal({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<TripData | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/trip/${params.id}`).then(r => r.ok ? r.json() : Promise.reject('Accesso negato')),
      fetch(`/api/trip/${params.id}/documents`).then(r => r.ok ? r.json() : [])
    ])
    .then(([tripData, docsData]) => {
      setTrip(tripData)
      setDocuments(docsData)
    })
    .catch(err => setError(err))
    .finally(() => setLoading(false))
  }, [params.id])

  const [uploading, setUploading] = useState<string | null>(null)

  const handleUpload = async (docId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.pdf'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      setUploading(docId)
      
      // Simulate premium upload experience with slight delay
      await new Promise(r => setTimeout(r, 1500))

      const dummyUrl = `https://storage.aerojet.app/docs/${docId}_${Date.now()}.pdf`
      try {
        const r = await fetch(`/api/trip/${params.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId, fileUrl: dummyUrl })
        })
        if (r.ok) {
          setDocuments(docs => docs.map(d => d.id === docId ? { ...d, status: 'UPLOADED', fileUrl: dummyUrl } : d))
        }
      } catch (err) {
        console.error('Upload failed:', err)
      } finally {
        setUploading(null)
      }
    }
    input.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C14] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[#C9A84C] font-light tracking-[0.4em] uppercase text-[10px]"
        >
          Recupero dati di volo...
        </motion.div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#0A0C14] flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck size={48} className="text-red-500/20 mb-6" />
        <h1 className="text-xl font-light mb-2">Accesso Non Autorizzato</h1>
        <p className="text-white/40 text-sm mb-8">Non è stato possibile caricare i dettagli di questo viaggio. Verifichi il link ricevuto via email.</p>
        <Link href="/" className="px-8 py-3 border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] tracking-widest uppercase font-medium">Torna alla Home</Link>
      </div>
    )
  }

  const departureDate = new Date(trip.departureDate)

  return (
    <div className="min-h-screen bg-[#0A0C14] text-[#F0EDE6] pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C9A84C]/5 via-transparent to-transparent pointer-events-none" />

      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-[#0A0C14]/80 backdrop-blur-md border-b border-[#C9A84C]/10 px-6 py-4 flex items-center justify-between">
        <Link href="/profile" className="text-white/40 hover:text-[#C9A84C] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="text-[10px] tracking-[0.3em] font-semibold text-[#C9A84C] uppercase">Il Suo Viaggio</div>
        <div className="w-5" /> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto px-6 pt-8">
        
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F1220] border border-[#C9A84C]/20 p-6 rounded-sm shadow-2xl relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Plane size={80} className="-rotate-12" />
          </div>

          <div className="mb-8">
            <div className="text-[9px] tracking-widest text-[#C9A84C] uppercase mb-4 flex items-center gap-2">
              <Sparkles size={10} /> Concierge Confermato
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-light tracking-tight">{trip.fromCity}</h1>
                <div className="h-px w-8 bg-[#C9A84C] my-3" />
                <h1 className="text-4xl font-light tracking-tight">{trip.toCity}</h1>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-widest text-white/30 uppercase mb-1">Codice</div>
                <div className="text-xl font-medium text-[#C9A84C]">{trip.confirmationCode}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div>
              <div className="text-[9px] tracking-widest text-white/30 uppercase mb-1">Data Partenza</div>
              <div className="text-sm">{departureDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
            <div>
              <div className="text-[9px] tracking-widest text-white/30 uppercase mb-1">Stato Volo</div>
              <div className="text-sm text-green-400">{trip.flightStatus}</div>
            </div>
          </div>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          
          {/* Flight Details Section */}
          <div className="bg-[#0F1220] border border-white/5 p-5 rounded-sm">
            <h3 className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-4 font-bold flex items-center gap-2">
              <Plane size={14} /> Logistica Aeromobile
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-white/40">Velivolo (Matricola)</span>
                <span className="text-sm font-medium">{trip.tailNumber || 'Assegnazione in corso'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-white/40">FBO Partenza</span>
                <span className="text-sm">{trip.handlingAgentFrom || 'TBD'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-white/40">FBO Arrivo</span>
                <span className="text-sm">{trip.handlingAgentTo || 'TBD'}</span>
              </div>
            </div>
          </div>

          {/* Logistics Tasks (Client Visible) */}
          {trip.operationalTasks.length > 0 && (
            <div className="bg-[#0F1220] border border-white/5 p-5 rounded-sm">
              <h3 className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-4 font-bold flex items-center gap-2">
                <Sparkles size={14} /> Dettagli Concierge
              </h3>
              <div className="space-y-6">
                {trip.operationalTasks.map((task: any) => (
                  <div key={task.id} className="border-l border-[#C9A84C]/30 pl-4 py-1">
                    <div className="text-[12px] font-medium mb-1">{task.title}</div>
                    <div className="text-[11px] text-white/40 leading-relaxed mb-2">{task.description || task.notesClient}</div>
                    {task.vendorName && (
                      <div className="flex items-center gap-2 text-[10px] text-[#C9A84C]">
                        {task.category === 'TRANSFER' ? <Car size={10} /> : <Coffee size={10} />}
                        {task.vendorName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passenger Documents Section */}
          <div className="bg-[#0F1220] border border-white/5 p-5 rounded-sm">
            <h3 className="text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-4 font-bold flex items-center gap-2">
              <FileText size={14} /> Documenti Passeggeri
            </h3>
            <div className="space-y-4">
              {documents.length > 0 ? (
                documents.map((doc: any) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5">
                    <div>
                      <div className="text-[12px] font-medium">{doc.type}</div>
                      <div className="text-[10px] text-white/40">{doc.passengerName}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] uppercase tracking-tighter mb-1 ${
                        doc.status === 'VERIFIED' ? 'text-green-400' :
                        doc.status === 'REJECTED' ? 'text-red-400' :
                        doc.status === 'UPLOADED' ? 'text-blue-400' : 'text-[#C9A84C]'
                      }`}>
                        {doc.status}
                      </div>
                      {doc.status === 'REQUESTED' && (
                        <button 
                          disabled={uploading === doc.id}
                          onClick={() => handleUpload(doc.id)}
                          className="text-[9px] text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-1 hover:bg-[#C9A84C]/10 transition-all uppercase disabled:opacity-30"
                        >
                          {uploading === doc.id ? 'Caricamento...' : 'Carica'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-white/20 italic">Nessun documento richiesto al momento.</div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-5 rounded-sm text-center">
            <h3 className="text-[13px] font-medium mb-2">Assistenza Concierge 24/7</h3>
            <p className="text-[11px] text-white/50 mb-6 leading-relaxed">Il suo assistente dedicato è a disposizione per ogni richiesta last-minute.</p>
            <div className="flex gap-3">
              <a 
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '393471234567'}`}
                className="flex-1 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] py-3 rounded-sm text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> WhatsApp
              </a>
              <a 
                href={`tel:${process.env.NEXT_PUBLIC_CONCIERGE_PHONE || '+393471234567'}`}
                className="flex-1 bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] py-3 rounded-sm text-[10px] tracking-widest uppercase font-bold flex items-center justify-center gap-2"
              >
                Chiamata
              </a>
            </div>
          </div>

        </div>

        <div className="text-center text-[10px] text-white/20 uppercase tracking-[0.4em] pt-8">
          AeroJet Private · Excellence in Aviation
        </div>

      </div>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <Link 
          href="/profile"
          className="w-full bg-[#F0EDE6] text-[#0A0C14] py-4 rounded-full text-[11px] tracking-widest uppercase font-bold flex items-center justify-center gap-2 shadow-2xl"
        >
          <FileText size={16} /> I Miei Documenti
        </Link>
      </div>

    </div>
  )
}
