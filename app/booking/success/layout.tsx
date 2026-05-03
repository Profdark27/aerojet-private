import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prenotazione Confermata',
  openGraph: {
    title: 'Prenotazione Confermata | AeroJet Private',
    images: [{ url: '/api/og?title=Prenotazione+Confermata', width: 1200, height: 630 }],
  },
  robots: { index: false, follow: false },
}

export default function BookingSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
