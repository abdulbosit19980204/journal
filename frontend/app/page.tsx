import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '700px' }}>
            <p style={{
              color: '#c9a227',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              — Since 2020
            </p>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              fontFamily: "'Playfair Display', serif"
            }}>
              Publish Your Research<br />
              <span style={{ color: '#c9a227' }}>With Excellence</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              opacity: 0.9,
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Join thousands of researchers from Central Asia and beyond.
              Submit your manuscripts to our peer-reviewed journals and
              reach a global academic audience.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                Submit Your Article
              </Link>
              <Link href="/journals" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                Browse Journals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'white', padding: '3rem 0', borderBottom: '1px solid #e5e5e5' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { value: "500+", label: "Published Articles" },
              { value: "50+", label: "Expert Reviewers" },
              { value: "15", label: "Active Journals" },
              { value: "30+", label: "Countries" },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '1rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e3a5f' }}>{stat.value}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Journals */}
      <section style={{ padding: '5rem 0', background: '#faf9f6' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
              <span style={{ color: '#c9a227' }}>◆</span>
              <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
            </div>
            <h2 style={{ fontSize: '2.5rem', color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              Featured Journals
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              Explore our curated collection of peer-reviewed academic journals
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { name: "Medical Sciences Review", field: "Medicine & Health", articles: 120, color: "#dc2626" },
              { name: "Technology & Innovation", field: "Engineering & IT", articles: 85, color: "#2563eb" },
              { name: "Social Sciences Quarterly", field: "Humanities", articles: 95, color: "#059669" },
            ].map((journal, i) => (
              <div key={i} className="card">
                <div style={{ height: '4px', background: journal.color }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{journal.field}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                    {journal.name}
                  </h3>
                  <p style={{ color: '#4a4a4a', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                    Peer-reviewed journal focusing on cutting-edge research and academic discourse.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e5e5' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{journal.articles} Articles</span>
                    <Link href="/journals" style={{ color: '#1e3a5f', fontWeight: 500, fontSize: '0.875rem' }}>
                      View Journal →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/journals" className="btn btn-primary">
              View All Journals
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              How It Works
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Simple steps to publish your research</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { step: "01", title: "Create Account", desc: "Sign up and complete your researcher profile" },
              { step: "02", title: "Submit Article", desc: "Upload your manuscript with metadata" },
              { step: "03", title: "Peer Review", desc: "Expert reviewers evaluate your work" },
              { step: "04", title: "Get Published", desc: "Approved articles go live in our journals" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
            Ready to Share Your Research?
          </h2>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join our community of researchers and make your work accessible to the world.
          </p>
          <Link href="/auth/register" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Start Publishing Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e3a5f', color: 'white', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c9a227',
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  AJ
                </div>
                <span style={{ fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>American Journal</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: '0.875rem', lineHeight: 1.6 }}>
                Excellence in academic publishing since 2020.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Journals", "Pricing", "Submit Article", "For Reviewers"] },
              { title: "Resources", links: ["Author Guidelines", "Ethics Policy", "FAQ", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Copyright"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {col.links.map((link, j) => (
                    <li key={j} style={{ marginBottom: '0.5rem' }}>
                      <a href="#" style={{ opacity: 0.7, fontSize: '0.875rem', transition: 'opacity 0.2s' }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.875rem' }}>
            © 2024 American Journal Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
