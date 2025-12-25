"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { stripHtml } from "@/lib/utils"

export default function Home() {
  const { t, locale } = useI18n()
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
          reviewers: Math.max(10, journalsRes.data.length * 3),
          countries: Math.max(5, Math.floor(submissionsRes.data.length / 2))
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get localized content based on current locale
  const getLocalizedField = (obj: any, field: string) => {
    const localizedKey = `${field}_${locale}`
    return obj[localizedKey] || obj[`${field}_en`] || ''
  }

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
            {t('home.title')}
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
            {t('home.subtitle')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/dashboard/author/submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              {t('home.submit_article')}
            </Link>
            <Link href="/journals" style={{
              padding: '1rem 2rem',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 500
            }}>
              {t('home.browse_journals')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { value: stats.articles, suffix: '', label: t('home.published_articles'), icon: '📄' },
              { value: stats.reviewers, suffix: '+', label: t('home.expert_reviewers'), icon: '👨‍🔬' },
              { value: stats.journals, suffix: '', label: t('home.active_journals'), icon: '📚' },
              { value: stats.countries, suffix: '+', label: t('home.countries'), icon: '🌍' },
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
              {t('home.featured_journals')}
            </h2>
            <p style={{ color: '#6b7280' }}>{t('home.explore_publications')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {journals.length > 0 ? journals.map((journal, i) => {
              const journalName = getLocalizedField(journal, 'name')
              const journalDesc = getLocalizedField(journal, 'description')

              return (
                <div key={journal.id} className="card" style={{
                  position: 'relative',
                  height: '400px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  borderRadius: '20px',
                  background: '#1e3a5f'
                }}>
                  {/* Full Cover Image */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0
                  }}>
                    {journal.cover_image ? (
                      <img
                        src={journal.cover_image}
                        alt={journalName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '6rem',
                        fontWeight: 900,
                        fontFamily: "'Playfair Display', serif"
                      }}>
                        {journalName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Dark Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.9) 100%)',
                    zIndex: 1
                  }} />

                  {/* Content Overlay */}
                  <div style={{
                    position: 'relative',
                    zIndex: 2,
                    height: '100%',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    color: 'white'
                  }}>
                    {/* Badge / Price */}
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                    }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}>
                        {journal.is_paid ? (
                          <span>${journal.price_per_page}</span>
                        ) : (
                          <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.8rem' }}>$10</span>
                            <span style={{ color: '#10b981' }}>$0</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      fontFamily: "'Playfair Display', serif",
                      lineHeight: 1.2,
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                      {journalName}
                    </h3>

                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '0.95rem',
                      marginBottom: '1.5rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {stripHtml(journalDesc) || t('journals.no_journals')}
                    </p>

                    <Link href={`/journals/${journal.slug}`} style={{
                      background: '#c9a227',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'background 0.2s ease',
                      display: 'inline-block'
                    }}>
                      {t('home.learn_more')}
                    </Link>
                  </div>
                </div>
              )
            }) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                {loading ? t('home.loading_journals') : t('home.no_journals')}
              </div>
            )}
          </div>

          {journals.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/journals" className="btn btn-primary">{t('home.view_all_journals')}</Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              {t('home.how_it_works')}
            </h2>
            <p style={{ color: '#6b7280' }}>{t('home.simple_steps')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { step: '1', title: t('home.submit'), desc: t('home.upload_manuscript'), icon: '📤' },
              { step: '2', title: t('home.review'), desc: t('home.peer_review_process'), icon: '🔍' },
              { step: '3', title: t('home.revise'), desc: t('home.address_feedback'), icon: '✏️' },
              { step: '4', title: t('home.publish'), desc: t('home.get_published'), icon: '🎉' },
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
            {t('home.ready_to_publish')}
          </h2>
          <p style={{ opacity: 0.9, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            {t('home.join_researchers')}
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ background: '#c9a227', color: '#1e3a5f' }}>
            {t('home.create_account')}
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
                  <span style={{ color: '#c9a227', fontWeight: 700 }}>CAJ</span>
                </div>
                <span style={{ fontWeight: 600 }}>Central Asian Journal</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {t('footer.description')}
              </p>
            </div>

            {[
              { title: t('footer.platform'), links: [{ label: t('nav.journals'), href: '/journals' }, { label: t('home.submit_article'), href: '/dashboard/author/submit' }, { label: t('nav.pricing'), href: '/pricing' }] },
              { title: t('footer.company'), links: [{ label: t('footer.about'), href: '#' }, { label: t('footer.contact'), href: '#' }, { label: t('footer.careers'), href: '#' }] },
              { title: t('footer.legal'), links: [{ label: t('footer.terms'), href: '#' }, { label: t('footer.privacy'), href: '#' }, { label: t('footer.license'), href: '#' }] },
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
            © {new Date().getFullYear()} Central Asian Journal Platform. {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </main>
  )
}
