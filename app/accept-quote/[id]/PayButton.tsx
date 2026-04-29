'use client'
import { useState } from 'react'

export default function PayButton({ quoteId, depositAmount }: { quoteId: string; depositAmount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Errore durante il checkout')
        setLoading(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Errore di rete. Riprova o contatta il concierge.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          display: 'inline-block',
          background: loading ? 'rgba(201,168,76,0.5)' : '#C9A84C',
          color: '#0A0C14',
          padding: '18px 48px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Helvetica Neue, sans-serif',
          fontSize: 12,
          letterSpacing: 3,
          fontWeight: 600,
          width: '100%',
          transition: 'background 0.2s',
        }}
      >
        {loading
          ? 'REINDIRIZZAMENTO...'
          : `ACCETTA E PAGA DEPOSITO — €${depositAmount.toLocaleString('it-IT')}`}
      </button>
      {error && (
        <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', marginTop: 12, textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
