"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function Navigation() {
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsLoggedIn(!!localStorage.getItem('accessToken'))

            const handleScroll = () => {
                setScrolled(window.scrollY > 20)
            }
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/journals", label: "Journals" },
        { href: "/pricing", label: "Pricing" },
    ]

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'}`}>
            {/* Top bar */}
            <div className="gradient-primary text-white py-2">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
                    <span className="opacity-90">Scientific Publishing Platform for Central Asia</span>
                    <div className="flex gap-4">
                        <span>🌐 EN | UZ | RU</span>
                    </div>
                </div>
            </div>

            {/* Main navigation */}
            <nav className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl font-bold font-serif">AJ</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[var(--primary)] font-serif">American Journal</h1>
                                <p className="text-xs text-[var(--text-muted)] -mt-1">Excellence in Research</p>
                            </div>
                        </Link>

                        {/* Nav links */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative py-2 text-sm font-medium transition-colors ${pathname === item.href
                                            ? "text-[var(--primary)]"
                                            : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
                                        }`}
                                >
                                    {item.label}
                                    {pathname === item.href && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--secondary)]" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Auth buttons */}
                        <div className="flex items-center gap-4">
                            {isLoggedIn ? (
                                <Link href="/dashboard" className="btn-primary text-sm">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)]">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/register" className="btn-primary text-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
