"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function ReviewSubmissionPage() {
    const { id } = useParams()
    const router = useRouter()
    const [submission, setSubmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const res = await api.get(`/submissions/${id}/`)
                setSubmission(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchSubmission()
    }, [id])

    const handleDecision = async (status: 'ACCEPTED' | 'REJECTED') => {
        setProcessing(true)
        try {
            await api.patch(`/submissions/${id}/`, { status })
            router.push("/dashboard/editor?updated=true")
        } catch (err) {
            console.error(err)
            alert("Failed to update status")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Loading submission...</p>
                </div>
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">Submission Not Found</h2>
                    <Link href="/dashboard/editor" className="text-[var(--primary)] hover:underline">← Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SUBMITTED: 'bg-blue-100 text-blue-800',
        UNDER_REVIEW: 'bg-purple-100 text-purple-800',
        ACCEPTED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        PUBLISHED: 'bg-amber-100 text-amber-800',
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="gradient-primary text-white py-8">
                <div className="max-w-5xl mx-auto px-4">
                    <Link href="/dashboard/editor" className="text-white/80 hover:text-white mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Review Submission</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Abstract */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-2xl font-bold text-[var(--primary)]">{submission.title}</h2>
                                <span className={`badge ${statusColors[submission.status]}`}>
                                    {submission.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="prose prose-gray max-w-none">
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Abstract</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed">{submission.abstract}</p>
                            </div>
                        </div>

                        {/* Keywords */}
                        {submission.keywords && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {submission.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-[var(--text-secondary)] rounded-full text-sm">
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Manuscript Download */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Manuscript File</h3>
                            {submission.manuscript_file ? (
                                <a
                                    href={`http://localhost:8000${submission.manuscript_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">📄</div>
                                    <div className="flex-1">
                                        <div className="font-medium text-[var(--primary)]">Download Manuscript</div>
                                        <div className="text-sm text-[var(--text-muted)]">PDF Document</div>
                                    </div>
                                    <span className="text-[var(--primary)]">↓</span>
                                </a>
                            ) : (
                                <p className="text-[var(--text-muted)]">No manuscript file uploaded</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Details</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-[var(--text-muted)]">Submission ID</dt>
                                    <dd className="font-medium">#{submission.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[var(--text-muted)]">Author</dt>
                                    <dd className="font-medium">{submission.author_name || `Author #${submission.author}`}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[var(--text-muted)]">Journal</dt>
                                    <dd className="font-medium">#{submission.journal}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[var(--text-muted)]">Language</dt>
                                    <dd className="font-medium uppercase">{submission.language}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-[var(--text-muted)]">Submitted</dt>
                                    <dd className="font-medium">{new Date(submission.submitted_at || submission.created_at).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Decision Panel */}
                        {(submission.status === 'SUBMITTED' || submission.status === 'UNDER_REVIEW') && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Make Decision</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleDecision('ACCEPTED')}
                                        disabled={processing}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        ✓ Accept Article
                                    </button>
                                    <button
                                        onClick={() => handleDecision('REJECTED')}
                                        disabled={processing}
                                        className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        ✗ Reject Article
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Already Decided */}
                        {(submission.status === 'ACCEPTED' || submission.status === 'REJECTED') && (
                            <div className={`rounded-xl p-6 ${submission.status === 'ACCEPTED' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="text-center">
                                    <div className={`text-4xl mb-2 ${submission.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                                        {submission.status === 'ACCEPTED' ? '✓' : '✗'}
                                    </div>
                                    <h3 className={`font-bold ${submission.status === 'ACCEPTED' ? 'text-green-800' : 'text-red-800'}`}>
                                        Article {submission.status.toLowerCase()}
                                    </h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
