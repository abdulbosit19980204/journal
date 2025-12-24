"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function EditorDashboardPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get("/submissions/")
        setSubmissions(res.data)
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [router])

  const filteredSubmissions = filter === 'ALL'
    ? submissions
    : submissions.filter(s => s.status === filter)

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PUBLISHED: 'bg-amber-100 text-amber-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="gradient-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <p className="opacity-80 mt-1">Review and manage article submissions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'All', count: submissions.length, filter: 'ALL' },
            { label: 'Submitted', count: submissions.filter(s => s.status === 'SUBMITTED').length, filter: 'SUBMITTED' },
            { label: 'Under Review', count: submissions.filter(s => s.status === 'UNDER_REVIEW').length, filter: 'UNDER_REVIEW' },
            { label: 'Accepted', count: submissions.filter(s => s.status === 'ACCEPTED').length, filter: 'ACCEPTED' },
            { label: 'Rejected', count: submissions.filter(s => s.status === 'REJECTED').length, filter: 'REJECTED' },
          ].map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setFilter(stat.filter)}
              className={`p-4 rounded-xl text-center transition ${filter === stat.filter
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'bg-white border border-gray-100 hover:shadow-md'
                }`}
            >
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className={`text-sm ${filter === stat.filter ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--primary)]">Submissions</h2>
            <span className="text-sm text-[var(--text-muted)]">{filteredSubmissions.length} articles</span>
          </div>

          {filteredSubmissions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredSubmissions.map((sub) => (
                <div key={sub.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-[var(--primary)]">{sub.title}</h3>
                        <span className={`badge ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{sub.abstract}</p>
                      <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                        <span>By: {sub.author_name || `Author #${sub.author}`}</span>
                        <span>•</span>
                        <span>{new Date(sub.submitted_at || sub.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Journal #{sub.journal}</span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/editor/submissions/${sub.id}`}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📋</div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No submissions found</h3>
              <p className="text-[var(--text-muted)]">
                {filter !== 'ALL' ? 'Try selecting a different filter' : 'No articles have been submitted yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
