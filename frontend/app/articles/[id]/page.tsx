"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function ArticleDetailPage() {
    const { t, tStatus, locale } = useI18n()
    const { id } = useParams()
    const { user } = useAuth()
    const [article, setArticle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [critique, setCritique] = useState("")
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        if (id) {
            api.get(`/submissions/${id}/`)
                .then(res => setArticle(res.data))
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [id])

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!critique.trim()) return

        setSubmittingReview(true)
        try {
            await api.post("/reviews/", {
                article: article.id,
                critique: critique
            })
            // Refresh article to get new reviews
            const res = await api.get(`/submissions/${id}/`)
            setArticle(res.data)
            setCritique("")
            toast.success(t('articles.review_success') || "Critique submitted successfully!")
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to submit critique")
        } finally {
            setSubmittingReview(false)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!article) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                <h2 style={{ color: '#1e3a5f', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>{t('articles.not_found')}</h2>
                <Link href="/articles" className="btn btn-outline">
                    ← {t('articles.back_to_articles')}
                </Link>
            </div>
        )
    }

    return (
        <main key={locale} style={{ background: '#faf9f6', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Header Section */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #152943 100%)',
                color: 'white',
                padding: '4rem 0',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    opacity: 0.1,
                    backgroundImage: 'url(/pattern.png)',
                    backgroundSize: 'cover'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1000px' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href="/articles" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>←</span> {t('articles.back_to_published')}
                        </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.35rem 1rem',
                            background: 'rgba(201, 162, 39, 0.2)',
                            border: '1px solid rgba(201, 162, 39, 0.4)',
                            color: '#eab308',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            {article.language?.toUpperCase() || 'EN'}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            {new Date(article.updated_at || article.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: '2.75rem',
                        fontWeight: 700,
                        marginBottom: '2rem',
                        fontFamily: "'Playfair Display', serif",
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em'
                    }}>
                        {article.title}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#c9a227',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1e3a5f',
                                fontWeight: 700,
                                fontSize: '1.25rem'
                            }}>
                                {article.author_name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{t('articles.by')}</div>
                                <Link href={`/profile/${article.author}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} className="hover-gold">
                                    {article.author_name || `#${article.author}`}
                                </Link>
                            </div>
                        </div>

                        {article.journal_name && (
                            <div style={{ paddingLeft: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{t('articles.published_in')}</div>
                                <Link
                                    href={article.issue_info ? `/journals/${article.journal_slug}/issue/${article.issue_info.id}` : `/journals/${article.journal_slug}`}
                                    style={{ color: '#c9a227', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }}
                                >
                                    {article.journal_name}
                                </Link>
                                {article.issue_info && (
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.2rem' }}>
                                        Vol {article.issue_info.volume}, No {article.issue_info.number} ({article.issue_info.year})
                                        {article.page_range && ` • pp. ${article.page_range}`}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container" style={{ maxWidth: '1000px', marginTop: '-3rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Abstract */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#1e3a5f',
                            marginBottom: '1.5rem',
                            fontFamily: "'Playfair Display', serif",
                            borderBottom: '2px solid #f3f4f6',
                            paddingBottom: '0.75rem',
                            display: 'inline-block'
                        }}>
                            {t('articles.abstract')}
                        </h2>
                        <div
                            className="rich-text"
                            style={{
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                                color: '#374151',
                                fontFamily: "'Georgia', serif",
                                textAlign: 'justify',
                                maxWidth: '800px',
                                margin: '0 auto',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                            dangerouslySetInnerHTML={{ __html: article.abstract }}
                        />
                    </div>

                    {/* Keywords */}
                    {article.keywords && article.keywords.length > 0 && (
                        <div style={{ marginBottom: '3rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                {t('articles.keywords')}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {article.keywords.split(',').map((kw: string, i: number) => (
                                    <Link key={i} href={`/articles?search=${kw.trim()}`} style={{ textDecoration: 'none' }}>
                                        <span style={{
                                            padding: '0.4rem 1rem',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            color: '#475569',
                                            borderRadius: '9999px',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer'
                                        }} className="hover:border-primary hover:text-primary">
                                            {kw.trim()}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certificate Section */}
                    {article.status === 'PUBLISHED' && (
                        <div style={{ marginBottom: '3rem', background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>
                                        {t('articles.certificate') || 'Publication Certificate'}
                                    </h3>
                                    <p style={{ color: '#15803d', fontSize: '0.95rem' }}>
                                        {t('articles.certificate_desc') || 'Download the official certificate of publication.'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[
                                        { lang: 'en', label: 'English' },
                                        { lang: 'uz', label: 'O\'zbek' },
                                        { lang: 'ru', label: 'Русский' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.lang}
                                            onClick={async () => {
                                                try {
                                                    const res = await api.get(`/submissions/${article.id}/certificate/?lang=${opt.lang}`, { responseType: 'blob' });
                                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.setAttribute('download', `Certificate_${article.id}_${opt.lang}.pdf`);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.remove();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Error downloading certificate");
                                                }
                                            }}
                                            className="btn"
                                            style={{
                                                background: 'white',
                                                border: '1px solid #166534',
                                                color: '#166534',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 500
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Text / PDF Viewer */}
                    <div id="full-text" style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#1e3a5f',
                                fontFamily: "'Playfair Display', serif",
                                margin: 0
                            }}>
                                {t('articles.read_online') || 'Read Online'}
                            </h2>
                            {article.manuscript_file && (
                                <a
                                    href={resolveMediaUrl(article.manuscript_file)}
                                    download
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <span>📥</span> {t('articles.download_full_text')}
                                </a>
                            )}
                        </div>

                        {article.manuscript_file ? (
                            <div style={{
                                background: '#f1f5f9',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #e2e8f0',
                                padding: '4rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.7 }}>📄</div>
                                <h3 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>{t('articles.read_full_text')}</h3>
                                <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                    {t('articles.read_desc') || "You can view the full text of this article online or download it to your device."}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <a
                                        href={resolveMediaUrl(article.manuscript_file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        {t('articles.view_pdf') || "View PDF"}
                                    </a>
                                    <a
                                        href={resolveMediaUrl(article.manuscript_file)}
                                        download
                                        className="btn btn-outline"
                                    >
                                        {t('articles.download_file')}
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '4rem',
                                textAlign: 'center',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '2px dashed #e2e8f0'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
                                <p style={{ color: '#64748b' }}>{t('articles.pdf_not_available')}</p>
                            </div>
                        )}
                    </div>

                    {/* Reviews / Critiques Section */}
                    <div id="reviews" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '3rem' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#1e3a5f',
                            marginBottom: '2rem',
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            {t('articles.critiques') || 'Expert Critiques'}
                        </h2>

                        {article.reviews && article.reviews.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
                                {article.reviews.map((rev: any) => (
                                    <div key={rev.id} style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #c9a227' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'start' }}>
                                            <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{rev.expert_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                {new Date(rev.created_at).toLocaleDateString(locale)}
                                            </div>
                                        </div>
                                        <div style={{ color: '#4b5563', lineHeight: 1.6, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                                            {rev.critique}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280', marginBottom: '3rem' }}>
                                {t('articles.no_critiques') || 'No expert critiques available for this article yet.'}
                            </div>
                        )}

                        {/* Expert Review Form */}
                        {user?.is_expert && (
                            <div style={{ background: '#fffbeb', padding: '2rem', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#92400e', marginBottom: '1rem' }}>
                                    {t('articles.write_critique') || 'Submit an Expert Critique'}
                                </h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <textarea
                                        value={critique}
                                        onChange={(e) => setCritique(e.target.value)}
                                        placeholder={t('articles.critique_placeholder') || "Write your professional critique here..."}
                                        required
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #fcd34d',
                                            marginBottom: '1rem',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="btn btn-primary"
                                            style={{ background: '#c9a227', borderColor: '#c9a227', minWidth: '150px' }}
                                        >
                                            {submittingReview ? "..." : (t('articles.submit_critique') || 'Post Critique')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </main >
    )
}
