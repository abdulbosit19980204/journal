"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function MySubmissionDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({ title: '', abstract: '', keywords: '' })

    useEffect(() => {
        if (id) {
            api.get(`/submissions/${id}/`)
                .then(res => {
                    setSubmission(res.data)
                    setFormData({
                        title: res.data.title || '',
                        abstract: res.data.abstract || '',
                        keywords: res.data.keywords || ''
                    })
                })
                .catch(err => {
                    if (err.response?.status === 401) router.push("/auth/login")
                })
                .finally(() => setLoading(false))
        }
    }, [id, router])

    const handleUpdate = async () => {
        setProcessing(true)
        try {
            await api.patch(`/submissions/${id}/`, formData)
            setSubmission({ ...submission, ...formData })
            setEditing(false)
            alert("Submission updated successfully!")
        } catch (err) {
            alert("Failed to update submission")
        } finally {
            setProcessing(false)
        }
    }

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to withdraw this submission? This action cannot be undone.")) return

        setProcessing(true)
        try {
            await api.patch(`/submissions/${id}/`, { status: 'WITHDRAWN' })
            router.push("/dashboard?withdrawn=true")
        } catch (err) {
            alert("Failed to withdraw submission")
        } finally {
            setProcessing(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        fontSize: '1rem',
        background: 'white'
    }

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!submission) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Submission Not Found</h2>
                <Link href="/dashboard" style={{ color: '#1e3a5f' }}>← Back to Dashboard</Link>
            </div>
        )
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

    const canEdit = ['DRAFT', 'SUBMITTED'].includes(submission.status)
    const canWithdraw = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(submission.status)

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            {/* Header */}
            <section style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                color: 'white',
                padding: '2rem 0'
            }}>
                <div className="container">
                    <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        My Submission
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Main Content */}
                    <div>
                        {/* Article Info */}
                        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                {editing ? (
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 600 }}
                                    />
                                ) : (
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif" }}>
                                        {submission.title}
                                    </h2>
                                )}
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: statusColors[submission.status]?.bg || '#f3f4f6',
                                    color: statusColors[submission.status]?.text || '#374151',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '1rem'
                                }}>
                                    {submission.status}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Abstract</h3>
                                {editing ? (
                                    <textarea
                                        value={formData.abstract}
                                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                                        rows={6}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                ) : (
                                    <p style={{ color: '#4a4a4a', lineHeight: 1.7 }}>{submission.abstract}</p>
                                )}
                            </div>

                            <div>
                                <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Keywords</h3>
                                {editing ? (
                                    <input
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        placeholder="keyword1, keyword2, keyword3"
                                        style={inputStyle}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {submission.keywords?.split(',').map((kw: string, i: number) => (
                                            <span key={i} style={{
                                                padding: '0.25rem 0.75rem',
                                                background: '#f3f4f6',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                color: '#4a4a4a'
                                            }}>
                                                {kw.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Edit/Save Buttons */}
                            {canEdit && (
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    {editing ? (
                                        <>
                                            <button
                                                onClick={handleUpdate}
                                                disabled={processing}
                                                className="btn btn-primary"
                                                style={{ opacity: processing ? 0.7 : 1 }}
                                            >
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => setEditing(false)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    border: '1px solid #e5e5e5',
                                                    borderRadius: '8px',
                                                    background: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditing(true)}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                border: '1px solid #1e3a5f',
                                                color: '#1e3a5f',
                                                borderRadius: '8px',
                                                background: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 500
                                            }}
                                        >
                                            ✏️ Edit Submission
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Manuscript File Viewer */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Manuscript File</h3>

                            {submission.manuscript_file ? (
                                (() => {
                                    const fileUrl = `http://localhost:8000${submission.manuscript_file}`
                                    const isPdf = submission.manuscript_file.toLowerCase().endsWith('.pdf')
                                    const isWord = submission.manuscript_file.toLowerCase().endsWith('.doc') || submission.manuscript_file.toLowerCase().endsWith('.docx')

                                    return (
                                        <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden' }}>
                                            {/* File Header */}
                                            <div style={{
                                                padding: '1rem 1.5rem',
                                                background: 'white',
                                                borderBottom: '1px solid #e5e5e5',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        background: isPdf ? '#dc2626' : '#2563eb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {isPdf ? 'PDF' : isWord ? 'DOC' : 'FILE'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: '#1a1a1a' }}>Manuscript</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
                                                            {isPdf ? 'PDF' : isWord ? 'Word' : 'Document'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            border: '1px solid #1e3a5f',
                                                            color: '#1e3a5f',
                                                            borderRadius: '6px',
                                                            textDecoration: 'none',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        Open in New Tab
                                                    </a>
                                                    <a
                                                        href={fileUrl}
                                                        download
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#1e3a5f',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            textDecoration: 'none',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>

                                            {/* File Preview */}
                                            <div style={{ minHeight: '400px' }}>
                                                {isPdf ? (
                                                    <iframe
                                                        src={fileUrl}
                                                        style={{ width: '100%', height: '500px', border: 'none' }}
                                                        title="PDF Viewer"
                                                    />
                                                ) : isWord ? (
                                                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                                                        <h4 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>Word Document</h4>
                                                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                                            Word documents cannot be previewed directly. Please download to view.
                                                        </p>
                                                        <a href={fileUrl} download className="btn btn-primary">
                                                            📥 Download Word File
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📎</div>
                                                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Download to view</p>
                                                        <a href={fileUrl} download className="btn btn-primary">Download</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                <p style={{ color: '#6b7280' }}>No manuscript file uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Details */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e3a5f' }}>Details</h3>
                            <dl style={{ fontSize: '0.875rem' }}>
                                {[
                                    { label: 'ID', value: `#${submission.id}` },
                                    { label: 'Journal', value: `#${submission.journal}` },
                                    { label: 'Language', value: submission.language?.toUpperCase() || 'EN' },
                                    { label: 'Submitted', value: new Date(submission.submitted_at || submission.created_at).toLocaleDateString() },
                                    { label: 'Last Updated', value: new Date(submission.updated_at || submission.created_at).toLocaleDateString() },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <dt style={{ color: '#6b7280' }}>{d.label}</dt>
                                        <dd style={{ fontWeight: 500 }}>{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Status Info */}
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#1e3a5f' }}>Status Timeline</h3>
                            <div style={{ fontSize: '0.875rem', color: '#4a4a4a' }}>
                                {submission.status === 'SUBMITTED' && (
                                    <p>Your submission is waiting for editor review. You will be notified once a decision is made.</p>
                                )}
                                {submission.status === 'UNDER_REVIEW' && (
                                    <p>Your submission is currently being reviewed by our editorial team.</p>
                                )}
                                {submission.status === 'ACCEPTED' && (
                                    <p style={{ color: '#059669' }}>🎉 Congratulations! Your article has been accepted for publication.</p>
                                )}
                                {submission.status === 'REJECTED' && (
                                    <p style={{ color: '#dc2626' }}>Unfortunately, your submission was not accepted. You may submit a revised version.</p>
                                )}
                                {submission.status === 'PUBLISHED' && (
                                    <p style={{ color: '#d97706' }}>📚 Your article has been published and is now available to readers.</p>
                                )}
                            </div>
                        </div>

                        {/* Withdraw Button */}
                        {canWithdraw && (
                            <div className="card" style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#991b1b' }}>Danger Zone</h3>
                                <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1rem' }}>
                                    Withdraw your submission if you made an error or want to cancel.
                                </p>
                                <button
                                    onClick={handleCancel}
                                    disabled={processing}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        opacity: processing ? 0.7 : 1
                                    }}
                                >
                                    {processing ? 'Processing...' : '🗑️ Withdraw Submission'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
