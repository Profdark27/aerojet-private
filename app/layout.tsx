import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: { default: 'Aerojet Private — Voli Privati di Lusso', template: '%s | Aerojet Private' },
  description: 'Prenota voli privati con i migliori operatori mondiali. Decollo entro 4 ore. 8,000+ aeromobili certificati.',
  keywords: 'voli privati, jet privato, charter aereo, luxury travel, VistaJet, NetJets',
  authors: [{ name: 'Aerojet Private' }],
  creator: 'Aerojet Private',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Aerojet Private',
    title: 'Aerojet Private — Il Cielo è il Limite',
    description: 'Prenota voli privati con i migliori operatori mondiali. Decollo entro 4 ore.',
  },
  twitter: { card: 'summary_large_image', title: 'Aerojet Private', description: 'Voli privati di lusso.' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0C14" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
