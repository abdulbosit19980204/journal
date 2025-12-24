"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function SubmitArticlePage() {
    const router = useRouter()
    const [journals, setJournals] = useState<any[]>([])
    const [step, setStep] = useState(1)
    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm()
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        api.get("/journals/").then((res) => setJournals(res.data))
    }, [])

    const selectedJournal = watch("journal")

    const onSubmit = async (data: any) => {
        setError("")
        const formData = new FormData()
        formData.append("title", data.title)
        formData.append("abstract", data.abstract)
        formData.append("journal", data.journal)
        formData.append("language", data.language)
        formData.append("keywords", data.keywords || "")
        if (file) {
            formData.append("manuscript_file", file)
        }

        try {
            await api.post("/submissions/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            router.push("/dashboard?submitted=true")
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.detail || "Failed to submit article. Please try again.")
        }
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <section className="gradient-primary text-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Submit Your Article</h1>
                    <p className="opacity-80">Share your research with the academic community</p>
                </div>
            </section>

            {/* Progress Steps */}
            <section className="bg-white border-b border-gray-100 py-4">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-4">
                        {[
                            { num: 1, label: "Select Journal" },
                            { num: 2, label: "Article Details" },
                            { num: 3, label: "Upload File" },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {s.num}
                                </div>
                                <span className={`text-sm ${step >= s.num ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                                    {s.label}
                                </span>
                                {i < 2 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                            {/* Step 1: Journal Selection */}
                            {step === 1 && (
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-[var(--primary)] mb-6">Select Target Journal</h2>
                                    <div className="grid gap-4">
                                        {journals.map((journal) => (
                                            <label
                                                key={journal.id}
                                                className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition ${selectedJournal == journal.id ? 'border-[var(--primary)] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={journal.id}
                                                    {...register("journal", { required: true })}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-[var(--primary)]">{journal.name_en}</div>
                                                    <div className="text-sm text-[var(--text-muted)] mt-1">{journal.description_en}</div>
                                                    <div className="flex gap-4 mt-2 text-sm">
                                                        <span className={`badge ${journal.is_paid ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                            {journal.is_paid ? `$${journal.price_per_page}/page` : 'Free'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => selectedJournal && setStep(2)}
                                            disabled={!selectedJournal}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Article Details */}
                            {step === 2 && (
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-[var(--primary)] mb-6">Article Details</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Article Title *</label>
                                            <input
                                                {...register("title", { required: true })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                placeholder="Enter your article title"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Abstract *</label>
                                            <textarea
                                                {...register("abstract", { required: true })}
                                                rows={6}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                placeholder="Provide a brief summary of your research (250-300 words recommended)"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Keywords</label>
                                                <input
                                                    {...register("keywords")}
                                                    type="text"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                    placeholder="research, science, innovation"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Language</label>
                                                <select
                                                    {...register("language")}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="uz">O'zbek</option>
                                                    <option value="ru">Русский</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-between">
                                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 rounded-lg text-[var(--text-secondary)] hover:bg-gray-50">
                                            ← Back
                                        </button>
                                        <button type="button" onClick={() => setStep(3)} className="btn-primary">
                                            Continue →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: File Upload */}
                            {step === 3 && (
                                <div className="p-8">
                                    <h2 className="text-xl font-bold text-[var(--primary)] mb-6">Upload Manuscript</h2>

                                    <div
                                        className={`border-2 border-dashed rounded-xl p-12 text-center transition ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[var(--primary)]'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            {file ? (
                                                <>
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">✓</div>
                                                    <p className="text-lg font-medium text-[var(--primary)]">{file.name}</p>
                                                    <p className="text-sm text-[var(--text-muted)] mt-1">Click to change file</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">📄</div>
                                                    <p className="text-lg font-medium text-[var(--primary)]">Drop your file here or click to browse</p>
                                                    <p className="text-sm text-[var(--text-muted)] mt-1">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div className="mt-8 flex justify-between">
                                        <button type="button" onClick={() => setStep(2)} className="px-6 py-3 border border-gray-200 rounded-lg text-[var(--text-secondary)] hover:bg-gray-50">
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!file || isSubmitting}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Article'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </form>
                </div>
            </section>
        </div>
    )
}
