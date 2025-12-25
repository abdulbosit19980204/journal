"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function JournalsPage() {
    const { t, locale } = useI18n()
    const [journals, setJournals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        api.get("/journals/").then(res => setJournals(res.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const colors = ['#dc2626', '#2563eb', '#059669', '#7c3aed', '#ea580c', '#0891b2']

    // Get localized name/description based on current locale
    const getLocalizedField = (journal: any, field: string) => {
        const localizedKey = `${field}_${locale}`
        return journal[localizedKey] || journal[`${field}_en`] || ''
    }

    // Filter journals by search query
    const filteredJournals = journals.filter(j =>
        getLocalizedField(j, 'name').toLowerCase().includes(searchQuery.toLowerCase()) ||
        getLocalizedField(j, 'description').toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                        {t('journals.title')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        {t('journals.subtitle')}
                    </p>
                </div>
            </section>

            {/* Search Bar */}
            <section style={{ padding: '2rem 0', background: 'white', borderBottom: '1px solid #e5e5e5' }}>
                <div className="container">
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder={t('journals.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1.25rem',
                                border: '1px solid #e5e5e5',
                                borderRadius: '9999px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Journals Grid */}
            <section style={{ padding: '4rem 0', background: '#faf9f6' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {filteredJournals.map((journal, i) => (
                            <div key={journal.id} className="card" style={{ overflow: 'hidden' }}>
                                {/* Cover Image */}
                                {journal.cover_image ? (
                                    <div style={{ height: '160px', overflow: 'hidden' }}>
                                        <img
                                            src={`http://localhost:8000${journal.cover_image}`}
                                            alt={getLocalizedField(journal, 'name')}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: '160px',
                                        background: `linear-gradient(135deg, ${colors[i % colors.length]}CC, ${colors[(i + 1) % colors.length]}CC)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '3rem',
                                        fontWeight: 700,
                                        fontFamily: "'Playfair Display', serif"
                                    }}>
                                        {getLocalizedField(journal, 'name')?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}

                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', fontFamily: "'Playfair Display', serif", flex: 1 }}>
                                            {getLocalizedField(journal, 'name')}
                                        </h3>
                                        <span className={`badge ${journal.is_paid ? 'badge-paid' : 'badge-open'}`}>
                                            {journal.is_paid ? t('journals.subscription') : t('journals.open_access')}
                                        </span>
                                    </div>

                                    <p style={{ color: '#4a4a4a', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6, minHeight: '60px' }}>
                                        {getLocalizedField(journal, 'description')?.substring(0, 120) || t('journals.no_journals')}...
                                    </p>

                                    {journal.is_paid && (
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                            <strong style={{ color: '#1e3a5f' }}>${journal.price_per_page}</strong> {t('journals.per_page')}
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
                                            {t('journals.view_issues')}
                                        </Link>
                                        <Link
                                            href="/dashboard/author/submit"
                                            className="btn btn-primary"
                                            style={{ flex: 1, textAlign: 'center', padding: '0.625rem', fontSize: '0.875rem' }}
                                        >
                                            {t('journals.submit_article')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredJournals.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>{t('journals.no_journals')}</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
