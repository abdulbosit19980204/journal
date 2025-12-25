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
                        {filteredJournals.map((journal, i) => {
                            const journalName = getLocalizedField(journal, 'name')
                            const journalDesc = getLocalizedField(journal, 'description')

                            return (
                                <div key={journal.id} className="card" style={{
                                    position: 'relative',
                                    height: '450px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    border: 'none',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                    borderRadius: '20px',
                                    background: '#1e3a5f'
                                }}>
                                    {/* Full Cover Image */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        zIndex: 0
                                    }}>
                                        {journal.cover_image ? (
                                            <img
                                                src={journal.cover_image}
                                                alt={journalName}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(255,255,255,0.2)',
                                                fontSize: '6rem',
                                                fontWeight: 900,
                                                fontFamily: "'Playfair Display', serif"
                                            }}>
                                                {journalName?.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Dark Gradient Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.9) 100%)',
                                        zIndex: 1
                                    }} />

                                    {/* Content Overlay */}
                                    <div style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        height: '100%',
                                        padding: '1.75rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        color: 'white'
                                    }}>
                                        {/* Price Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '1.5rem',
                                            right: '1.5rem',
                                        }}>
                                            <div style={{
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
                                                color: 'white'
                                            }}>
                                                {journal.is_paid ? (
                                                    <span>${journal.price_per_page}</span>
                                                ) : (
                                                    <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.8rem' }}>$10</span>
                                                        <span style={{ color: '#10b981' }}>$0</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 style={{
                                            fontSize: '1.4rem',
                                            fontWeight: 700,
                                            marginBottom: '0.75rem',
                                            fontFamily: "'Playfair Display', serif",
                                            lineHeight: 1.2,
                                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                        }}>
                                            {journalName}
                                        </h3>
                                        <div
                                            className="rich-text"
                                            style={{
                                                fontSize: '0.9rem',
                                                marginBottom: '1.5rem',
                                                color: 'rgba(255,255,255,0.8)',
                                                lineHeight: 1.5,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: (journalDesc?.replace(/<[^>]+>/g, '') || t('journals.no_journals')) }}
                                        />

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Link
                                                href={`/journals/${journal.slug}`}
                                                style={{
                                                    flex: 1.2,
                                                    textAlign: 'center',
                                                    padding: '0.75rem',
                                                    background: '#c9a227',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    textDecoration: 'none',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {t('journals.view_issues')}
                                            </Link>
                                            <Link
                                                href="/dashboard/author/submit"
                                                className="btn btn-secondary"
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'center',
                                                    padding: '0.75rem',
                                                    fontSize: '0.875rem',
                                                    borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    backdropFilter: 'blur(5px)',
                                                    color: 'white'
                                                }}
                                            >
                                                {t('journals.submit_article')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
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
