"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export default function SubmitArticlePage() {
    const { t, locale } = useI18n()
    const router = useRouter()
    const [journals, setJournals] = useState<any[]>([])
    const [step, setStep] = useState(1)
    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm()
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState("")

    // Custom state for abstract as it is rich text
    const [abstract, setAbstract] = useState("")

    useEffect(() => {
        api.get("/journals/").then((res) => setJournals(res.data))
    }, [])

    const selectedJournal = watch("journal")

    const onSubmit = async (data: any) => {
        setError("")
        const formData = new FormData()
        formData.append("title", data.title)
        formData.append("abstract", abstract) // Use state
        formData.append("journal", data.journal)
        formData.append("language", data.language || "en")
        formData.append("keywords", data.keywords || "")
        if (file) formData.append("manuscript_file", file)

        try {
            await api.post("/submissions/", formData, { headers: { "Content-Type": "multipart/form-data" } })
            router.push("/dashboard?submitted=true")
        } catch (err: any) {
            setError(err.response?.data?.detail || t('submissions.submit_failed'))
        }
    }

    const getJournalName = (journal: any) => {
        if (!journal) return ''
        return journal[`name_${locale}`] || journal.name_en
    }

    const getJournalDescription = (journal: any) => {
        if (!journal) return ''
        return journal[`description_${locale}`] || journal.description_en || ''
    }

    const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '1rem', background: 'white' }

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            {/* Header */}
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '3rem 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{t('submissions.submit_new')}</h1>
                    <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>{t('submissions.submit_subtitle')}</p>
                </div>
            </section>

            {/* Progress */}
            <section style={{ background: 'white', borderBottom: '1px solid #e5e5e5', padding: '1rem 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        {[{ n: 1, label: t('submissions.step_journal') }, { n: 2, label: t('submissions.step_details') }, { n: 3, label: t('submissions.step_upload') }].map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: step >= s.n ? '#1e3a5f' : '#e5e5e5',
                                    color: step >= s.n ? 'white' : '#6b7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600, fontSize: '0.875rem'
                                }}>{s.n}</div>
                                <span style={{ color: step >= s.n ? '#1e3a5f' : '#6b7280', fontWeight: 500, fontSize: '0.9rem' }}>{s.label}</span>
                                {i < 2 && <div style={{ width: '40px', height: '2px', background: '#e5e5e5', marginLeft: '1rem' }} />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form */}
            <section style={{ padding: '2rem 0' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    {error && (
                        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="card" style={{ padding: '2rem' }}>

                            {step === 1 && (
                                <>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>{t('submissions.select_journal')}</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                        {journals.map((j) => (
                                            <label key={j.id} style={{
                                                display: 'block',
                                                border: selectedJournal == j.id ? '2px solid #1e3a5f' : '1px solid #e5e5e5',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                background: selectedJournal == j.id ? '#f0f7ff' : 'white',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}>
                                                <input type="radio" value={j.id} {...register("journal", { required: true })} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }} />

                                                <div style={{ height: '140px', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {j.cover_image ? (
                                                        <img src={j.cover_image} alt={getJournalName(j)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#d1d5db' }}>{getJournalName(j)?.substring(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>

                                                <div style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.25rem', lineHeight: 1.3 }}>{getJournalName(j)}</div>
                                                    <span className={`badge ${j.is_paid ? 'badge-paid' : 'badge-open'}`} style={{ fontSize: '0.75rem' }}>
                                                        {j.is_paid ? `$${j.price_per_page}/${t('submissions.page')}` : t('journals.free')}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                        <button type="button" onClick={() => selectedJournal && setStep(2)} disabled={!selectedJournal}
                                            className="btn btn-primary" style={{ opacity: selectedJournal ? 1 : 0.5 }}>
                                            {t('common.continue')} →
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>{t('submissions.article_details')}</h2>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('submissions.article_title')} *</label>
                                        <input {...register("title", { required: true })} placeholder={t('submissions.placeholder_title')} style={inputStyle} />
                                    </div>
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('submissions.abstract')} *</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={abstract}
                                            onChange={setAbstract}
                                            placeholder={t('submissions.placeholder_abstract')}
                                            style={{ background: 'white', marginBottom: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('submissions.keywords')}</label>
                                            <input {...register("keywords")} placeholder="research, science" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t('submissions.language')}</label>
                                            <select {...register("language")} style={inputStyle}>
                                                <option value="en">English</option>
                                                <option value="uz">O&apos;zbek</option>
                                                <option value="ru">Русский</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button type="button" onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>← {t('common.back')}</button>
                                        <button type="button" onClick={() => setStep(3)} className="btn btn-primary">{t('common.continue')} →</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1.5rem' }}>{t('submissions.upload_manuscript')}</h2>
                                    <div style={{
                                        border: file ? '2px dashed #059669' : '2px dashed #d1d5db',
                                        background: file ? '#f0fdf4' : '#fafafa',
                                        borderRadius: '12px', padding: '3rem', textAlign: 'center'
                                    }}>
                                        <input type="file" id="file" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
                                        <label htmlFor="file" style={{ cursor: 'pointer' }}>
                                            {file ? (
                                                <>
                                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
                                                    <div style={{ fontWeight: 600, color: '#059669' }}>{file.name}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{t('submissions.click_to_change')}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
                                                    <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{t('submissions.drop_file')}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>PDF, DOC, DOCX (Max 10MB)</div>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <button type="button" onClick={() => setStep(2)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>← {t('common.back')}</button>
                                        <button type="submit" disabled={!file || isSubmitting} className="btn btn-primary" style={{ opacity: file && !isSubmitting ? 1 : 0.5 }}>
                                            {isSubmitting ? t('submissions.submitting') : t('submissions.submit_article')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </section>
        </main>
    )
}
