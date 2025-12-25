"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function ArticleDetailPage() {
    const { t, tStatus, locale } = useI18n()
    const { id } = useParams()
    const [article, setArticle] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            api.get(`/submissions/${id}/`)
                .then(res => setArticle(res.data))
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [id])

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!article) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>{t('articles.not_found')}</h2>
                <Link href="/articles" style={{ color: '#1e3a5f' }}>← {t('articles.back_to_articles')}</Link>
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
                <div className="container" style={{ maxWidth: '900px' }}>
                    <Link href="/articles" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        ← {t('articles.back_to_published')}
                    </Link>
                    <div style={{ marginTop: '1rem' }}>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(201, 162, 39, 0.2)',
                            color: '#c9a227',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {tStatus(article.status)}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '1rem', fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                        {article.title}
                    </h1>
                    <div style={{ marginTop: '1.5rem', opacity: 0.9, fontSize: '0.9rem' }}>
                        {t('articles.by')} #{article.author} • {t('articles.published_in')} #{article.journal} • {new Date(article.updated_at || article.created_at).toLocaleDateString(locale)}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '3rem 0' }}>
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        {/* Abstract */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                                {t('articles.abstract')}
                            </h2>
                            <p style={{ color: '#4a4a4a', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                {article.abstract}
                            </p>
                        </div>

                        {/* Keywords */}
                        {article.keywords && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem' }}>{t('articles.keywords')}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {article.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} style={{
                                            padding: '0.35rem 0.85rem',
                                            background: '#e0e7ff',
                                            color: '#3730a3',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem'
                                        }}>
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PDF Viewer / Download */}
                        <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>{t('articles.full_article')}</h3>

                            {article.manuscript_file ? (
                                <>
                                    {/* PDF Embed */}
                                    <div style={{
                                        width: '100%',
                                        height: '600px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '1rem'
                                    }}>
                                        <iframe
                                            src={article.manuscript_file}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            title="Article PDF"
                                        />
                                    </div>

                                    <a
                                        href={article.manuscript_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        📄 {t('articles.download_pdf')}
                                    </a>
                                </>
                            ) : (
                                <p style={{ color: '#6b7280' }}>{t('articles.pdf_not_available')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
