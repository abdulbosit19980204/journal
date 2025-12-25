"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authorized, setAuthorized] = useState(false)
    const { t } = useI18n()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem("accessToken")
        if (!token) {
            router.push(`/auth/login?next=${encodeURIComponent(pathname)}`)
        } else {
            setAuthorized(true)
        }
    }, [pathname, router])

    if (!authorized) {
        return null // or a loading spinner
    }

    const menuItems = [
        { href: "/dashboard", label: t("nav.dashboard"), icon: "📊" },
        { href: "/dashboard/author/submit", label: t("submissions.submit_new"), icon: "✍️" },
        { href: "/dashboard/billing", label: t("nav.billing"), icon: "💳" },
        { href: "/dashboard/profile", label: t("nav.profile"), icon: "👤" },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
            {/* Sidebar (Desktop) */}
            <aside style={{
                width: '260px',
                background: 'white',
                borderRight: '1px solid #e5e5e5',
                padding: '2rem 1rem',
                display: 'none', // Hidden on mobile by default, handled by media query usually but here usage of inline styles
            }} className="desktop-sidebar">
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                color: pathname === item.href ? '#1e3a5f' : '#4b5563',
                                background: pathname === item.href ? '#f0f9ff' : 'transparent',
                                fontWeight: pathname === item.href ? 600 : 500,
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sidebar Toggle (Floating) */}
            <div className="mobile-only" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}>
                {/* We can implement a proper mobile menu here or relying on the main Navigation component */}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowX: 'hidden' }}>
                {children}
            </div>

            <style jsx global>{`
                @media (min-width: 768px) {
                    .desktop-sidebar { display: block !important; }
                    .mobile-only { display: none !important; }
                }
            `}</style>
        </div>
    )
}
