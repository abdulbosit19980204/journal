"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl, stripHtml } from "@/lib/utils"

export default function PublishedArticlesPage() {
    const { t, tStatus, locale } = useI18n()
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
    const searchParams = useSearchParams()
    const [articles, setArticles] = useState<any[]>([])
    const [journals, setJournals] = useState<any[]>([])
    const [years, setYears] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [initialLoading, setInitialLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: "",
        journal: "",
        language: "",
        year: "",
        author: searchParams.get("author") || ""
    })

    useEffect(() => {
        // Fetch Journals for filter
        api.get("/journals/").then(res => setJournals(res.data)).catch(console.error)
        // Fetch Years for filter
        api.get("/issues/years/").then(res => setYears(res.data)).catch(console.error)
        setInitialLoading(false)
    }, [])

    useEffect(() => {
        setLoading(true)
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams()
            params.append("status", "PUBLISHED")
            if (filters.search) params.append("search", filters.search)
            if (filters.journal) params.append("journal", filters.journal)
            if (filters.language) params.append("language", filters.language)
            if (filters.year) params.append("year", filters.year)
            if (filters.author) params.append("author", filters.author)

            api.get(`/submissions/?${params.toString()}`)
                .then(res => setArticles(res.data))
                .catch(console.error)
                .finally(() => setLoading(false))
        }, 500) // Debounce for 500ms

        return () => clearTimeout(timeoutId)
    }, [filters])

    const AncientArticleCard = ({ article }: { article: any }) => {
        return (
            <div style={{
                background: '#fdf6e3',
                padding: '2.5rem',
                borderRadius: '8px',
                border: '1px solid #dcd3b6',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05), inset 0 0 50px rgba(139, 124, 91, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
            }} className="ancient-card">
                <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    opacity: 0.1,
                    fontSize: '4rem',
                    pointerEvents: 'none',
                    transform: 'rotate(15deg)'
                }}>
                    ✒️
                </div>

                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'repeating-linear-gradient(90deg, #c9a227, #c9a227 10px, transparent 10px, transparent 20px)'
                }} />

                <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#8b7c5b'
                    }}>
                        {article.journal_name}
                    </span>
                </div>

                <h2 style={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#2c1810',
                    marginBottom: '1rem',
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1.3
                }}>
                    {article.title}
                </h2>

                <div
                    style={{
                        fontSize: '0.9rem',
                        color: '#5d4037',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontStyle: 'italic'
                    }}
                    dangerouslySetInnerHTML={{ __html: stripHtml(article.abstract) }}
                />

                <div style={{
                    borderTop: '1px solid rgba(139, 124, 91, 0.2)',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#8b7c5b' }}>
                        <strong style={{ display: 'block', color: '#5d4037', marginBottom: '0.2rem' }}>{article.author_name}</strong>
                        {article.issue_info ? `Vol ${article.issue_info.volume}, No ${article.issue_info.number} (${article.issue_info.year})` : article.year}
                    </div>
                    <Link href={`/articles/${article.id}`} style={{
                        color: '#c9a227',
                        fontWeight: 700,
                        textDecoration: 'none',
                        fontSize: '0.85rem'
                    }}>
                        {t('common.view_details')} 📜
                    </Link>
                </div>
            </div>
        )
    }

    if (initialLoading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <style jsx>{`
                .view-toggle-btn {
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .view-toggle-btn.active {
                    background: #1e3a5f;
                    color: white;
                    border-color: #1e3a5f;
                }
                .ancient-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1), inset 0 0 60px rgba(139, 124, 91, 0.1);
                }
            `}</style>
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
                        {t('articles.title')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        {t('articles.subtitle')}
                    </p>
                </div>
            </section>

            {/* Filters & Articles */}
            <section style={{ padding: '3rem 0', background: '#faf9f6' }}>
                <div className="container">
                    {/* Filter Bar */}
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f' }}>
                                {t('articles.search_filters')}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    ☰ {t('common.list') || 'List'}
                                </button>
                                <button
                                    className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                                    onClick={() => setViewMode('card')}
                                >
                                    🎴 {t('common.cards') || 'Cards'}
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.6rem' }}>
                                    {t('articles.search_placeholder')}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        placeholder="Search title..."
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.6rem' }}>Journal</label>
                                <select
                                    value={filters.journal}
                                    onChange={(e) => setFilters({ ...filters, journal: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: 'white' }}
                                >
                                    <option value="">All Journals</option>
                                    {journals.map(j => (
                                        <option key={j.id} value={j.id}>{j.name_en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.6rem' }}>Language</label>
                                <select
                                    value={filters.language}
                                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: 'white' }}
                                >
                                    <option value="">All Languages</option>
                                    <option value="en">English</option>
                                    <option value="uz">Uzbek</option>
                                    <option value="ru">Russian</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.6rem' }}>Year</label>
                                <select
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: 'white' }}
                                >
                                    <option value="">All Years</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button
                                    onClick={() => setFilters({ search: "", journal: "", language: "", year: "", author: "" })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        color: '#475569',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    ✕ Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading && <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#1e3a5f', fontWeight: 500, opacity: 0.7 }}>
                        {t('common.loading')}...
                    </div>}
                    {articles.length > 0 ? (
                        viewMode === 'list' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {articles.map((article) => (
                                <article key={article.id} className="card" style={{ padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: '#fef3c7',
                                                    color: '#92400e',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    {tStatus(article.status)}
                                                </span>
                                                <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '1rem' }}>
                                                    {t('articles.published_in')} #{article.journal}
                                                </span>
                                            </div>

                                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                                                {article.title}
                                            </h2>

                                            <div
                                                className="rich-text"
                                                style={{
                                                    color: '#4a4a4a',
                                                    lineHeight: 1.7,
                                                    marginBottom: '1rem',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    fontSize: '0.95rem'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: article.abstract }}
                                            />

                                            {article.keywords && (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                    {article.keywords.split(',').map((kw: string, i: number) => (
                                                        <span key={i} style={{
                                                            padding: '0.2rem 0.6rem',
                                                            background: '#e0e7ff',
                                                            color: '#3730a3',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {kw.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                                {t('articles.by')}{' '}
                                                {article.author_name ? (
                                                    <Link href={`/profile/${article.author}`} style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }} className="hover-gold">
                                                        {article.author_name}
                                                    </Link>
                                                ) : (
                                                    <span style={{ color: '#1e3a5f', fontWeight: 500 }}>#{article.author}</span>
                                                )}
                                                {article.journal_name && (
                                                    <span style={{ marginLeft: '0.5rem' }}>
                                                        • {t('articles.published_in')}{' '}
                                                        <Link
                                                            href={article.issue_info ? `/journals/${article.journal_slug}/issue/${article.issue_info.id}` : `/journals/${article.journal_slug}`}
                                                            style={{ color: '#c9a227', textDecoration: 'none', fontWeight: 500 }}
                                                        >
                                                            {article.journal_name}
                                                            {article.issue_info && `, Vol ${article.issue_info.volume}, No ${article.issue_info.number} (${article.issue_info.year})`}
                                                        </Link>
                                                    </span>
                                                )}
                                                <span style={{ marginLeft: '0.5rem' }}>
                                                    • {new Date(article.updated_at || article.created_at).toLocaleDateString(locale)}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <Link
                                                href={`/articles/${article.id}`}
                                                className="btn btn-primary"
                                                style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                                            >
                                                {t('articles.read_more')}
                                            </Link>
                                            {article.manuscript_file && (
                                                <a
                                                    href={resolveMediaUrl(article.manuscript_file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    style={{
                                                        padding: '0.75rem 1.5rem',
                                                        border: '1px solid #1e3a5f',
                                                        color: '#1e3a5f',
                                                        borderRadius: '8px',
                                                        textAlign: 'center',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {t('articles.download_pdf')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                {articles.map((article) => (
                                    <AncientArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{t('articles.no_articles')}</h3>
                            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Check back soon for new research publications</p>
                            <Link href="/journals" className="btn btn-primary">{t('journals.all_journals')}</Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
