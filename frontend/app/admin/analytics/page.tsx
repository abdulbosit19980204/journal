"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AnalyticsDashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [articles, setArticles] = useState<any[]>([])
    const [journals, setJournals] = useState<any[]>([])
    const [period, setPeriod] = useState('month')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [articlesRes, journalsRes] = await Promise.all([
                api.get("/submissions/"),
                api.get("/journals/")
            ])

            setArticles(articlesRes.data)
            setJournals(journalsRes.data)

            // Calculate stats
            const submissions = articlesRes.data
            const now = new Date()
            const thisMonth = submissions.filter((s: any) => {
                const d = new Date(s.created_at)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })

            setStats({
                totalSubmissions: submissions.length,
                thisMonth: thisMonth.length,
                published: submissions.filter((s: any) => s.status === 'PUBLISHED').length,
                accepted: submissions.filter((s: any) => s.status === 'ACCEPTED').length,
                rejected: submissions.filter((s: any) => s.status === 'REJECTED').length,
                pending: submissions.filter((s: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status)).length,
                avgReviewTime: '3.2 days', // Mock
                acceptRate: submissions.length > 0
                    ? Math.round((submissions.filter((s: any) => s.status === 'ACCEPTED' || s.status === 'PUBLISHED').length / submissions.length) * 100)
                    : 0,
            })
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/auth/login")
        } finally {
            setLoading(false)
        }
    }

    // Group submissions by status for chart
    const statusData = [
        { label: 'Published', value: stats?.published || 0, color: '#d97706' },
        { label: 'Accepted', value: stats?.accepted || 0, color: '#059669' },
        { label: 'Pending', value: stats?.pending || 0, color: '#6366f1' },
        { label: 'Rejected', value: stats?.rejected || 0, color: '#dc2626' },
    ]

    // Group by journal
    const journalStats = journals.map(j => ({
        name: j.name_en,
        count: articles.filter(a => a.journal === j.id).length
    })).sort((a, b) => b.count - a.count).slice(0, 5)

    // Monthly trend (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        const count = articles.filter(a => {
            const ad = new Date(a.created_at)
            return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
        }).length
        return {
            month: d.toLocaleString('default', { month: 'short' }),
            count
        }
    })

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
                <div className="container">
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Admin</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>Platform performance overview</p>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Submissions', value: stats?.totalSubmissions || 0, icon: '📄', color: '#1e3a5f' },
                        { label: 'This Month', value: stats?.thisMonth || 0, icon: '📅', color: '#6366f1', suffix: ' new' },
                        { label: 'Acceptance Rate', value: stats?.acceptRate || 0, icon: '✓', color: '#059669', suffix: '%' },
                        { label: 'Avg Review Time', value: stats?.avgReviewTime || 'N/A', icon: '⏱️', color: '#d97706' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                                        {stat.value}{stat.suffix || ''}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Status Distribution Chart */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>Submission Status</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            {/* Simple Donut Chart */}
                            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    {(() => {
                                        const total = statusData.reduce((sum, d) => sum + d.value, 0) || 1
                                        let offset = 0
                                        return statusData.map((d, i) => {
                                            const pct = (d.value / total) * 100
                                            const el = (
                                                <circle
                                                    key={i}
                                                    cx="18" cy="18" r="15.91549430918954"
                                                    fill="transparent"
                                                    stroke={d.color}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${pct} ${100 - pct}`}
                                                    strokeDashoffset={-offset}
                                                />
                                            )
                                            offset += pct
                                            return el
                                        })
                                    })()}
                                </svg>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#1e3a5f'
                                }}>
                                    {stats?.totalSubmissions || 0}
                                </div>
                            </div>
                            {/* Legend */}
                            <div>
                                {statusData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: d.color }} />
                                        <span style={{ fontSize: '0.875rem', color: '#4a4a4a' }}>{d.label}: {d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Journals */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>Top Journals</h3>
                        {journalStats.length > 0 ? (
                            <div>
                                {journalStats.map((j, i) => (
                                    <div key={i} style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.875rem' }}>{j.name}</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{j.count}</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(j.count / (journalStats[0]?.count || 1)) * 100}%`,
                                                background: 'linear-gradient(90deg, #1e3a5f, #2d5a8c)',
                                                borderRadius: '4px'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#6b7280' }}>No data available</p>
                        )}
                    </div>
                </div>

                {/* Monthly Trend */}
                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>Submission Trend (Last 6 Months)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px' }}>
                        {monthlyData.map((m, i) => {
                            const maxCount = Math.max(...monthlyData.map(d => d.count), 1)
                            const height = (m.count / maxCount) * 160
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e3a5f' }}>{m.count}</div>
                                    <div style={{
                                        width: '100%',
                                        height: `${height}px`,
                                        background: 'linear-gradient(180deg, #1e3a5f, #2d5a8c)',
                                        borderRadius: '4px 4px 0 0',
                                        minHeight: '4px'
                                    }} />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>{m.month}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#059669' }}>{stats?.published || 0}</div>
                        <div style={{ color: '#6b7280' }}>Published Articles</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e3a5f' }}>{journals.length}</div>
                        <div style={{ color: '#6b7280' }}>Active Journals</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#6366f1' }}>{stats?.pending || 0}</div>
                        <div style={{ color: '#6b7280' }}>Pending Review</div>
                    </div>
                </div>
            </div>
        </main>
    )
}
