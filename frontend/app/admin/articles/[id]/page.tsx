"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AdminArticleDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [article, setArticle] = useState<any>(null)
    const [journal, setJournal] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [showRejectInput, setShowRejectInput] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/submissions/${id}/`)
                setArticle(res.data)

                if (res.data.journal) {
                    const journalRes = await api.get(`/journals/`).catch(() => ({ data: [] }))
                    const j = journalRes.data.find((j: any) => j.id === res.data.journal)
                    setJournal(j)
                }
            } catch (err: any) {
                if (err.response?.status === 401) router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id, router])

    const handleStatusChange = async (newStatus: string) => {
        setProcessing(true)
        try {
            await api.patch(`/submissions/${id}/`, {
                status: newStatus,
                rejection_reason: newStatus === 'REJECTED' ? rejectionReason : null
            })
            setArticle({ ...article, status: newStatus })
            alert(`Article status changed to ${newStatus}`)
            setShowRejectInput(false)
        } catch (err) {
            alert("Failed to update status")
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return
        setProcessing(true)
        try {
            await api.delete(`/submissions/${id}/`)
            router.push("/admin/articles")
        } catch (err) {
            alert("Failed to delete article")
        } finally {
            setProcessing(false)
        }
    }

    const statusColors: Record<string, { bg: string; text: string }> = {
        DRAFT: { bg: '#f3f4f6', text: '#374151' },
        SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
        UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
        ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
        REJECTED: { bg: '#fee2e2', text: '#991b1b' },
        PUBLISHED: { bg: '#fef3c7', text: '#92400e' },
        WITHDRAWN: { bg: '#f3f4f6', text: '#6b7280' },
    }

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
    }

    if (!article) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Article Not Found</h2>
                <Link href="/admin/articles" style={{ color: '#1e3a5f' }}>← Back to Articles</Link>
            </div>
        )
    }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
                <div className="container">
                    <Link href="/admin/articles" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Articles</Link>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: '0.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>
                                Review Article
                            </h1>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: statusColors[article.status]?.bg || '#f3f4f6',
                                color: statusColors[article.status]?.text || '#374151'
                            }}>
                                {article.status}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Main Content */}
                    <div>
                        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                                {article.title}
                            </h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Abstract</h3>
                                <div
                                    style={{ color: '#4a4a4a', lineHeight: 1.7 }}
                                    dangerouslySetInnerHTML={{ __html: article.abstract || 'No abstract provided.' }}
                                />
                            </div>

                            {/* Rejection Reason Input */}
                            {showRejectInput && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                                    <h4 style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.5rem' }}>Reason for Rejection</h4>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please explain why this article is being rejected..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e5e5', minHeight: '100px', marginBottom: '1rem' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setShowRejectInput(false)}
                                            style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                        <button onClick={() => handleStatusChange('REJECTED')} disabled={processing || !rejectionReason.trim()}
                                            style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: !rejectionReason.trim() ? 0.5 : 1 }}>
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Keywords</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {article.keywords?.split(',').map((kw: string, i: number) => (
                                        <span key={i} style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#f3f4f6',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem',
                                            color: '#4a4a4a'
                                        }}>
                                            {kw.trim()}
                                        </span>
                                    )) || <span style={{ color: '#6b7280' }}>No keywords</span>}
                                </div>
                            </div>
                        </div>

                        {/* Manuscript */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Manuscript File</h3>
                            {article.manuscript_file ? (
                                <>
                                    <div style={{
                                        width: '100%',
                                        height: '500px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '1rem',
                                        background: '#f9fafb'
                                    }}>
                                        <iframe
                                            src={`http://localhost:8000${article.manuscript_file}`}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            title="Manuscript"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <a
                                            href={`http://localhost:8000${article.manuscript_file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            Open in New Tab
                                        </a>
                                        <a
                                            href={`http://localhost:8000${article.manuscript_file}`}
                                            download
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                border: '1px solid #1e3a5f',
                                                color: '#1e3a5f',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Download
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <p style={{ color: '#6b7280' }}>No manuscript file uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Article Details */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Article Details</h3>
                            <dl style={{ fontSize: '0.875rem' }}>
                                {[
                                    { label: 'ID', value: `#${article.id}` },
                                    { label: 'Author', value: article.author_name || `User #${article.author}` },
                                    { label: 'Journal', value: journal?.name_en || `#${article.journal}` },
                                    { label: 'Language', value: article.language?.toUpperCase() || 'EN' },
                                    { label: 'Submitted', value: new Date(article.created_at).toLocaleDateString() },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <dt style={{ color: '#6b7280' }}>{d.label}</dt>
                                        <dd style={{ fontWeight: 500, textAlign: 'right' }}>{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Actions */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {article.status === 'SUBMITTED' && (
                                    <button onClick={() => handleStatusChange('UNDER_REVIEW')} disabled={processing}
                                        style={{ width: '100%', padding: '0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                        📋 Start Review
                                    </button>
                                )}

                                {['SUBMITTED', 'UNDER_REVIEW'].includes(article.status) && !showRejectInput && (
                                    <>
                                        <button onClick={() => handleStatusChange('ACCEPTED')} disabled={processing}
                                            style={{ width: '100%', padding: '0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                            ✓ Accept Article
                                        </button>
                                        <button onClick={() => setShowRejectInput(true)} disabled={processing}
                                            style={{ width: '100%', padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                            ✗ Reject Article
                                        </button>
                                    </>
                                )}

                                {article.status === 'ACCEPTED' && (
                                    <button onClick={() => handleStatusChange('PUBLISHED')} disabled={processing}
                                        style={{ width: '100%', padding: '0.75rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                        📚 Publish Article
                                    </button>
                                )}

                                {article.status === 'PUBLISHED' && (
                                    <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '8px', textAlign: 'center' }}>
                                        <span style={{ color: '#065f46', fontWeight: 600 }}>✓ This article is published</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="card" style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                            <h3 style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.75rem' }}>Danger Zone</h3>
                            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1rem' }}>
                                Delete this article permanently.
                            </p>
                            <button onClick={handleDelete} disabled={processing}
                                style={{ width: '100%', padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                🗑️ Delete Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
