"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AdminIssuesPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    journal: '', volume: 1, number: 1, year: new Date().getFullYear(), status: 'DRAFT'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [issuesRes, journalsRes] = await Promise.all([
        api.get("/issues/"),
        api.get("/journals/")
      ])
      setIssues(issuesRes.data)
      setJournals(journalsRes.data)
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.patch(`/issues/${editingId}/`, formData)
      } else {
        await api.post("/issues/", formData)
      }
      fetchData()
      resetForm()
    } catch (err) {
      alert("Failed to save issue")
    }
  }

  const handleEdit = (issue: any) => {
    setFormData({
      journal: issue.journal,
      volume: issue.volume,
      number: issue.number,
      year: issue.year,
      status: issue.status
    })
    setEditingId(issue.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this issue?")) return
    try {
      await api.delete(`/issues/${id}/`)
      fetchData()
    } catch (err) {
      alert("Failed to delete issue")
    }
  }

  const resetForm = () => {
    setFormData({ journal: '', volume: 1, number: 1, year: new Date().getFullYear(), status: 'DRAFT' })
    setEditingId(null)
    setShowForm(false)
  }

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
  }

  return (
    <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
        <div className="container">
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Admin</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
            Issue Management
          </h1>
        </div>
      </section>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>All Issues ({issues.length})</h2>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Issue</button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e3a5f' }}>
                {editingId ? 'Edit Issue' : 'Add New Issue'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Journal</label>
                  <select value={formData.journal} onChange={(e) => setFormData({ ...formData, journal: e.target.value })} required style={inputStyle}>
                    <option value="">Select Journal</option>
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.name_en}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Volume</label>
                    <input type="number" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) })} min={1} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Number</label>
                    <input type="number" value={formData.number} onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })} min={1} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Year</label>
                    <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Issue</button>
                  <button type="button" onClick={resetForm} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Issues Table */}
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>JOURNAL</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>VOLUME</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>NUMBER</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>YEAR</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>STATUS</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {issues.length > 0 ? issues.map((issue) => {
                const journal = journals.find(j => j.id === issue.journal)
                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{journal?.name_en || `#${issue.journal}`}</td>
                    <td style={{ padding: '1rem' }}>{issue.volume}</td>
                    <td style={{ padding: '1rem' }}>{issue.number}</td>
                    <td style={{ padding: '1rem' }}>{issue.year}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: issue.status === 'PUBLISHED' ? '#d1fae5' : '#f3f4f6',
                        color: issue.status === 'PUBLISHED' ? '#065f46' : '#374151'
                      }}>
                        {issue.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleEdit(issue)} style={{ color: '#1e3a5f', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                      <button onClick={() => handleDelete(issue.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No issues yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
