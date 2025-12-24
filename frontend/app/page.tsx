"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"

export default function Home() {
  const [stats, setStats] = useState({ articles: 0, journals: 0, reviewers: 0, countries: 0 })
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [journalsRes, submissionsRes] = await Promise.all([
          api.get("/journals/").catch(() => ({ data: [] })),
          api.get("/submissions/?status=PUBLISHED").catch(() => ({ data: [] }))
        ])

        setJournals(journalsRes.data.slice(0, 3))
        setStats({
          articles: submissionsRes.data.length,
          journals: journalsRes.data.length,
          reviewers: Math.max(10, journalsRes.data.length * 3), // Estimate
          countries: Math.max(5, Math.floor(submissionsRes.data.length / 2)) // Estimate
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '6rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30L30 0z\' fill=\'%23ffffff\' fill-opacity=\'0.03\'/%3E%3C/svg%3E")',
          opacity: 0.5
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '1px', background: '#c9a227' }} />
            <span style={{ color: '#c9a227', fontSize: '1.5rem' }}>◆</span>
            <div style={{ width: '80px', height: '1px', background: '#c9a227' }} />
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1rem', fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
            American Journal Platform
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
            Advancing knowledge through peer-reviewed academic publishing
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/dashboard/author/submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              Submit Article
            </Link>
            <Link href="/journals" style={{
              padding: '1rem 2rem',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 500
            }}>
              Browse Journals
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { value: stats.articles, suffix: '', label: 'Published Articles', icon: '📄' },
              { value: stats.reviewers, suffix: '+', label: 'Expert Reviewers', icon: '👨‍🔬' },
              { value: stats.journals, suffix: '', label: 'Active Journals', icon: '📚' },
              { value: stats.countries, suffix: '+', label: 'Countries', icon: '🌍' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>
                  {loading ? '...' : `${stat.value}${stat.suffix}`}
                </div>
                <div style={{ color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Journals */}
      <section style={{ background: '#faf9f6', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              Featured Journals
            </h2>
            <p style={{ color: '#6b7280' }}>Explore our most popular publications</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {journals.length > 0 ? journals.map((journal, i) => {
              const colors = ['#dc2626', '#2563eb', '#059669']
              return (
                <div key={journal.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '4px', background: colors[i % colors.length] }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: colors[i % colors.length],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      marginBottom: '1rem'
                    }}>
                      {journal.name_en?.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>
                      {journal.name_en}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {journal.description_en?.substring(0, 100) || 'Peer-reviewed academic journal...'}...
                    </p>
                    <Link href={`/journals/${journal.slug}`} style={{ color: '#1e3a5f', fontWeight: 500, fontSize: '0.875rem' }}>
                      Learn More →
                    </Link>
                  </div>
                </div>
              )
            }) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                {loading ? 'Loading journals...' : 'No journals available yet. Check back soon!'}
              </div>
            )}
          </div>

          {journals.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/journals" className="btn btn-primary">View All Journals</Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              How It Works
            </h2>
            <p style={{ color: '#6b7280' }}>Simple steps to publish your research</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { step: '1', title: 'Submit', desc: 'Upload your manuscript', icon: '📤' },
              { step: '2', title: 'Review', desc: 'Peer-review process', icon: '🔍' },
              { step: '3', title: 'Revise', desc: 'Address feedback', icon: '✏️' },
              { step: '4', title: 'Publish', desc: 'Get published', icon: '🎉' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
            Ready to Publish?
          </h2>
          <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join thousands of researchers who trust American Journal Platform
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ background: '#c9a227', color: '#1e3a5f' }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: 'white', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#1e3a5f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#c9a227', fontWeight: 700 }}>AJ</span>
                </div>
                <span style={{ fontWeight: 600 }}>American Journal</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Advancing academic research through quality peer-reviewed publications.
              </p>
            </div>

            {[
              { title: 'Platform', links: [{ label: 'Journals', href: '/journals' }, { label: 'Submit', href: '/dashboard/author/submit' }, { label: 'Pricing', href: '/pricing' }] },
              { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Contact', href: '#' }, { label: 'Careers', href: '#' }] },
              { title: 'Legal', links: [{ label: 'Terms', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'License', href: '#' }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{col.title}</h4>
                {col.links.map((link, j) => (
                  <Link key={j} href={link.href} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} American Journal Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
