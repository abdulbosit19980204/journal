"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"

export default function JournalsPage() {
    const [journals, setJournals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/journals/").then(res => setJournals(res.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const colors = ['#dc2626', '#2563eb', '#059669', '#7c3aed', '#ea580c', '#0891b2']

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <main>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                color: 'white',
                padding: '4rem 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
                        <span style={{ color: '#c9a227' }}>◆</span>
                        <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                        Our Journals
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        Explore our collection of peer-reviewed academic journals
                    </p>
                </div>
            </section>

            {/* Journals Grid */}
            <section style={{ padding: '4rem 0', background: '#faf9f6' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {journals.map((journal, i) => (
                            <div key={journal.id} className="card">
                                <div style={{ height: '4px', background: colors[i % colors.length] }} />
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '10px',
                                            background: colors[i % colors.length],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 700
                                        }}>
                                            {journal.name_en?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`badge ${journal.is_paid ? 'badge-paid' : 'badge-open'}`}>
                                            {journal.is_paid ? 'Subscription' : 'Open Access'}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                                        {journal.name_en}
                                    </h3>

                                    <p style={{ color: '#4a4a4a', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                                        {journal.description_en || 'Peer-reviewed journal focusing on cutting-edge research.'}
                                    </p>

                                    {journal.is_paid && (
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                            <strong style={{ color: '#1e3a5f' }}>${journal.price_per_page}</strong> per page
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5' }}>
                                        <Link
                                            href={`/journals/${journal.slug}`}
                                            style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                padding: '0.625rem',
                                                border: '1px solid #1e3a5f',
                                                color: '#1e3a5f',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href="/dashboard/author/submit"
                                            className="btn btn-primary"
                                            style={{ flex: 1, textAlign: 'center', padding: '0.625rem', fontSize: '0.875rem' }}
                                        >
                                            Submit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {journals.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No journals found. Check back later.</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
