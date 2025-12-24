"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, subRes, journalRes, planRes] = await Promise.all([
                    api.get("/auth/me/"),
                    api.get("/submissions/"),
                    api.get("/journals/"),
                    api.get("/plans/")
                ])

                setUser(userRes.data)

                // Check if user is staff
                if (!userRes.data.is_staff) {
                    router.push("/dashboard")
                    return
                }

                const submissions = subRes.data
                setRecentSubmissions(submissions.slice(0, 10))

                setStats({
                    totalSubmissions: submissions.length,
                    pendingReview: submissions.filter((s: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status)).length,
                    accepted: submissions.filter((s: any) => s.status === 'ACCEPTED').length,
                    published: submissions.filter((s: any) => s.status === 'PUBLISHED').length,
                    rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
                    totalJournals: journalRes.data.length,
                    totalPlans: planRes.data.length
                })
            } catch (err: any) {
                if (err.response?.status === 401) router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [router])

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    const statusColors: Record<string, { bg: string; text: string }> = {
        SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
        UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
        ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
        REJECTED: { bg: '#fee2e2', text: '#991b1b' },
        PUBLISHED: { bg: '#fef3c7', text: '#92400e' },
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            {/* Header */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                color: 'white',
                padding: '2rem 0'
            }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                Admin Dashboard
                            </h1>
                            <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>Manage journals, submissions, and users</p>
                        </div>
                        <a
                            href="http://localhost:8000/admin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Django Admin →
                        </a>
                    </div>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Submissions', value: stats?.totalSubmissions || 0, color: '#1e3a5f', icon: '📄' },
                        { label: 'Pending Review', value: stats?.pendingReview || 0, color: '#6366f1', icon: '⏳' },
                        { label: 'Accepted', value: stats?.accepted || 0, color: '#059669', icon: '✓' },
                        { label: 'Published', value: stats?.published || 0, color: '#d97706', icon: '📚' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.5 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { title: 'Manage Journals', desc: 'Add, edit journals', href: '/admin/journals', icon: '📚', color: '#1e3a5f' },
                        { title: 'Review Submissions', desc: 'Accept or reject', href: '/dashboard/editor', icon: '📝', color: '#6366f1' },
                        { title: 'Manage Plans', desc: 'Subscription plans', href: '/admin/plans', icon: '💎', color: '#059669' },
                        { title: 'Manage Users', desc: 'User accounts', href: '/admin/users', icon: '👥', color: '#dc2626' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="card" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Recent Submissions */}
                    <div className="card">
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>Recent Submissions</h2>
                            <Link href="/dashboard/editor" style={{ color: '#1e3a5f', fontSize: '0.875rem', fontWeight: 500 }}>View All →</Link>
                        </div>
                        {recentSubmissions.length > 0 ? (
                            <div>
                                {recentSubmissions.map((sub) => (
                                    <div key={sub.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '0.25rem' }}>{sub.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                {sub.author_name || `Author #${sub.author}`} • {new Date(sub.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: statusColors[sub.status]?.bg || '#f3f4f6',
                                            color: statusColors[sub.status]?.text || '#374151'
                                        }}>
                                            {sub.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No submissions yet</div>
                        )}
                    </div>

                    {/* System Info */}
                    <div>
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>System Overview</h3>
                            <dl style={{ fontSize: '0.875rem' }}>
                                {[
                                    { label: 'Active Journals', value: stats?.totalJournals || 0 },
                                    { label: 'Subscription Plans', value: stats?.totalPlans || 0 },
                                    { label: 'Rejected', value: stats?.rejected || 0 },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <dt style={{ color: '#6b7280' }}>{d.label}</dt>
                                        <dd style={{ fontWeight: 500 }}>{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', background: '#1e3a5f', color: 'white' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Quick Links</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                                    → Django Admin
                                </a>
                                <a href="http://localhost:8000/api/docs/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                                    → API Documentation
                                </a>
                                <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                                    → User Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
