"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function ReviewSubmissionPage() {
    const { t, tStatus, locale } = useI18n()
    const { id } = useParams()
    const router = useRouter()
    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (id) api.get(`/submissions/${id}/`).then(res => setSubmission(res.data)).catch(console.error).finally(() => setLoading(false))
    }, [id])

    const handleDecision = async (status: 'ACCEPTED' | 'REJECTED') => {
        setProcessing(true)
        try {
            await api.patch(`/submissions/${id}/`, { status })
            router.push("/dashboard/editor")
        } catch { alert(t('admin.update_failed')) }
        finally { setProcessing(false) }
    }

    if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    if (!submission) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>{t('common.not_found')}</h2>
        <Link href="/dashboard/editor" style={{ color: '#1e3a5f' }}>← {t('admin.back_to_dashboard')}</Link>
    </div>

    const statusColors: Record<string, { bg: string; text: string }> = {
        SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
        UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
        ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
        REJECTED: { bg: '#fee2e2', text: '#991b1b' },
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
                <div className="container">
                    <Link href="/dashboard/editor" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← {t('admin.back_to_dashboard')}</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>{t('admin.review_article')}</h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Main */}
                    <div>
                        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif" }}>{submission.title}</h2>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: statusColors[submission.status]?.bg || '#f3f4f6',
                                    color: statusColors[submission.status]?.text || '#374151'
                                }}>
                                    {tStatus(submission.status)}
                                </span>
                            </div>
                            <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.75rem' }}>{t('submissions.abstract')}</h3>
                            <p style={{ color: '#4a4a4a', lineHeight: 1.7 }}>{submission.abstract}</p>
                        </div>

                        {submission.keywords && (
                            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{t('submissions.keywords')}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {submission.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#f3f4f6', borderRadius: '9999px', fontSize: '0.875rem', color: '#4a4a4a' }}>
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('submissions.manuscript')}</h3>
                            {submission.manuscript_file ? (
                                <a href={`http://localhost:8000${submission.manuscript_file}`} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e5e5e5', borderRadius: '8px', textDecoration: 'none' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: '#1e3a5f' }}>{t('admin.download_manuscript')}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('admin.pdf_document')}</div>
                                    </div>
                                </a>
                            ) : <p style={{ color: '#6b7280' }}>{t('submissions.no_file')}</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('common.details')}</h3>
                            <dl style={{ fontSize: '0.875rem' }}>
                                {[
                                    { label: 'ID', value: `#${submission.id}` },
                                    { label: t('admin.author'), value: `#${submission.author}` },
                                    { label: t('submissions.journal'), value: `#${submission.journal}` },
                                    { label: t('submissions.language'), value: submission.language?.toUpperCase() },
                                    { label: t('admin.date'), value: new Date(submission.submitted_at || submission.created_at).toLocaleDateString(locale) },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <dt style={{ color: '#6b7280' }}>{d.label}</dt>
                                        <dd style={{ fontWeight: 500 }}>{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {['SUBMITTED', 'UNDER_REVIEW'].includes(submission.status) && (
                            <div className="card" style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('admin.make_decision')}</h3>
                                <button onClick={() => handleDecision('ACCEPTED')} disabled={processing}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', background: '#059669', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', marginBottom: '0.75rem', opacity: processing ? 0.7 : 1 }}>
                                    ✓ {t('admin.action_accept')}
                                </button>
                                <button onClick={() => handleDecision('REJECTED')} disabled={processing}
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', background: '#dc2626', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: processing ? 0.7 : 1 }}>
                                    ✗ {t('admin.action_reject')}
                                </button>
                            </div>
                        )}

                        {['ACCEPTED', 'REJECTED'].includes(submission.status) && (
                            <div style={{
                                padding: '1.5rem',
                                borderRadius: '12px',
                                textAlign: 'center',
                                background: submission.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                                border: `1px solid ${submission.status === 'ACCEPTED' ? '#a7f3d0' : '#fecaca'}`
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{submission.status === 'ACCEPTED' ? '✓' : '✗'}</div>
                                <div style={{ fontWeight: 600, color: submission.status === 'ACCEPTED' ? '#065f46' : '#991b1b' }}>
                                    {tStatus(submission.status)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
