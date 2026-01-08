"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function FinanceDashboardPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState<any>(null)
    const [revenueTrend, setRevenueTrend] = useState<any[]>([])
    const [topUsers, setTopUsers] = useState<any[]>([])
    const [breakdown, setBreakdown] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        range: 'all', // 'month', 'year', 'all', 'custom'
        start_date: '',
        end_date: ''
    })

    useEffect(() => {
        if (!user?.is_finance_admin && !user?.is_superuser) {
            router.push('/admin')
            return
        }

        const fetchData = async () => {
            setLoading(true)
            try {
                const params: any = {}

                if (filters.range === 'month') {
                    const start = new Date()
                    start.setDate(1)
                    params.start_date = start.toISOString().split('T')[0]
                } else if (filters.range === 'year') {
                    const start = new Date()
                    start.setMonth(0, 1)
                    params.start_date = start.toISOString().split('T')[0]
                } else if (filters.range === 'custom') {
                    if (filters.start_date) params.start_date = filters.start_date
                    if (filters.end_date) params.end_date = filters.end_date
                }

                const [dashRes, trendRes, usersRes, breakdownRes] = await Promise.all([
                    api.get('/finance/dashboard/', { params }),
                    api.get('/finance/revenue-trend/', { params }),
                    api.get('/finance/top-users/', { params }),
                    api.get('/finance/transaction-breakdown/', { params })
                ])
                setDashboard(dashRes.data)
                setRevenueTrend(trendRes.data)
                setTopUsers(usersRes.data)
                setBreakdown(breakdownRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user, router, filters])

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" /></div>
    if (!user?.is_finance_admin && !user?.is_superuser) return null

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>
                        💰 Finance Dashboard
                    </h1>
                    <p style={{ color: '#6b7280' }}>Platform financial overview and statistics</p>
                </div>

                {/* Filter Bar */}
                <div className="card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'white' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: 'month', label: 'This Month' },
                            { id: 'year', label: 'This Year' },
                            { id: 'custom', label: 'Custom' }
                        ].map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setFilters({ ...filters, range: r.id })}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    background: filters.range === r.id ? '#1e3a5f' : 'white',
                                    color: filters.range === r.id ? 'white' : '#4b5563',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {filters.range === 'custom' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                className="input"
                                style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                            />
                            <span style={{ color: '#6b7280' }}>to</span>
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                className="input"
                                style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                            />
                        </div>
                    )}

                    {loading && <div className="spinner" style={{ width: '20px', height: '20px', marginLeft: 'auto' }} />}
                </div>

                {/* Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Revenue', value: `$${dashboard?.total_revenue || '0'}`, color: '#059669', icon: '💵' },
                        { label: 'Monthly Revenue', value: `$${dashboard?.monthly_revenue || '0'}`, color: '#c9a227', icon: '📊' },
                        { label: 'Yearly Revenue', value: `$${dashboard?.yearly_revenue || '0'}`, color: '#6366f1', icon: '📈' },
                        { label: 'Pending Approvals', value: dashboard?.pending_topups_count || '0', color: '#dc2626', icon: '⏳' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem', background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`, border: `1px solid ${stat.color}30` }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Revenue Trend */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>Revenue Trend (Last 12 Months)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {revenueTrend.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', minWidth: '70px' }}>{item.month}</div>
                                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '4px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min((parseFloat(item.revenue) / 10000) * 100, 100)}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #059669, #10b981)',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669', minWidth: '80px', textAlign: 'right' }}>${item.revenue}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transaction Breakdown */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>Transaction Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {breakdown.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a5f' }}>{item.type.replace('_', ' ')}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.count} txns</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: parseFloat(item.total) >= 0 ? '#059669' : '#dc2626' }}>
                                        ${item.total}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Users */}
                <div className="card">
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f' }}>Top Users by Balance</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#6b7280' }}>
                                    <th style={{ padding: '1rem 1.5rem' }}>Username</th>
                                    <th style={{ padding: '1rem 1.5rem' }}>Email</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Balance</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topUsers.map((user) => (
                                    <tr key={user.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{user.username}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>{user.email}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>${user.balance}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#6b7280' }}>${user.total_spent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
