"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function DashboardPage() {
    const { t, tStatus } = useI18n()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.get("/auth/me/"), api.get("/submissions/")])
            .then(([userRes, subRes]) => {
                setUser(userRes.data)
                setSubmissions(subRes.data)
            })
            .catch(() => router.push("/auth/login"))
            .finally(() => setLoading(false))
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.push("/auth/login")
    }

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    const statusColors: Record<string, { bg: string; text: string }> = {
        DRAFT: { bg: '#f3f4f6', text: '#374151' },
        SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
        UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
        ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
        REJECTED: { bg: '#fee2e2', text: '#991b1b' },
        PUBLISHED: { bg: '#fef3c7', text: '#92400e' },
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif" }}>
                            {t('dashboard.welcome')}, {user?.first_name || user?.username}!
                        </h1>
                        <p style={{ color: '#6b7280' }}>{t('dashboard.title')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link href="/dashboard/author/submit" className="btn btn-primary">+ {t('dashboard.new_submission')}</Link>
                        <button onClick={handleLogout} style={{
                            padding: '0.75rem 1.25rem',
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}>{t('nav.logout')}</button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { label: t('dashboard.total_submissions'), value: submissions.length, color: '#1e3a5f' },
                        { label: t('dashboard.pending'), value: submissions.filter(s => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status)).length, color: '#6366f1' },
                        { label: t('dashboard.accepted'), value: submissions.filter(s => s.status === 'ACCEPTED').length, color: '#059669' },
                        { label: t('dashboard.published'), value: submissions.filter(s => s.status === 'PUBLISHED').length, color: '#d97706' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { icon: '📄', title: t('dashboard.submit_new'), desc: t('home.upload_manuscript'), href: '/dashboard/author/submit', color: '#1e3a5f' },
                        { icon: '📚', title: t('dashboard.view_journals'), desc: t('home.explore_publications'), href: '/journals', color: '#c9a227' },
                        { icon: '💎', title: t('dashboard.billing'), desc: t('pricing.subscribe'), href: '/pricing', color: '#059669' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="card" style={{ padding: '1.5rem', display: 'block', textDecoration: 'none' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                background: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                                marginBottom: '1rem'
                            }}>{item.icon}</div>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.25rem' }}>{item.title}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Submissions Table */}
                <div className="card">
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', fontFamily: "'Playfair Display', serif" }}>{t('dashboard.my_submissions')}</h2>
                    </div>
                    {submissions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('submissions.title')}</th>
                                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('dashboard.date')}</th>
                                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('submissions.status')}</th>
                                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{sub.title}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('submissions.journal')} #{sub.journal}</div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                                {new Date(sub.submitted_at || sub.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: statusColors[sub.status]?.bg || '#f3f4f6',
                                                    color: statusColors[sub.status]?.text || '#374151'
                                                }}>
                                                    {tStatus(sub.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <Link href={`/dashboard/submissions/${sub.id}`} style={{ color: '#1e3a5f', fontWeight: 500, fontSize: '0.875rem' }}>
                                                    {t('dashboard.view_details')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{t('dashboard.no_submissions')}</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{t('dashboard.start_submission')}</p>
                            <Link href="/dashboard/author/submit" className="btn btn-primary">{t('dashboard.submit_new')}</Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
