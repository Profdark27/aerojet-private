'use client'
/**
 * In dev senza OAuth: restituisce una sessione mock senza fare chiamate di rete.
 * In produzione: usa useSession() di NextAuth normalmente.
 */
import { useEffect, useState } from 'react'

type DevSessionUser = {
  id: string
  name: string
  email: string
  role: string
  image: null
}

type DevSessionData = {
  user: DevSessionUser
  expires: string
}

type DevSessionState = {
  data: DevSessionData | null
  status: 'authenticated' | 'unauthenticated' | 'loading'
  update: () => Promise<null>
}

const DEV_USER: DevSessionUser = {
  id: 'dev-corrado',
  name: 'Corrado',
  email: 'corrado@aerojet.app',
  role: 'BROKER',
  image: null,
}

const DEV_SESSION: DevSessionState = {
  data: { user: DEV_USER, expires: '2099-01-01' },
  status: 'authenticated',
  update: async () => null,
}

const EMPTY_SESSION: DevSessionState = {
  data: null,
  status: 'unauthenticated',
  update: async () => null,
}

// Use dev mode when: localhost + no real OAuth configured
function isDevMode() {
  if (typeof window === 'undefined') return false
  return (
    window.location.hostname === 'localhost' ||
    process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true'
  )
}

export function useSession() {
  const [session, setSession] = useState<DevSessionState>(DEV_SESSION)

  useEffect(() => {
    if (isDevMode()) {
      setSession(DEV_SESSION)
      return
    }
    // Production: fetch real session
    import('next-auth/react').then(({ useSession: useNextAuthSession }) => {
      // Can't call hook dynamically, so just fetch the session endpoint
      fetch('/api/auth/session')
        .then(r => r.json())
        .then(data => {
          if (data?.user) {
            setSession({ data, status: 'authenticated', update: async () => null })
          } else {
            setSession(EMPTY_SESSION)
          }
        })
        .catch(() => setSession(EMPTY_SESSION))
    })
  }, [])

  return session
}

export async function signOut(options?: { callbackUrl?: string }) {
  if (isDevMode()) {
    window.location.href = options?.callbackUrl || '/'
    return
  }
  const { signOut: nextSignOut } = await import('next-auth/react')
  return nextSignOut(options)
}
