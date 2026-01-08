"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"

export default function AdminUsersPage() {
    const { t } = useI18n()
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [showEditModal, setShowEditModal] = useState(false)

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

    const handleEditUser = (user: any) => {
        setEditingUser({ ...user })
        setShowEditModal(true)
    }

    const handleSaveUser = async () => {
        if (!editingUser) return

        try {
            await api.patch(`/auth/users/${editingUser.id}/`, {
                is_staff: editingUser.is_staff,
                is_superuser: editingUser.is_superuser,
                is_finance_admin: editingUser.is_finance_admin,
                is_verified: editingUser.is_verified,
                balance: editingUser.balance,
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email
            })
            setUsers(users.map(u => u.id === editingUser.id ? editingUser : u))
            setShowEditModal(false)
            toast.success("User updated successfully")
        } catch (err) {
            toast.error("Failed to update user")
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
                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('auth.username').toUpperCase()}</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{t('auth.email').toUpperCase()}</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>VERIFIED</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>STAFF</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>FINANCE</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>SUPERUSER</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>BALANCE</th>
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
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: user.is_finance_admin ? '#fef3c7' : '#f3f4f6',
                                                color: user.is_finance_admin ? '#92400e' : '#374151'
                                            }}>
                                                {user.is_finance_admin ? '💰' : '✗'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                background: user.is_superuser ? '#e0e7ff' : '#f3f4f6',
                                                color: user.is_superuser ? '#3730a3' : '#374151'
                                            }}>
                                                {user.is_superuser ? '⭐' : '✗'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#059669' }}>${user.balance || '0.00'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#1e3a5f',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Edit
                                            </button>
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
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '1.5rem' }}>
                            Edit User: {editingUser.username}
                        </h2>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Basic Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.first_name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.last_name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                    Balance ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editingUser.balance || 0}
                                    onChange={(e) => setEditingUser({ ...editingUser, balance: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>

                            {/* Permissions */}
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Permissions & Roles</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {[
                                        { key: 'is_verified', label: 'Verified User', color: '#059669' },
                                        { key: 'is_staff', label: 'Staff (Admin Access)', color: '#1e40af' },
                                        { key: 'is_finance_admin', label: 'Finance Admin', color: '#c9a227' },
                                        { key: 'is_superuser', label: 'Superuser (Full Access)', color: '#7c3aed' },
                                    ].map((perm) => (
                                        <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingUser[perm.key] || false}
                                                onChange={(e) => setEditingUser({ ...editingUser, [perm.key]: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: perm.color }}>{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveUser}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#1e3a5f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
