"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, subRes] = await Promise.all([
                    api.get("/auth/me/"),
                    api.get("/submissions/")
                ])
                setUser(userRes.data)
                setSubmissions(subRes.data)
            } catch (err) {
                router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.push("/auth/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Loading your dashboard...</p>
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
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--primary)]">
                            Welcome back, {user?.first_name || user?.username}!
                        </h1>
                        <p className="text-[var(--text-muted)] mt-1">Manage your submissions and track their progress</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/author/submit" className="btn-primary">
                            + New Submission
                        </Link>
                        <button onClick={handleLogout} className="px-4 py-2 border border-gray-200 rounded-lg text-[var(--text-secondary)] hover:bg-gray-50 transition">
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Submissions', value: submissions.length, color: 'var(--primary)' },
                        { label: 'Under Review', value: submissions.filter(s => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED').length, color: '#6366f1' },
                        { label: 'Accepted', value: submissions.filter(s => s.status === 'ACCEPTED').length, color: '#059669' },
                        { label: 'Published', value: submissions.filter(s => s.status === 'PUBLISHED').length, color: '#d97706' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="text-sm text-[var(--text-muted)] mb-2">{stat.label}</div>
                            <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link href="/dashboard/author/submit" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                        <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white text-xl mb-4">📄</div>
                        <h3 className="font-bold text-[var(--primary)] mb-2 group-hover:text-[var(--primary-light)]">Submit Article</h3>
                        <p className="text-[var(--text-muted)] text-sm">Upload a new manuscript for review</p>
                    </Link>
                    <Link href="/journals" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                        <div className="w-12 h-12 rounded-lg bg-[var(--secondary)] flex items-center justify-center text-white text-xl mb-4">📚</div>
                        <h3 className="font-bold text-[var(--primary)] mb-2 group-hover:text-[var(--primary-light)]">Browse Journals</h3>
                        <p className="text-[var(--text-muted)] text-sm">Explore our journal collection</p>
                    </Link>
                    <Link href="/pricing" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                        <div className="w-12 h-12 rounded-lg bg-[#059669] flex items-center justify-center text-white text-xl mb-4">💎</div>
                        <h3 className="font-bold text-[var(--primary)] mb-2 group-hover:text-[var(--primary-light)]">Upgrade Plan</h3>
                        <p className="text-[var(--text-muted)] text-sm">Get more publishing benefits</p>
                    </Link>
                </div>

                {/* Submissions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[var(--primary)]">My Submissions</h2>
                    </div>
                    {submissions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {submissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-[var(--text-primary)]">{sub.title}</div>
                                                <div className="text-sm text-[var(--text-muted)]">Journal #{sub.journal}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                                {new Date(sub.submitted_at || sub.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-[var(--primary)] hover:underline text-sm font-medium">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📝</div>
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No submissions yet</h3>
                            <p className="text-[var(--text-muted)] mb-4">Start your publishing journey today</p>
                            <Link href="/dashboard/author/submit" className="btn-primary">
                                Submit Your First Article
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
