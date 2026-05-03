// Server component — reads GOOGLE_CLIENT_ID at build/request time and passes
// a plain boolean to the client component. This prevents the Google button
// from rendering when OAuth is not configured.
import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Accedi',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID
  return <LoginForm googleEnabled={googleEnabled} />
}
