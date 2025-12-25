"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl } from "@/lib/utils"

export default function PublicProfilePage() {
    const { t, locale } = useI18n()
    const { id } = useParams()
    const [profile, setProfile] = useState<any>(null)
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        const fetchAll = async () => {
            try {
                // Fetch public profile
                const profileRes = await api.get(`/auth/public/profiles/${id}/`)
                setProfile(profileRes.data)

                // Fetch their published articles
                const articlesRes = await api.get(`/submissions/?author=${id}&status=PUBLISHED`)
                setArticles(articlesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchAll()
    }, [id])

    if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

    if (!profile) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h2 style={{ color: '#1e3a5f', marginBottom: '1rem' }}>Profile not found</h2>
            <Link href="/articles" className="btn btn-primary">Back to Articles</Link>
        </div>
    )

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh', padding: '4rem 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Left Side: Profile Info */}
                    <aside className="card" style={{ padding: '2rem', textAlign: 'center', position: 'sticky', top: '2rem' }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            margin: '0 auto 1.5rem',
                            overflow: 'hidden',
                            border: '4px solid white',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                            {profile.profile_picture ? (
                                <img src={resolveMediaUrl(profile.profile_picture)} alt={profile.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#cbd5e1' }}>👤</div>
                            )}
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                            {profile.first_name} {profile.last_name}
                        </h1>
                        {profile.institution && (
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                                🏫 {profile.institution}
                            </p>
                        )}

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                About the Author
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#4a4a4a', lineHeight: 1.6 }}>
                                {profile.bio || "No biography provided."}
                            </p>
                        </div>
                    </aside>

                    {/* Right Side: Publications */}
                    <section>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                            Published Research ({articles.length})
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {articles.length > 0 ? (
                                articles.map(article => (
                                    <div key={article.id} className="card" style={{ padding: '2rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem' }}>
                                            <Link href={`/articles/${article.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {article.title}
                                            </Link>
                                        </h3>
                                        <p style={{
                                            color: '#64748b',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.6,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: '1rem'
                                        }}>
                                            {article.abstract?.replace(/<[^>]+>/g, '')}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                            <span style={{ color: '#c9a227', fontWeight: 600 }}>
                                                {article.journal_name}
                                            </span>
                                            <span style={{ color: '#9ca3af' }}>
                                                {new Date(article.updated_at).toLocaleDateString(locale)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#6b7280', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
                                    No published articles found for this author yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
