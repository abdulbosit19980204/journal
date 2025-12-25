"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function AdminArticlesPage() {
  const { t, tStatus, locale } = useI18n()
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [articlesRes, journalsRes] = await Promise.all([
        api.get("/submissions/"),
        api.get("/journals/")
      ])
      setArticles(articlesRes.data)
      setJournals(journalsRes.data)
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    setProcessing(id)
    try {
      await api.patch(`/submissions/${id}/`, { status: newStatus })
      setArticles(articles.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } catch (err) {
      alert(t('admin.status_updated'))
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirm_delete'))) return
    setProcessing(id)
    try {
      await api.delete(`/submissions/${id}/`)
      setArticles(articles.filter(a => a.id !== id))
    } catch (err) {
      alert(t('common.error'))
    } finally {
      setProcessing(null)
    }
  }

  const filteredArticles = filter === 'ALL'
    ? articles
    : articles.filter(a => a.status === filter)

  const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#374151' },
    SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
    UNDER_REVIEW: { bg: '#e0e7ff', text: '#3730a3' },
    ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
    REJECTED: { bg: '#fee2e2', text: '#991b1b' },
    PUBLISHED: { bg: '#fef3c7', text: '#92400e' },
    WITHDRAWN: { bg: '#f3f4f6', text: '#6b7280' },
  }

  // Filter labels with translations
  const filterLabels: Record<string, string> = {
    ALL: t('admin.filter_all'),
    SUBMITTED: tStatus('SUBMITTED'),
    UNDER_REVIEW: tStatus('UNDER_REVIEW'),
    ACCEPTED: tStatus('ACCEPTED'),
    PUBLISHED: tStatus('PUBLISHED'),
  }

  const statusCounts = {
    ALL: articles.length,
    SUBMITTED: articles.filter(a => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: articles.filter(a => a.status === 'UNDER_REVIEW').length,
    ACCEPTED: articles.filter(a => a.status === 'ACCEPTED').length,
    PUBLISHED: articles.filter(a => a.status === 'PUBLISHED').length,
  }

  // Get localized journal name
  const getJournalName = (journal: any) => {
    if (!journal) return ''
    return journal[`name_${locale}`] || journal.name_en
  }

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
  }

  return (
    <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
        <div className="container">
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← {t('admin.back_to_dashboard')}</Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
            {t('admin.article_management')}
          </h1>
          <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>{t('admin.review_articles')}</p>
        </div>
      </section>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: filter === status ? '2px solid #1e3a5f' : '1px solid #e5e5e5',
                background: filter === status ? '#1e3a5f' : 'white',
                color: filter === status ? 'white' : '#4a4a4a',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {filterLabels[status] || status} ({count})
            </button>
          ))}
        </div>

        {/* Articles Table */}
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('admin.articles')}</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('articles.by')}</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('submissions.journal')}</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('submissions.status')}</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('dashboard.date')}</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length > 0 ? filteredArticles.map((article) => {
                const journal = journals.find(j => j.id === article.journal)
                return (
                  <tr key={article.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '0.25rem' }}>{article.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: #{article.id}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#4a4a4a', fontSize: '0.875rem' }}>
                      {article.author_name || `User #${article.author}`}
                    </td>
                    <td style={{ padding: '1rem', color: '#4a4a4a', fontSize: '0.875rem' }}>
                      {getJournalName(journal) || `#${article.journal}`}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: statusColors[article.status]?.bg || '#f3f4f6',
                        color: statusColors[article.status]?.text || '#374151'
                      }}>
                        {tStatus(article.status)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(article.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link href={`/admin/articles/${article.id}`} style={{
                          padding: '0.35rem 0.75rem',
                          background: '#1e3a5f',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textDecoration: 'none'
                        }}>
                          {t('admin.action_view')}
                        </Link>

                        {article.status === 'SUBMITTED' && (
                          <button onClick={() => handleStatusChange(article.id, 'UNDER_REVIEW')} disabled={processing === article.id}
                            style={{ padding: '0.35rem 0.75rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {t('admin.action_review')}
                          </button>
                        )}

                        {['SUBMITTED', 'UNDER_REVIEW'].includes(article.status) && (
                          <>
                            <button onClick={() => handleStatusChange(article.id, 'ACCEPTED')} disabled={processing === article.id}
                              style={{ padding: '0.35rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                              {t('admin.action_accept')}
                            </button>
                            <button onClick={() => handleStatusChange(article.id, 'REJECTED')} disabled={processing === article.id}
                              style={{ padding: '0.35rem 0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                              {t('admin.action_reject')}
                            </button>
                          </>
                        )}

                        {article.status === 'ACCEPTED' && (
                          <button onClick={() => handleStatusChange(article.id, 'PUBLISHED')} disabled={processing === article.id}
                            style={{ padding: '0.35rem 0.75rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            {t('admin.action_publish')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    {t('articles.no_articles')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
