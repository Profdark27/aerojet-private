import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import { ToastProvider } from '@/components/Toast'
import JsonLd from '@/components/luxury/JsonLd'
import LinkedInInsight from '@/components/marketing/LinkedInInsight'

export const metadata: Metadata = {
  title: {
    default: 'AeroJet Private | Voli Privati di Lusso',
    template: '%s | AeroJet Private'
  },
  description: 'Prenotate il vostro volo privato con AeroJet. Flotta esclusiva, servizio concierge 24/7, rotte europee e intercontinentali. Milano, Roma, Londra, Parigi.',
  keywords: 'voli privati, jet privato, charter aereo, Milano, Roma, luxury aviation',
  authors: [{ name: 'AeroJet Private' }],
  creator: 'AeroJet Private',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aerojet.app'),
  openGraph: {
    title: 'AeroJet Private | Voli Privati di Lusso',
    description: 'Prenotate il vostro volo privato con AeroJet. Flotta esclusiva, servizio concierge 24/7.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://aerojet.app',
    siteName: 'AeroJet Private',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AeroJet Private — Voli Privati di Lusso',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AeroJet Private | Voli Privati di Lusso',
    description: 'Prenotate il vostro volo privato con AeroJet.',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: '/favicon.ico' },
}

import SmoothScroll from '@/components/luxury/SmoothScroll'
import CustomCursor from '@/components/luxury/CustomCursor'
import PageTransition from '@/components/luxury/PageTransition'
import ScrollProgress from '@/components/luxury/ScrollProgress'
import Preloader from '@/components/luxury/Preloader'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500&family=Outfit:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0C14" />
        <JsonLd />
      </head>
      <body>
        <Preloader />
        <div className="bg-noise" />
        <ScrollProgress />
        <CustomCursor />
        <AuthProvider>
          <ToastProvider>
            <SmoothScroll>
              <PageTransition>
                {children}
              </PageTransition>
            </SmoothScroll>
            <LinkedInInsight />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
