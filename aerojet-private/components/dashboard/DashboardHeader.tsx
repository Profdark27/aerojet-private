'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import NotificationBell from './NotificationBell'
import { useDashboardShortcuts, KeyboardShortcutsHelp } from './KeyboardShortcuts'

export default function DashboardHeader() {
  const { data: session } = useSession()
  const { showHelp, setShowHelp, shortcuts } = useDashboardShortcuts()

  return (
    <>
      <KeyboardShortcutsHelp show={showHelp} onClose={() => setShowHelp(false)} shortcuts={shortcuts} />
      <div style={{ position: 'fixed', top: 0, right: 0, left: 240, zIndex: 50, background: 'rgba(10,12,20,0.95)', borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(12px)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
        {session?.user ? (
          <>
            <button onClick={() => setShowHelp(true)} title="Scorciatoie tastiera (?)"
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(240,237,230,0.3)', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.3)' }}>
              ?
            </button>
            <NotificationBell />
            <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {session.user.image
                ? <img src={session.user.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.3)' }} />
                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0A0C14' }}>{session.user.name?.[0] || session.user.email?.[0] || '?'}</div>
              }
              <div>
                <div style={{ fontSize: 13, color: '#F0EDE6' }}>{session.user.name || session.user.email}</div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{session.user.role}</div>
              </div>
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(201,168,76,0.15)' }} />
            <button onClick={() => signOut({ callbackUrl: '/' })}
              style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.45)', padding: '6px 14px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.45)' }}>
              ESCI
            </button>
          </>
        ) : (
          <Link href="/login" style={{ fontSize: 12, letterSpacing: 2, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 18px' }}>ACCEDI</Link>
        )}
      </div>
    </>
  )
}
