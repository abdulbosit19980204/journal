"use client"

import { useEffect, useState, useRef } from "react"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { resolveMediaUrl } from "@/lib/utils"
import { toast } from "sonner"

export default function BillingBalancePage() {
    const { t, locale } = useI18n()
    const { user, refreshUser } = useAuth()
    const [config, setConfig] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, transRes] = await Promise.all([
                    api.get("/billing/config/"),
                    api.get("/billing/transactions/")
                ])
                setConfig(configRes.data)
                setTransactions(transRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fileInputRef.current?.files?.[0] || !amount) {
            toast.error("Please fill all fields")
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("amount", amount)
            formData.append("receipt_image", fileInputRef.current.files[0])

            await api.post("/receipts/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success(t('billing.receipt_success'))
            setAmount("")
            if (fileInputRef.current) fileInputRef.current.value = ""

            // Refresh transaction history
            const res = await api.get("/billing/transactions/")
            setTransactions(res.data)
        } catch (err) {
            toast.error("Failed to upload receipt")
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" /></div>

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>
                        {t('billing.title')}
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem' }}>
                    {/* Left: Balance & Card Info */}
                    <div>
                        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>{t('billing.balance')}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>${user?.balance || '0.00'}</div>
                        </div>

                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>{t('billing.card_info')}</h3>

                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e5e5', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('billing.bank_name')}</div>
                                <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{config?.bank_name}</div>

                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('billing.card_number')}</div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.25rem',
                                    letterSpacing: '1px',
                                    marginBottom: '0.75rem',
                                    color: '#1e3a5f',
                                    fontFamily: 'monospace'
                                }}>
                                    {config?.card_number?.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()}
                                </div>

                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('billing.card_holder')}</div>
                                <div style={{ fontWeight: 600 }}>{config?.card_holder}</div>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6, background: '#fffbeb', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                                <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>{t('billing.instructions')}</strong>
                                {config?.[`instructions_${locale}`] || config?.instructions_en}
                            </div>
                        </div>

                        {/* Current Subscription Status */}
                        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', borderLeft: '4px solid #10b981' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem' }}>{t('billing.current_subscription')}</h3>
                            {user?.subscription && user.subscription.is_active ? (
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>
                                        {user.subscription.plan_name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                        <div style={{ marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#6b7280' }}>{t('billing.valid_from')}:</span> {new Date(user.subscription.start_date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US')}
                                        </div>
                                        <div>
                                            <span style={{ color: '#6b7280' }}>{t('billing.valid_to')}:</span> {new Date(user.subscription.end_date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                    {t('billing.no_subscription')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Upload & History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{t('billing.top_up')}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>{t('billing.top_up_desc')}</p>

                            <form onSubmit={handleUpload}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('billing.amount')} ($)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('billing.receipt_file')}</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        style={{ width: '100%', fontSize: '0.875rem' }}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%' }}>
                                    {uploading ? t('common.loading') : t('billing.submit_receipt')}
                                </button>
                            </form>
                        </div>

                        <div className="card">
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e3a5f' }}>{t('billing.my_receipts')}</h3>
                            </div>
                            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '600px' }}>
                                {transactions.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#6b7280' }}>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t('billing.transaction_id')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t('billing.date')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t('billing.transaction_type')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t('billing.status')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{t('billing.description')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>{t('billing.amount')}</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'center' }}>Proof</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map((tr) => (
                                                <tr key={tr.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b7280' }}>{tr.id}</td>
                                                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                                                        {new Date(tr.created_at).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US')}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            padding: '0.15rem 0.4rem',
                                                            borderRadius: '4px',
                                                            background: tr.type === 'TOP_UP' ? '#dcfce7' : tr.type === 'SUBSCRIPTION' ? '#fee2e2' : '#fef3c7',
                                                            color: tr.type === 'TOP_UP' ? '#166534' : tr.type === 'SUBSCRIPTION' ? '#991b1b' : '#92400e',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {tr.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            padding: '0.15rem 0.4rem',
                                                            borderRadius: '4px',
                                                            background: tr.status === 'COMPLETED' ? '#dcfce7' : tr.status === 'PENDING' ? '#e0f2fe' : '#fee2e2',
                                                            color: tr.status === 'COMPLETED' ? '#166534' : tr.status === 'PENDING' ? '#075985' : '#991b1b',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {t(`billing.status_${tr.status.toLowerCase()}`)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', color: '#4b5563', maxWidth: '250px' }}>{tr.description}</td>
                                                    <td style={{
                                                        padding: '0.75rem 1rem',
                                                        textAlign: 'right',
                                                        fontWeight: 700,
                                                        fontSize: '0.875rem',
                                                        color: parseFloat(tr.amount) >= 0 ? '#059669' : '#dc2626'
                                                    }}>
                                                        {parseFloat(tr.amount) >= 0 ? '+' : ''}{tr.amount}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        {tr.receipt_image && (
                                                            <a
                                                                href={resolveMediaUrl(tr.receipt_image)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    color: '#6366f1',
                                                                    textDecoration: 'none',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: 600,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.2rem'
                                                                }}
                                                            >
                                                                📄 Proof
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>
                                                        {tr.admin_note && (
                                                            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                                                <div style={{ fontStyle: 'italic', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tr.admin_note}>"{tr.admin_note}"</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No history yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
