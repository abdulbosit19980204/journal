"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"

export default function JournalsPage() {
    const [journals, setJournals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await api.get("/journals/")
                setJournals(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchJournals()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-muted)]">Loading journals...</p>
                </div>
            </div>
        )
    }

    const journalColors = ['#dc2626', '#2563eb', '#059669', '#7c3aed', '#ea580c', '#0891b2']

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero */}
            <section className="gradient-primary text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <div className="ornament mb-4">
                            <span className="text-[var(--secondary)]">◆</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Journals</h1>
                        <p className="text-xl opacity-80 max-w-2xl mx-auto">
                            Explore our collection of peer-reviewed academic journals across various disciplines
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-white border-b border-gray-100 py-4 sticky top-[136px] z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">All Journals</button>
                            <button className="px-4 py-2 bg-gray-100 text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-gray-200 transition">Open Access</button>
                            <button className="px-4 py-2 bg-gray-100 text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-gray-200 transition">Subscription</button>
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                            Showing {journals.length} journals
                        </div>
                    </div>
                </div>
            </section>

            {/* Journals Grid */}
            <section className="py-12 paper-texture">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {journals.map((journal, i) => (
                            <article key={journal.id} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover border border-gray-100 group">
                                <div className="h-2" style={{ background: journalColors[i % journalColors.length] }} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-lg flex items-center justify-center text-white text-xl font-bold" style={{ background: journalColors[i % journalColors.length] }}>
                                            {journal.name_en?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`badge ${journal.is_paid ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                            {journal.is_paid ? 'Subscription' : 'Open Access'}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-[var(--primary)] mb-2 group-hover:text-[var(--primary-light)] transition">
                                        {journal.name_en}
                                    </h2>

                                    <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-3">
                                        {journal.description_en}
                                    </p>

                                    {journal.is_paid && (
                                        <div className="flex items-center gap-2 mb-4 text-sm">
                                            <span className="text-[var(--text-muted)]">Publication Fee:</span>
                                            <span className="font-semibold text-[var(--primary)]">${journal.price_per_page}/page</span>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <Link href={`/journals/${journal.slug}`} className="flex-1 text-center py-2 border border-[var(--primary)] text-[var(--primary)] rounded-lg text-sm font-medium hover:bg-[var(--primary)] hover:text-white transition">
                                            View Journal
                                        </Link>
                                        <Link href="/dashboard/author/submit" className="flex-1 text-center py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-light)] transition">
                                            Submit Article
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {journals.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center text-3xl">📚</div>
                            <h3 className="text-2xl font-bold text-[var(--primary)] mb-2">No Journals Found</h3>
                            <p className="text-[var(--text-muted)]">Check back later for new journals.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
