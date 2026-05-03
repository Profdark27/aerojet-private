'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0C14] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-px bg-[#C9A84C] mx-auto mb-12 opacity-60" />

        <p className="text-[#C9A84C] text-sm tracking-[0.4em] uppercase mb-4 opacity-70">
          Si è verificato un errore
        </p>

        <h2 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Qualcosa è andato storto
        </h2>
        <p className="text-white/40 text-sm mb-12 leading-relaxed">
          Si è verificato un errore imprevisto.<br />
          Il nostro team è stato notificato.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="border border-[#C9A84C] text-[#C9A84C] px-6 py-3 text-xs tracking-[0.3em] uppercase hover:bg-[#C9A84C] hover:text-[#0A0C14] transition-all duration-300"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="border border-white/20 text-white/50 px-6 py-3 text-xs tracking-[0.3em] uppercase hover:border-white/40 hover:text-white/70 transition-all duration-300"
          >
            Homepage
          </Link>
        </div>

        <div className="w-16 h-px bg-[#C9A84C] mx-auto mt-12 opacity-60" />
      </div>
    </div>
  )
}
