"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"

export default function AdminUsersPage() {
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
                // API might not exist, show message
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
            alert("Failed to update user")
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
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Admin</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        User Management
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {users.length > 0 ? (
                    <div className="card">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>USER</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>EMAIL</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>VERIFIED</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>STAFF</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>ACTIONS</th>
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
                                                {user.is_verified ? 'Verified' : 'Unverified'}
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
                                                {user.is_staff ? 'Staff' : 'User'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {!user.is_staff ? (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_staff', true)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Make Staff
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_staff', false)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Remove Staff
                                                    </button>
                                                )}
                                                {!user.is_verified && (
                                                    <button onClick={() => handleRoleChange(user.id, 'is_verified', true)} disabled={processing === user.id}
                                                        style={{ padding: '0.35rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        Verify
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
                            User Management
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                            User management API endpoint is not available. Please add the endpoint or use Django Admin for now.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a
                                href="http://localhost:8000/admin/users/user/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Open Django Admin → Users
                            </a>
                        </div>

                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'left' }}>
                            <h4 style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.5rem' }}>Note for Developers</h4>
                            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                To enable user management, add a UserViewSet in the backend with appropriate permissions.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
