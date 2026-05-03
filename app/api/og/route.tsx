import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'AeroJet Private'
  const subtitle = searchParams.get('subtitle') || 'Voli Privati di Lusso'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #060810 0%, #0D1526 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Corner marks */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 30, height: 30, borderTop: '1.5px solid #C9A84C', borderLeft: '1.5px solid #C9A84C', opacity: 0.4, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 40, right: 40, width: 30, height: 30, borderTop: '1.5px solid #C9A84C', borderRight: '1.5px solid #C9A84C', opacity: 0.4, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 40, width: 30, height: 30, borderBottom: '1.5px solid #C9A84C', borderLeft: '1.5px solid #C9A84C', opacity: 0.4, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 30, height: 30, borderBottom: '1.5px solid #C9A84C', borderRight: '1.5px solid #C9A84C', opacity: 0.4, display: 'flex' }} />

        {/* Gold dot top */}
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', marginBottom: 48, opacity: 0.8, display: 'flex' }} />

        {/* Title */}
        <div style={{ fontSize: 62, color: 'white', fontWeight: 300, letterSpacing: 10, marginBottom: 16, display: 'flex' }}>
          {title.toUpperCase()}
        </div>

        {/* Gold line */}
        <div style={{ width: 120, height: 1, background: '#C9A84C', opacity: 0.6, marginBottom: 20, display: 'flex' }} />

        {/* Subtitle */}
        <div style={{ fontSize: 18, color: '#C9A84C', letterSpacing: 6, opacity: 0.85, display: 'flex' }}>
          {subtitle.toUpperCase()}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 4, marginTop: 48, display: 'flex' }}>
          AEROJET.APP
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
