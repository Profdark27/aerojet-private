'use client'
import { useState, useEffect } from 'react'
import { trackEvent } from '@/lib/tracking'

export default function PayButton({ quoteId, depositAmount }: { quoteId: string; depositAmount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    trackEvent('quote_viewed', { quoteId })
  }, [quoteId])

  async function handlePay() {
    trackEvent('quote_payment_clicked', { quoteId, depositAmount })
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
          padding: '20px 48px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Helvetica Neue, sans-serif',
          fontSize: 13,
          letterSpacing: 2,
          fontWeight: 600,
          width: '100%',
          transition: 'all 0.3s ease',
          boxShadow: loading ? 'none' : '0 0 20px rgba(201,168,76,0.25)',
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 35px rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.25)'; e.currentTarget.style.transform = 'translateY(0)' } }}
      >
        {loading
          ? 'ELABORAZIONE...'
          : `CONFERMA E BLOCCA IL JET — €${depositAmount.toLocaleString('it-IT')}`}
      </button>
      {error && (
        <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', marginTop: 12, textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  )
}
