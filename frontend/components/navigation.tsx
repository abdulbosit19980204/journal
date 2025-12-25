"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useI18n, LanguageSelector } from "@/lib/i18n"

export default function Navigation() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, locale } = useI18n()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'))
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : 'white',
      boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '0.5rem 0',
        fontSize: '0.875rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ opacity: 0.9 }}>Scientific Publishing Platform for Central Asia</span>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ borderBottom: '1px solid #e5e5e5', position: 'relative' }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.25rem'
            }}>
              AJ
            </div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1e3a5f',
                fontFamily: "'Playfair Display', serif"
              }}>
                Central Asian Journal
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '-2px' }} className="hidden-mobile">
                Excellence in Research
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {[
              { href: "/", label: t("nav.home") },
              { href: "/journals", label: t("nav.journals") },
              { href: "/articles", label: t("nav.articles") },
              { href: "/pricing", label: t("nav.pricing") },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: pathname === item.href ? '#1e3a5f' : '#4a4a4a',
                  borderBottom: pathname === item.href ? '2px solid #c9a227' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isLoggedIn ? (
              <>
                <Link href="/admin" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a' }}>
                  {t("nav.admin")}
                </Link>
                <Link href="/dashboard" className="btn btn-primary">{t("nav.dashboard")}</Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a' }}>
                  {t("nav.login")}
                </Link>
                <Link href="/auth/register" className="btn btn-primary">
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#1e3a5f'
            }}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            borderBottom: '1px solid #e5e5e5',
            padding: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 49
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { href: "/", label: t("nav.home") },
                { href: "/journals", label: t("nav.journals") },
                { href: "/articles", label: t("nav.articles") },
                { href: "/pricing", label: t("nav.pricing") },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: pathname === item.href ? '#1e3a5f' : '#4a4a4a',
                    padding: '0.5rem 0'
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5' }} />
              {isLoggedIn ? (
                <>
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: '#4a4a4a' }}>
                    {t("nav.admin")}
                  </Link>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>{t("nav.dashboard")}</Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: '#4a4a4a' }}>
                    {t("nav.login")}
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .hidden-mobile { display: none; }
        }
      `}</style>
    </header>
  )
}
