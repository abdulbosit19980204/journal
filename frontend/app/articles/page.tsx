"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function PublishedArticlesPage() {
    const { t, tStatus, locale } = useI18n()
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/submissions/?status=PUBLISHED")
            .then(res => setArticles(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

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
                        {t('articles.title')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
                        {t('articles.subtitle')}
                    </p>
                </div>
            </section>

            {/* Articles */}
            <section style={{ padding: '4rem 0', background: '#faf9f6' }}>
                <div className="container">
                    {articles.length > 0 ? (
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
                                                {t('articles.by')} <span style={{ color: '#1e3a5f', fontWeight: 500 }}>{article.author_name || `#${article.author}`}</span> • {new Date(article.updated_at || article.created_at).toLocaleDateString(locale)}
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
                                                    href={`http://localhost:8000${article.manuscript_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
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
