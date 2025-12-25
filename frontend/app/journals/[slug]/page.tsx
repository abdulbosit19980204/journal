"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function JournalDetailPage() {
    const { t, locale } = useI18n()
    const { slug } = useParams()
    const [journal, setJournal] = useState<any>(null)
    const [issues, setIssues] = useState<any[]>([])
    const [filteredIssues, setFilteredIssues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/journals/${slug}/`)
                setJournal(res.data)
                const issuesRes = await api.get(`/issues/?journal=${res.data.id}`)
                setIssues(issuesRes.data)
                setFilteredIssues(issuesRes.data.sort((a: any, b: any) => b.year - a.year))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (slug) fetchData()
    }, [slug])

    // Filter & Sort Issues
    useEffect(() => {
        if (!issues.length) return

        let result = [...issues]

        if (searchQuery) {
            result = result.filter(issue =>
                issue.year.toString().includes(searchQuery) ||
                issue.volume.toString().includes(searchQuery) ||
                issue.number.toString().includes(searchQuery)
            )
        }

        result.sort((a, b) => {
            if (sortOrder === 'desc') return b.year - a.year
            return a.year - b.year
        })

        setFilteredIssues(result)
    }, [searchQuery, sortOrder, issues])

    // Get localized name/description based on current locale
    const getLocalizedField = (obj: any, field: string) => {
        if (!obj) return ''
        const localizedKey = `${field}_${locale}`
        return obj[localizedKey] || obj[`${field}_en`] || ''
    }

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }

    if (!journal) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                <h2 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>{t('common.not_found')}</h2>
                <Link href="/journals" style={{ color: '#1e3a5f' }}>← {t('journals.back_to_journals')}</Link>
            </div>
        )
    }

    const journalName = getLocalizedField(journal, 'name')
    const journalDescription = getLocalizedField(journal, 'description')

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            {/* Header */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                color: 'white',
                padding: '3rem 0'
            }}>
                <div className="container">
                    <Link href="/journals" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        ← {t('journals.all_journals')}
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#c9a227'
                        }}>
                            {journal.name_en?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                                {journalName}
                            </h1>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: journal.is_paid ? 'rgba(201, 162, 39, 0.2)' : 'rgba(5, 150, 105, 0.2)',
                                    color: journal.is_paid ? '#c9a227' : '#10b981'
                                }}>
                                    {journal.is_paid ? t('journals.subscription') : t('journals.open_access')}
                                </span>
                                {journal.is_paid && (
                                    <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>${journal.price_per_page}/{t('submissions.page')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Main Content */}
                    <div>
                        {/* About */}
                        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                                {t('journals.about_journal')}
                            </h2>
                            <div
                                className="rich-text"
                                style={{ fontSize: '1.05rem' }}
                                dangerouslySetInnerHTML={{ __html: journalDescription || 'A peer-reviewed academic journal focusing on cutting-edge research and scholarly discourse.' }}
                            />
                        </div>

                        {/* Issues */}
                        <div className="card">
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>{t('journals.published_issues')}</h2>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        placeholder={t('admin.search') + "..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                                    />
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e5e5' }}
                                    >
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                            {filteredIssues.length > 0 ? (
                                <div>
                                    {filteredIssues.map((issue) => (
                                        <div key={issue.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ fontWeight: 600, color: '#1e3a5f' }}>{t('journals.volume')} {issue.volume}, {t('journals.issue')} {issue.number}</h3>
                                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{issue.year}</p>
                                            </div>
                                            <Link href={`/journals/${slug}/issue/${issue.id}`} style={{
                                                padding: '0.5rem 1rem',
                                                border: '1px solid #1e3a5f',
                                                color: '#1e3a5f',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}>
                                                {t('journals.view_issue')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                                    <p style={{ color: '#6b7280' }}>{t('journals.no_issues')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>{t('journals.submit_work')}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {t('journals.share_research')}
                            </p>
                            <Link href="/dashboard/author/submit" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                                {t('journals.submit_article')}
                            </Link>
                        </div>

                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>{t('journals.journal_info')}</h3>
                            <dl style={{ fontSize: '0.875rem' }}>
                                {[
                                    { label: t('journals.slug'), value: journal.slug },
                                    { label: t('journals.issues_count'), value: issues.length },
                                    { label: t('journals.type'), value: journal.is_paid ? t('journals.paid') : t('journals.free') },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <dt style={{ color: '#6b7280' }}>{d.label}</dt>
                                        <dd style={{ fontWeight: 500 }}>{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
