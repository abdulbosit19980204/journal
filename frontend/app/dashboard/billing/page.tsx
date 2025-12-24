"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function SubscriptionHistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<any[]>([])
    const [subscription, setSubscription] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, subRes] = await Promise.all([
                    api.get("/billing/history/"),
                    api.get("/billing/my-subscription/").catch(() => ({ data: null }))
                ])
                setHistory(historyRes.data)
                setSubscription(subRes.data)
            } catch (err: any) {
                if (err.response?.status === 401) router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [router])

    const actionColors: Record<string, { bg: string; text: string; icon: string }> = {
        SUBSCRIBED: { bg: '#d1fae5', text: '#065f46', icon: '✓' },
        RENEWED: { bg: '#dbeafe', text: '#1e40af', icon: '🔄' },
        UPGRADED: { bg: '#fef3c7', text: '#92400e', icon: '⬆️' },
        DOWNGRADED: { bg: '#fee2e2', text: '#991b1b', icon: '⬇️' },
        CANCELLED: { bg: '#f3f4f6', text: '#374151', icon: '✗' },
        EXPIRED: { bg: '#f3f4f6', text: '#6b7280', icon: '⏰' },
    }

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
                <div className="container">
                    <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Dashboard</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        Subscription History
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* History List */}
                    <div>
                        <div className="card">
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>Activity History</h2>
                            </div>

                            {history.length > 0 ? (
                                <div>
                                    {history.map((item, i) => (
                                        <div key={item.id} style={{
                                            padding: '1.25rem 1.5rem',
                                            borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none',
                                            display: 'flex',
                                            gap: '1rem',
                                            alignItems: 'start'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: actionColors[item.action]?.bg || '#f3f4f6',
                                                color: actionColors[item.action]?.text || '#374151',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                flexShrink: 0
                                            }}>
                                                {actionColors[item.action]?.icon || '•'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                                                    <div>
                                                        <span style={{
                                                            padding: '0.15rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            background: actionColors[item.action]?.bg || '#f3f4f6',
                                                            color: actionColors[item.action]?.text || '#374151',
                                                            marginRight: '0.5rem'
                                                        }}>
                                                            {item.action}
                                                        </span>
                                                        <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{item.plan_name}</span>
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#1e3a5f' }}>
                                                        ${parseFloat(item.amount_paid).toFixed(2)}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{item.notes}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                    <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>No History Yet</h3>
                                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Subscribe to a plan to see your history</p>
                                    <Link href="/pricing" className="btn btn-primary">View Plans</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Current Subscription */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Current Plan</h3>
                            {subscription && subscription.plan_name ? (
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem' }}>
                                        {subscription.plan_name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                        Active until {new Date(subscription.end_date).toLocaleDateString()}
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        background: subscription.is_active ? '#d1fae5' : '#fee2e2',
                                        color: subscription.is_active ? '#065f46' : '#991b1b',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}>
                                        {subscription.is_active ? '✓ Active' : '✗ Inactive'}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                                    <p style={{ marginBottom: '1rem' }}>No active subscription</p>
                                    <Link href="/pricing" className="btn btn-primary" style={{ width: '100%' }}>
                                        Subscribe Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Quick Links</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <Link href="/pricing" style={{ color: '#1e3a5f', fontSize: '0.875rem', fontWeight: 500 }}>
                                    → Change Plan
                                </Link>
                                <Link href="/dashboard" style={{ color: '#1e3a5f', fontSize: '0.875rem', fontWeight: 500 }}>
                                    → Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
