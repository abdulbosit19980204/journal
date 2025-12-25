"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

// @ts-ignore
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

export default function AdminJournalsPage() {
    const router = useRouter()
    const [journals, setJournals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        name_en: '', name_uz: '', name_ru: '',
        description_en: '', description_uz: '', description_ru: '',
        slug: '', is_paid: false, price_per_page: '0'
    })

    useEffect(() => {
        fetchJournals()
    }, [])

    const fetchJournals = async () => {
        try {
            const res = await api.get("/journals/")
            setJournals(res.data)
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
                await api.patch(`/journals/${editingId}/`, formData)
            } else {
                await api.post("/journals/", formData)
            }
            fetchJournals()
            resetForm()
        } catch (err) {
            alert("Failed to save journal")
        }
    }

    const handleEdit = (journal: any) => {
        setFormData({
            name_en: journal.name_en || '',
            name_uz: journal.name_uz || '',
            name_ru: journal.name_ru || '',
            description_en: journal.description_en || '',
            description_uz: journal.description_uz || '',
            description_ru: journal.description_ru || '',
            slug: journal.slug || '',
            is_paid: journal.is_paid || false,
            price_per_page: journal.price_per_page || '0'
        })
        setEditingId(journal.id)
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this journal?")) return
        try {
            await api.delete(`/journals/${id}/`)
            fetchJournals()
        } catch (err) {
            alert("Failed to delete journal")
        }
    }

    const resetForm = () => {
        setFormData({
            name_en: '', name_uz: '', name_ru: '',
            description_en: '', description_uz: '', description_ru: '',
            slug: '', is_paid: false, price_per_page: '0'
        })
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
                        Manage Journals
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>All Journals ({journals.length})</h2>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Journal</button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e3a5f' }}>
                                {editingId ? 'Edit Journal' : 'Add New Journal'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Name (EN)</label>
                                        <input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Slug</label>
                                        <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Description (EN)</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description_en}
                                        onChange={(val) => setFormData({ ...formData, description_en: val })}
                                        style={{ background: 'white', marginBottom: '1rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Name (UZ)</label>
                                        <input value={formData.name_uz} onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Name (RU)</label>
                                        <input value={formData.name_ru} onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })} style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Description (UZ)</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description_uz}
                                            onChange={(val) => setFormData({ ...formData, description_uz: val })}
                                            style={{ background: 'white', marginBottom: '1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Description (RU)</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.description_ru}
                                            onChange={(val) => setFormData({ ...formData, description_ru: val })}
                                            style={{ background: 'white', marginBottom: '1rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} />
                                        <label style={{ fontSize: '0.875rem' }}>Paid Journal</label>
                                    </div>
                                    {formData.is_paid && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Price per Page</label>
                                            <input type="number" value={formData.price_per_page} onChange={(e) => setFormData({ ...formData, price_per_page: e.target.value })} style={inputStyle} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">Save Journal</button>
                                    <button type="button" onClick={resetForm} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Journals Table */}
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Journal</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Slug</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journals.map((journal) => (
                                <tr key={journal.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{journal.name_en}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{journal.description_en?.substring(0, 60)}...</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{journal.slug}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            background: journal.is_paid ? '#fef3c7' : '#d1fae5',
                                            color: journal.is_paid ? '#92400e' : '#065f46'
                                        }}>
                                            {journal.is_paid ? `$${journal.price_per_page}/page` : 'Free'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleEdit(journal)} style={{ color: '#1e3a5f', fontWeight: 500, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                                        <button onClick={() => handleDelete(journal.id)} style={{ color: '#dc2626', fontWeight: 500, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
