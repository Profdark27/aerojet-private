'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '14px 48px' : '22px 48px',
        background: scrolled ? 'rgba(10,12,20,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        transition: 'all 0.4s ease',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ color: '#C9A84C', fontSize: 18 }}>✦</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', alignSelf: 'flex-end', marginBottom: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>PRIVATE</span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-only" style={{ display: 'flex', gap: 32 }}>
          {[['Charter', '/search'], ['Flotta', '/#fleet'], ['Operatori', '/#operators'], ['Empty Legs', '/#emptylegs'], ['Membership', '/#membership']].map(([label, href]) => (
            <Link key={label} href={href} style={{ color: 'rgba(240,237,230,0.7)', fontSize: 13, letterSpacing: 2, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.7)')}>
              {label}
            </Link>
          ))}
        </div>

        {/* CTA + Dashboard */}
        <div className="desktop-only" style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard" style={{ color: 'rgba(240,237,230,0.6)', fontSize: 12, letterSpacing: 2, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', padding: '10px 16px', border: '1px solid rgba(201,168,76,0.2)' }}>
            Dashboard
          </Link>
          <Link href="/search" style={{ background: '#C9A84C', color: '#0A0C14', padding: '10px 24px', fontSize: 12, letterSpacing: 2, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 500 }}>
            Prenota Ora
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button className="mobile-only" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: 8 }}>
          <div style={{ width: 22, height: 2, background: '#C9A84C', marginBottom: 5, transition: 'all 0.3s' }} />
          <div style={{ width: 22, height: 2, background: '#C9A84C', marginBottom: 5 }} />
          <div style={{ width: 22, height: 2, background: '#C9A84C' }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-only" style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,20,0.98)', zIndex: 99, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          {[['Charter', '/search'], ['Flotta', '/#fleet'], ['Operatori', '/#operators'], ['Empty Legs', '/#emptylegs'], ['Membership', '/#membership'], ['Dashboard', '/dashboard']].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              style={{ color: '#F0EDE6', fontSize: 28, letterSpacing: 4, textDecoration: 'none', fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>
              {label}
            </Link>
          ))}
          <Link href="/search" onClick={() => setMenuOpen(false)}
            style={{ background: '#C9A84C', color: '#0A0C14', padding: '16px 48px', fontSize: 13, letterSpacing: 3, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 500, marginTop: 16 }}>
            PRENOTA ORA
          </Link>
        </div>
      )}
    </>
  )
}
