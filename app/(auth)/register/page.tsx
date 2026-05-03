// Server component — reads GOOGLE_CLIENT_ID at build/request time and passes
// a plain boolean to the client component. This prevents the Google button
// from rendering when OAuth is not configured.
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID
  return <RegisterForm googleEnabled={googleEnabled} />
}
