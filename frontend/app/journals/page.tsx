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
                                    overflow: 'hidden', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    borderRadius: '16px',
                                    height: '100%'
                                }}>
                                    {/* Cover Image */}
                                    <div style={{ 
                                        height: '240px', 
                                        position: 'relative', 
                                        background: '#f9fafb',
                                        overflow: 'hidden'
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
                                                color: 'white',
                                                fontSize: '3rem',
                                                fontWeight: 700,
                                                fontFamily: "'Playfair Display', serif"
                                            }}>
                                                {journalName?.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        
                                        {/* Badge Overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            zIndex: 2
                                        }}>
                                            <span className={`badge ${journal.is_paid ? 'badge-paid' : 'badge-open'}`} style={{
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                padding: '0.4rem 0.8rem',
                                                backdropFilter: 'blur(4px)',
                                                background: journal.is_paid ? 'rgba(201, 162, 39, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                                                color: 'white',
                                                border: 'none'
                                            }}>
                                                {journal.is_paid ? t('journals.subscription') : t('journals.open_access')}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: 700, 
                                            color: '#1e3a5f', 
                                            marginBottom: '0.75rem',
                                            fontFamily: "'Playfair Display', serif",
                                            lineHeight: 1.3
                                        }}>
                                            {journalName}
                                        </h3>
                                        <div 
                                            className="rich-text"
                                            style={{ 
                                                fontSize: '0.9rem', 
                                                marginBottom: '1.5rem', 
                                                minHeight: '60px',
                                                color: '#6b7280',
                                                lineHeight: 1.6,
                                                flex: 1
                                            }}
                                            dangerouslySetInnerHTML={{ __html: (journalDesc?.replace(/<[^>]+>/g, '').substring(0, 120) || t('journals.no_journals')) + '...' }}
                                        />

                                        {journal.is_paid && (
                                            <p style={{ fontSize: '0.9rem', color: '#1e3a5f', marginBottom: '1.5rem', fontWeight: 600 }}>
                                                ${journal.price_per_page} <span style={{ color: '#6b7280', fontWeight: 400 }}>{t('journals.per_page')}</span>
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
                                            <Link
                                                href={`/journals/${journal.slug}`}
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'center',
                                                    padding: '0.75rem',
                                                    border: '1.5px solid #1e3a5f',
                                                    color: '#1e3a5f',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {t('journals.view_issues')}
                                            </Link>
                                            <Link
                                                href="/dashboard/author/submit"
                                                className="btn btn-primary"
                                                style={{ 
                                                    flex: 1, 
                                                    textAlign: 'center', 
                                                    padding: '0.75rem', 
                                                    fontSize: '0.875rem',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.2)'
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
