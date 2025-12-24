"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AdminPlansPage() {
    const router = useRouter()
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '', price: '0', duration_days: 30
    })

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const res = await api.get("/plans/")
            setPlans(res.data)
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
                await api.patch(`/plans/${editingId}/`, formData)
            } else {
                await api.post("/plans/", formData)
            }
            fetchPlans()
            resetForm()
        } catch (err) {
            alert("Failed to save plan")
        }
    }

    const handleEdit = (plan: any) => {
        setFormData({
            name: plan.name || '',
            slug: plan.slug || '',
            description: plan.description || '',
            price: plan.price || '0',
            duration_days: plan.duration_days || 30
        })
        setEditingId(plan.id)
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this plan?")) return
        try {
            await api.delete(`/plans/${id}/`)
            fetchPlans()
        } catch (err) {
            alert("Failed to delete")
        }
    }

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '', price: '0', duration_days: 30 })
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
                        Manage Subscription Plans
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f' }}>All Plans ({plans.length})</h2>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Plan</button>
                </div>

                {showForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e3a5f' }}>
                                {editingId ? 'Edit Plan' : 'Add New Plan'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Name</label>
                                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Slug</label>
                                    <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Price ($)</label>
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Duration (days)</label>
                                        <input type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })} style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary">Save Plan</button>
                                    <button type="button" onClick={resetForm} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {plans.map((plan) => (
                        <div key={plan.id} className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{plan.name}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{plan.description}</p>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem' }}>
                                ${parseFloat(plan.price).toFixed(0)}<span style={{ fontSize: '1rem', color: '#6b7280' }}>/mo</span>
                            </div>
                            <div style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1rem' }}>{plan.duration_days} days</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEdit(plan)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #1e3a5f', color: '#1e3a5f', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Edit</button>
                                <button onClick={() => handleDelete(plan.id)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
