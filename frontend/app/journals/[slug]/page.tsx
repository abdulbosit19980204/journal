"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function JournalDetailPage() {
    const { slug } = useParams()
    const [journal, setJournal] = useState<any>(null)
    const [issues, setIssues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const res = await api.get(`/journals/${slug}/`)
                setJournal(res.data)
                // Fetch issues for this journal
                const issuesRes = await api.get(`/issues/?journal=${res.data.id}`)
                setIssues(issuesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (slug) fetchJournal()
    }, [slug])

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!journal) return <div className="p-8 text-center">Journal not found</div>

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-4">{journal.name_en}</h1>
                    <p className="text-gray-600 mb-4">{journal.description_en}</p>
                    <div className="flex gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${journal.is_paid ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {journal.is_paid ? 'Subscription Required' : 'Open Access'}
                        </span>
                        {journal.is_paid && (
                            <span className="text-gray-500">${journal.price_per_page} per page</span>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-8">
                    <h2 className="text-xl font-bold mb-4">Published Issues</h2>
                    {issues.length > 0 ? (
                        <div className="space-y-4">
                            {issues.map((issue) => (
                                <div key={issue.id} className="border rounded p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">Volume {issue.volume}, Number {issue.number}</h3>
                                            <p className="text-sm text-gray-500">{issue.year}</p>
                                        </div>
                                        <Link href={`/journals/${slug}/issue/${issue.id}`}>
                                            <Button variant="outline" size="sm">View Issue</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No issues published yet.</p>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/dashboard/author/submit">
                        <Button>Submit Your Article</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
