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
    const [receipts, setReceipts] = useState<any[]>([])
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, receiptsRes] = await Promise.all([
                    api.get("/billing/config/"),
                    api.get("/receipts/")
                ])
                setConfig(configRes.data)
                setReceipts(receiptsRes.data)
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

            // Refresh receipts list
            const res = await api.get("/receipts/")
            setReceipts(res.data)
        } catch (err) {
            toast.error("Failed to upload receipt")
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" /></div>

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh', padding: '2rem 0' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', fontFamily: "'Playfair Display', serif", marginBottom: '0.5rem' }}>
                        {t('billing.title')}
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
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
                                <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '1px', marginBottom: '0.75rem', color: '#1e3a5f' }}>{config?.card_number}</div>

                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('billing.card_holder')}</div>
                                <div style={{ fontWeight: 600 }}>{config?.card_holder}</div>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                                <strong>{t('billing.instructions')}</strong>: {config?.[`instructions_${locale}`] || config?.instructions_en}
                            </div>
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
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {receipts.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#6b7280' }}>
                                                <th style={{ padding: '0.75rem 1.5rem' }}>{t('billing.amount')}</th>
                                                <th style={{ padding: '0.75rem 1.5rem' }}>{t('billing.status')}</th>
                                                <th style={{ padding: '0.75rem 1.5rem' }}>Check</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receipts.map((r) => (
                                                <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>${r.amount}</td>
                                                    <td style={{ padding: '0.75rem 1.5rem' }}>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '4px',
                                                            background: r.status === 'APPROVED' ? '#d1fae5' : r.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6',
                                                            color: r.status === 'APPROVED' ? '#065f46' : r.status === 'REJECTED' ? '#991b1b' : '#374151'
                                                        }}>
                                                            {t(`billing.status_${r.status.toLowerCase()}`)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.5rem' }}>
                                                        <a href={resolveMediaUrl(r.receipt_image)} target="_blank" rel="noreferrer" style={{ color: '#1e3a5f' }}>View</a>
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
