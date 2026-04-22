'use client'
import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type'], duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons = { success: '✦', error: '✕', info: '◆', warning: '⚠' }
const colors = { success: '#4ade80', error: '#f87171', info: '#C9A84C', warning: '#fb923c' }

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration ?? 4000)
    return () => { clearTimeout(t); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, toast.duration, onRemove])

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: '#0F1220', border: `1px solid ${colors[toast.type]}30`,
      borderLeft: `3px solid ${colors[toast.type]}`,
      padding: '14px 18px', minWidth: 280, maxWidth: 400,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }} onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}>
      <span style={{ color: colors[toast.type], flexShrink: 0, fontSize: 14, marginTop: 1 }}>
        {icons[toast.type]}
      </span>
      <span style={{ fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.85)', lineHeight: 1.5, flex: 1 }}>
        {toast.message}
      </span>
      <span style={{ color: 'rgba(240,237,230,0.25)', fontSize: 16, flexShrink: 0, lineHeight: 1 }}>×</span>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
