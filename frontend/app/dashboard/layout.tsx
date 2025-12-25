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
            {/* Sidebar Removed as per user request for cleaner UI */}

            {/* Mobile Sidebar Toggle (Floating) - Also removed as we rely on Top Nav */}

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
