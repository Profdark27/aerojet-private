'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Linkedin, Send, Image as ImageIcon, Layout, Check, AlertCircle, ExternalLink, RefreshCcw, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SocialPost {
  id: string
  type: 'EMPTY_LEG' | 'PROMO' | 'FLEET'
  title: string
  content: string
  imageUrl: string
  route?: string
  price?: number
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    type: 'EMPTY_LEG',
    title: 'Milano → Londra · Elite Opportunity',
    content: 'Experience the Phenom 300E at an unprecedented charter rate. Direct flight vector scheduled for tomorrow 10:00 UTC.',
    imageUrl: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800&auto=format&fit=crop',
    route: 'Milano (LIN) → Londra (FAB)',
    price: 3400
  },
  {
    id: '2',
    type: 'FLEET',
    title: 'Fleet Spotlight: Bombardier Global 7500',
    content: 'The zenith of transcontinental luxury. Unmatched range meets a cabin designed for operational mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?q=80&w=800&auto=format&fit=crop',
  }
]

export default function SocialCenter() {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConnect = () => {
    setIsConnected(true) // Mock for simulation
  }

  const handlePost = async () => {
    if (!selectedPost) return
    setIsPosting(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsPosting(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gold rounded-full" />
              <h2 className="text-[10px] text-gold uppercase tracking-[0.5em] font-bold">Marketing Intelligence Hub</h2>
           </div>
           <p className="text-white/30 text-sm font-light italic">Automated distribution and professional presence across verified networks.</p>
        </div>
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            className="flex items-center gap-3 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-black hover:bg-[#0077b5] hover:text-white transition-all shadow-lg"
          >
            <Linkedin size={16} /> CONNECT PROFESSIONAL NETWORK
          </button>
        ) : (
          <div className="flex items-center gap-3 text-emerald-400 text-[10px] uppercase tracking-widest font-black bg-emerald-400/5 border border-emerald-400/20 px-6 py-4 rounded-2xl">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            SECURE LINK ACTIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Post Selection Sidebar */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black">AI Post Directives</h3>
             <button className="text-gold/50 hover:text-gold transition-colors text-[9px] font-bold flex items-center gap-2 tracking-widest">
                <RefreshCcw size={12} /> REGENERATE
             </button>
          </div>
          
          <div className="space-y-4">
            {mockPosts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPost(post)}
                className={`p-6 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden ${
                  selectedPost?.id === post.id 
                    ? 'bg-gold/5 border-gold/40 shadow-[0_0_30px_rgba(201,168,76,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex gap-6 relative z-10">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-white/20 transition-all">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-[8px] text-gold uppercase tracking-[0.4em] font-black">{post.type}</div>
                    <h4 className="text-base font-serif text-white tracking-tight leading-tight">{post.title}</h4>
                    <p className="text-[11px] text-white/20 line-clamp-2 leading-relaxed italic">{post.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cinematic Preview Panel */}
        <div className="xl:col-span-7">
           <div className="glass-card p-10 lg:p-14 rounded-[3rem] border border-white/5 relative overflow-hidden h-full flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-12">
                 <div className="h-px w-6 bg-gold/50" />
                 <span className="text-[9px] uppercase tracking-[0.5em] text-white/40 font-bold">Protocol Preview</span>
              </div>

              <AnimatePresence mode="wait">
                {selectedPost ? (
                  <motion.div 
                    key={selectedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-10 flex-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif text-2xl shadow-inner">A</div>
                      <div>
                        <div className="text-lg text-white font-serif tracking-tight">AeroJet Private</div>
                        <div className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-0.5">Premier Mission Support</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-sm text-white/70 leading-relaxed font-light">
                        {selectedPost.content}
                       </p>
                       {selectedPost.route && (
                         <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 group/item">
                            <Sparkles size={16} className="text-gold/40" />
                            <span className="text-xs text-white/60 font-serif italic tracking-wide">{selectedPost.route}</span>
                         </div>
                       )}
                       <div className="text-[10px] text-gold/30 uppercase tracking-[0.3em] font-black">
                         #PrivateJet #EliteTravel #AeroJetMission
                       </div>
                    </div>

                    <div className="aspect-video rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative group/img">
                      <img src={selectedPost.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <div className="pt-10 mt-auto border-t border-white/5 flex items-center justify-between">
                      <div className="flex gap-6 text-white/10">
                        <Linkedin size={20} className="hover:text-gold transition-colors cursor-pointer" />
                        <ImageIcon size={20} className="hover:text-gold transition-colors cursor-pointer" />
                        <Layout size={20} className="hover:text-gold transition-colors cursor-pointer" />
                      </div>
                      <button 
                        disabled={isPosting || !isConnected}
                        onClick={handlePost}
                        className="btn-gold-premium px-16 py-6 text-xs disabled:opacity-20 shadow-2xl group/post"
                      >
                        {isPosting ? 'SYNCHRONIZING...' : 'AUTHORIZE BROADCAST ✦'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                       <AlertCircle size={32} className="text-white/5" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs text-white/30 uppercase tracking-[0.3em] font-black">Waiting for directive</h4>
                       <p className="text-[11px] text-white/10 italic">Select an AI-generated post from the hub to initiate broadcast protocols.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-x-10 bottom-10 bg-emerald-500 text-white p-6 rounded-3xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(16,185,129,0.4)] z-[100]"
                  >
                    <Check size={20} strokeWidth={4} /> MISSION BROADCAST SUCCESSFUL
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  )
}
