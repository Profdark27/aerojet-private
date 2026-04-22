'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  mod?: 'ctrl' | 'alt'
  label: string
  action: () => void
}

export function useDashboardShortcuts() {
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)

  const shortcuts: Shortcut[] = [
    { key: 'g h', label: 'Go → Overview', action: () => router.push('/dashboard') },
    { key: 'g r', label: 'Go → Richieste', action: () => router.push('/dashboard/requests') },
    { key: 'g q', label: 'Go → Preventivi', action: () => router.push('/dashboard/quotes') },
    { key: 'g a', label: 'Go → Analytics', action: () => router.push('/dashboard/analytics') },
    { key: 'g o', label: 'Go → Operatori', action: () => router.push('/dashboard/operators') },
    { key: 'g s', label: 'Go → Sito', action: () => router.push('/') },
    { key: '?', label: 'Mostra scorciatoie', action: () => setShowHelp(h => !h) },
  ]

  const handle = useCallback((e: KeyboardEvent) => {
    // Skip if focus is on input/textarea
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.ctrlKey || e.metaKey) return

    if (e.key === '?') { setShowHelp(h => !h); return }
    if (e.key === 'Escape') { setShowHelp(false); return }

    // Two-key sequences: g + key
    if (e.key === 'g') {
      const handler = (e2: KeyboardEvent) => {
        document.removeEventListener('keydown', handler)
        const seq = `g ${e2.key}`
        const match = shortcuts.find(s => s.key === seq)
        if (match) match.action()
      }
      document.addEventListener('keydown', handler, { once: true })
    }
  }, [router])

  useEffect(() => {
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [handle])

  return { showHelp, setShowHelp, shortcuts }
}

export function KeyboardShortcutsHelp({ show, onClose, shortcuts }: {
  show: boolean
  onClose: () => void
  shortcuts: Shortcut[]
}) {
  if (!show) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 1, background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', padding: '36px 40px', minWidth: 360, animation: 'fadeInUp 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>SCORCIATOIE TASTIERA</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shortcuts.map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
              <span style={{ fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif' }}>{s.label}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {s.key.split(' ').map((k, i) => (
                  <kbd key={i} style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '2px 8px', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', borderRadius: 2 }}>{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 24, textAlign: 'center' }}>
          Premi <kbd style={{ border: '1px solid rgba(201,168,76,0.2)', padding: '1px 6px', color: '#C9A84C', fontSize: 10 }}>?</kbd> per mostrare/nascondere · <kbd style={{ border: '1px solid rgba(201,168,76,0.2)', padding: '1px 6px', color: '#C9A84C', fontSize: 10 }}>esc</kbd> per chiudere
        </p>
      </div>
    </div>
  )
}
