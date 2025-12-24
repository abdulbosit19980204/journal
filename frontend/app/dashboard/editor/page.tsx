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
    api.get("/submissions/")
      .then(res => setSubmissions(res.data))
      .catch(err => err.response?.status === 401 && router.push("/auth/login"))
      .finally(() => setLoading(false))
  }, [router])

  const filtered = filter === 'ALL' ? submissions : submissions.filter(s => s.status === filter)

  const statusColors: Record<string, { bg: string; text: string }> = {
    SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
    UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
    ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b' },
  }

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
  }

  return (
    <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Editor Dashboard</h1>
          <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>Review and manage article submissions</p>
        </div>
      </section>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All', count: submissions.length },
            { key: 'SUBMITTED', label: 'Submitted', count: submissions.filter(s => s.status === 'SUBMITTED').length },
            { key: 'UNDER_REVIEW', label: 'In Review', count: submissions.filter(s => s.status === 'UNDER_REVIEW').length },
            { key: 'ACCEPTED', label: 'Accepted', count: submissions.filter(s => s.status === 'ACCEPTED').length },
            { key: 'REJECTED', label: 'Rejected', count: submissions.filter(s => s.status === 'REJECTED').length },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                background: filter === f.key ? '#1e3a5f' : 'white',
                color: filter === f.key ? 'white' : '#4a4a4a',
                boxShadow: filter === f.key ? '0 4px 12px rgba(30,58,95,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Submissions */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>Submissions</h2>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{filtered.length} articles</span>
          </div>

          {filtered.length > 0 ? (
            <div>
              {filtered.map((sub) => (
                <div key={sub.id} style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, color: '#1e3a5f' }}>{sub.title}</h3>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: statusColors[sub.status]?.bg || '#f3f4f6',
                        color: statusColors[sub.status]?.text || '#374151'
                      }}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ color: '#4a4a4a', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {sub.abstract?.substring(0, 150)}...
                    </p>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      By Author #{sub.author} • {new Date(sub.submitted_at || sub.created_at).toLocaleDateString()} • Journal #{sub.journal}
                    </div>
                  </div>
                  <Link href={`/dashboard/editor/submissions/${sub.id}`} className="btn btn-primary" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: '#6b7280' }}>{filter === 'ALL' ? 'No submissions yet' : 'No submissions with this status'}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
