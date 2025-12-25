"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl } from "@/lib/utils"
import { toast } from "sonner"
import Swal from "sweetalert2"

export default function AdminBillingPage() {
    const { t } = useI18n()
    const [receipts, setReceipts] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'receipts' | 'users'>('receipts')
    const [filter, setFilter] = useState("PENDING")
    const [processing, setProcessing] = useState<number | null>(null)

    const fetchData = async () => {
        try {
            const [receiptsRes, statsRes, usersRes] = await Promise.all([
                api.get("/admin-receipts/"),
                api.get("/admin-receipts/stats/"),
                api.get("/admin-receipts/users_list/")
            ])
            setReceipts(receiptsRes.data)
            setStats(statsRes.data)
            setUsers(usersRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        const { value: notes, isDismissed } = await Swal.fire({
            title: `${action.toUpperCase()} Action`,
            input: 'text',
            inputLabel: `Enter ${action} notes (optional):`,
            inputPlaceholder: 'Type your notes here...',
            showCancelButton: true,
            confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1)
        })

        if (isDismissed) return

        setProcessing(id)
        try {
            await api.post(`/admin-receipts/${id}/${action}/`, { admin_notes: notes || "" })
            toast.success(`Receipt ${action}ed successfully`)
            await fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Action failed")
        } finally {
            setProcessing(null)
        }
    }

    const handleAdjustBalance = async (userId: number) => {
        const { value: amount, isDismissed } = await Swal.fire({
            title: 'Adjust User Balance',
            input: 'number',
            inputLabel: 'Enter amount to add (use negative for deduction):',
            inputPlaceholder: '0.00',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
        })

        if (isDismissed || amount === null || isNaN(parseFloat(amount))) return

        try {
            await api.post("/admin-receipts/adjust-balance/", { user_id: userId, amount: parseFloat(amount) })
            toast.success("Balance adjusted successfully!")
            await fetchData()
        } catch (err: any) {
            toast.error("Adjustment failed")
        }
    }

    const filteredReceipts = filter === "ALL" ? receipts : receipts.filter(r => r.status === filter)

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" /></div>

    return (
        <main style={{ padding: '2rem 0', background: '#f9fafb', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Financial Management</h1>
                        <p style={{ color: '#6b7280' }}>Manage payment receipts and user account balances</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Total Revenue (Approved)</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>${stats?.total_approved || '0.00'}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Pending Verification</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706' }}>${stats?.total_pending || '0.00'}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>Total Platform Users</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>{users.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => setTab('receipts')}
                        style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === 'receipts' ? '3px solid #111827' : '3px solid transparent', color: tab === 'receipts' ? '#111827' : '#6b7280' }}
                    >
                        Verification Requests ({receipts.filter(r => r.status === 'PENDING').length})
                    </button>
                    <button 
                        onClick={() => setTab('users')}
                        style={{ padding: '1rem 0.5rem', fontWeight: 600, fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === 'users' ? '3px solid #111827' : '3px solid transparent', color: tab === 'users' ? '#111827' : '#6b7280' }}
                    >
                        User Balances
                    </button>
                </div>

                <div className="card" style={{ padding: '0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {tab === 'receipts' ? (
                        <>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                                <h3 style={{ fontWeight: 600, color: '#374151' }}>Payment Receipts</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setFilter(s)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                                background: filter === s ? '#111827' : 'white',
                                                color: filter === s ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', textAlign: 'left', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>User</th>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Amount</th>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Status</th>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Date</th>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Proof</th>
                                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReceipts.map((r) => (
                                            <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <div style={{ fontWeight: 600, color: '#111827' }}>{r.username}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#111827', fontSize: '1rem' }}>${r.amount}</td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        background: r.status === 'APPROVED' ? '#d1fae5' : r.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                                                        color: r.status === 'APPROVED' ? '#065f46' : r.status === 'REJECTED' ? '#991b1b' : '#92400e'
                                                    }}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <a href={resolveMediaUrl(r.receipt_image)} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                                                        📄 View Proof
                                                    </a>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    {r.status === 'PENDING' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button 
                                                                disabled={processing === r.id}
                                                                onClick={() => handleAction(r.id, 'approve')}
                                                                style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                disabled={processing === r.id}
                                                                onClick={() => handleAction(r.id, 'reject')}
                                                                style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                            {r.admin_notes && <div style={{ marginBottom: '0.25rem', fontStyle: 'italic' }}>"{r.admin_notes}"</div>}
                                                            <div style={{ opacity: 0.7 }}>Decided: {new Date(r.processed_at).toLocaleDateString()}</div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', background: '#fff' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', textAlign: 'left', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>User</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Email</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Role</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Balance</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#111827' }}>{u.username}</td>
                                            <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>{u.email}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: u.is_staff ? '#7c3aed' : '#6b7280', fontWeight: u.is_staff ? 600 : 400 }}>
                                                    {u.is_staff ? 'Staff' : 'Author'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#111827', fontSize: '1rem' }}>${u.balance}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <button 
                                                    onClick={() => handleAdjustBalance(u.id)}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                                >
                                                    Adjust Balance
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
