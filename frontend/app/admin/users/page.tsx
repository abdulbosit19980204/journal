"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

export default function AdminUsersPage() {
    const { t } = useI18n()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<number | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users/")
            setUsers(res.data)
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/auth/login")
            else if (err.response?.status === 403) {
                setUsers([])
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: number, field: string, value: boolean) => {
        setProcessing(userId)
        try {
            await api.patch(`/auth/users/${userId}/`, { [field]: value })
            setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u))
        } catch (err) {
            alert(t('common.error'))
        } finally {
            setProcessing(null)
        }
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
                        {t('admin.user_management')}
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {users.length > 0 ? (
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('auth.username').toUpperCase()}</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('auth.email').toUpperCase()}</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('admin.verify_user').toUpperCase()}</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>STAFF</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('common.actions').toUpperCase()}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{user.username}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a4a4a', fontSize: '0.875rem' }}>{user.email || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: user.is_verified ? '#d1fae5' : '#fee2e2',
                                                color: user.is_verified ? '#065f46' : '#991b1b'
                                            }}>
                                                {user.is_verified ? '✓' : '✗'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: user.is_staff ? '#dbeafe' : '#f3f4f6',
                                                color: user.is_staff ? '#1e40af' : '#374151'
                                            }}>
                                                {user.is_staff ? '✓' : '✗'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {!user.is_staff ? (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_staff', true)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {t('admin.make_staff')}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_staff', false)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {t('admin.remove_staff')}
                                                    </button>
                                                )}
                                                {!user.is_verified && (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_verified', true)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {t('admin.verify_user')}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>
                            {t('admin.user_management')}
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                            {t('admin.contact_admin')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a
                                href="http://localhost:8000/admin/users/user/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Django Admin →
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
