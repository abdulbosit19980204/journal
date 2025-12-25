"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useI18n, LanguageSelector } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { resolveMediaUrl } from "@/lib/utils"

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { t, locale } = useI18n()

  useEffect(() => {
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
              CAJ
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
            {user ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {user.is_staff && (
                  <Link href="/admin" style={{ fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a' }}>
                    {t("nav.admin")}
                  </Link>
                )}
                
                {/* User Dropdown Toggle */}
                <div 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                    background: isProfileOpen ? '#f3f4f6' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => !isProfileOpen && (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f' }}>{user.first_name || user.username}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{user.is_staff ? 'Editor' : 'Author'}</div>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    overflow: 'hidden',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {user.profile_picture ? (
                      <img src={resolveMediaUrl(user.profile_picture)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#9ca3af' }}>👤</div>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '220px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    border: '1px solid #f3f4f6',
                    padding: '0.5rem',
                    zIndex: 100
                  }}>
                    <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#4b5563', borderRadius: '6px', textDecoration: 'none' }} className="hover-gray">
                      🏠 {t("nav.dashboard")}
                    </Link>
                    <Link href="/profile/settings" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#4b5563', borderRadius: '6px', textDecoration: 'none' }} className="hover-gray">
                      ⚙️ {t("dashboard.my_profile")}
                    </Link>
                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #f3f4f6' }} />
                    <button 
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                      className="hover-red"
                    >
                      🚪 {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
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
              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', marginBottom: '0.5rem' }}>
                   <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    overflow: 'hidden'
                  }}>
                    {user.profile_picture ? (
                      <img src={resolveMediaUrl(user.profile_picture)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>👤</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e3a5f' }}>{user.first_name} {user.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>@{user.username}</div>
                  </div>
                </div>
              )}
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
              {user ? (
                <>
                  {user.is_staff && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: '#4a4a4a' }}>
                      {t("nav.admin")}
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: '#4a4a4a' }}>
                    {t("nav.dashboard")}
                  </Link>
                  <Link href="/profile/settings" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: '#4a4a4a' }}>
                    {t("dashboard.my_profile")}
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '1rem', fontWeight: 500, color: '#dc2626', background: 'none', border: 'none' }}
                  >
                    {t("nav.logout")}
                  </button>
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
        .hover-gray:hover { background-color: #f9fafb !important; }
        .hover-red:hover { background-color: #fef2f2 !important; }
      `}</style>
    </header>
  )
}
