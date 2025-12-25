"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl } from "@/lib/utils"

export default function IssueDetailPage() {
    const { t, locale } = useI18n()
    const { slug, id } = useParams()
    const [issue, setIssue] = useState<any>(null)
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredArticles, setFilteredArticles] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch issue details
                const issueRes = await api.get(`/issues/${id}/`)
                setIssue(issueRes.data)

                // Fetch public articles in this issue (using the backend filter we added)
                const articlesRes = await api.get(`/submissions/?issue=${id}&status=PUBLISHED`)
                setArticles(articlesRes.data)
                setFilteredArticles(articlesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    // Handle search/filter
    useEffect(() => {
        if (!articles.length) return

        let result = [...articles]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.abstract?.toLowerCase().includes(query) ||
                article.keywords?.toLowerCase().includes(query)
            )
        }

        setFilteredArticles(result)
    }, [searchQuery, articles])

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }

    if (!issue) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>{t('common.not_found')}</h2>
                <Link href={`/journals/${slug}`} style={{ color: '#1e3a5f' }}>← {t('journals.back_to_issues')}</Link>
            </div>
        )
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            {/* Header */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                color: 'white',
                padding: '3rem 0'
            }}>
                <div className="container">
                    <Link href={`/journals/${slug}`} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        ← {t('journals.back_to_issues')}
                    </Link>
                    <div style={{ marginTop: '1rem' }}>
                        <span style={{ opacity: 0.8, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('journals.volume')} {issue.volume}, {t('journals.issue')} {issue.number}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                            {issue.year}
                        </h1>
                    </div>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Search Bar */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <input
                            type="text"
                            placeholder={t('admin.search') + "..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1.25rem',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Full Issue PDF Viewer */}
                {issue.file && (
                    <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif" }}>
                                    Read Full Issue
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Access the complete printed version of this issue.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a
                                    href={resolveMediaUrl(issue.file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    Open Full PDF
                                </a>
                                <a
                                    href={resolveMediaUrl(issue.file)}
                                    download
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'white',
                                        border: '1px solid #1e3a5f',
                                        color: '#1e3a5f',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Download Issue
                                </a>
                            </div>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '600px',
                            border: '1px solid #e1e8ef',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'white'
                        }}>
                            <iframe
                                src={`${resolveMediaUrl(issue.file)}#toolbar=0`}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                title="Full Issue"
                            />
                        </div>
                    </div>
                )}

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                    Articles in this Issue
                </h2>

                {/* Articles List */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <div key={article.id} className="card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                                            <Link href={`/articles/${article.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            {article.keywords?.split(',').map((kw: string, i: number) => (
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
                                        <p
                                            className="rich-text"
                                            style={{ color: '#4a4a4a', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1rem' }}
                                            dangerouslySetInnerHTML={{ __html: article.abstract?.substring(0, 300) + '...' }}
                                        />
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                {t('articles.by')} <span style={{ color: '#1e3a5f', fontWeight: 500 }}>{article.author_name}</span>
                                            </div>
                                            {article.page_range && (
                                                <div style={{ fontStyle: 'italic' }}>
                                                    Pages: {article.page_range}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                                        <Link href={`/articles/${article.id}`} className="btn btn-primary" style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                                            {t('articles.read_more')}
                                        </Link>
                                        {article.manuscript_file && (
                                            <a
                                                href={resolveMediaUrl(article.manuscript_file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                style={{
                                                    padding: '0.625rem',
                                                    border: '1px solid #1e3a5f',
                                                    color: '#1e3a5f',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    display: 'block',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            {searchQuery ? t('common.not_found') : t('articles.no_articles')}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
