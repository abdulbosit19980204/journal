import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="ornament justify-start mb-6">
              <span className="text-[var(--secondary)] font-serif italic">Since 2020</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Publish Your Research<br />
              <span className="text-[var(--secondary)]">With Excellence</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 font-serif leading-relaxed">
              Join thousands of researchers from Central Asia and beyond.
              Submit your manuscripts to our peer-reviewed journals and
              reach a global academic audience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register" className="btn-secondary text-lg px-8 py-4">
                Submit Your Article
              </Link>
              <Link href="/journals" className="bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition">
                Browse Journals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Published Articles" },
              { value: "50+", label: "Expert Reviewers" },
              { value: "15", label: "Active Journals" },
              { value: "30+", label: "Countries Represented" },
            ].map((stat, i) => (
              <div key={i} className="p-6">
                <div className="text-4xl font-bold text-[var(--primary)] mb-2">{stat.value}</div>
                <div className="text-[var(--text-muted)] text-sm uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Journals */}
      <section className="py-20 paper-texture">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="ornament mb-4">
              <span className="text-[var(--secondary)]">◆</span>
            </div>
            <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">Featured Journals</h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Explore our curated collection of peer-reviewed academic journals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Medical Sciences Review", field: "Medicine & Health", articles: 120, color: "#dc2626" },
              { name: "Technology & Innovation", field: "Engineering & IT", articles: 85, color: "#2563eb" },
              { name: "Social Sciences Quarterly", field: "Humanities", articles: 95, color: "#059669" },
            ].map((journal, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden card-hover border border-gray-100">
                <div className="h-3" style={{ background: journal.color }} />
                <div className="p-6">
                  <div className="text-sm text-[var(--text-muted)] mb-2">{journal.field}</div>
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-3">{journal.name}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Peer-reviewed journal focusing on cutting-edge research and academic discourse.
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-[var(--text-muted)]">{journal.articles} Articles</span>
                    <Link href="/journals" className="text-[var(--primary)] font-medium text-sm hover:underline">
                      View Journal →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/journals" className="btn-primary">
              View All Journals
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">How It Works</h2>
            <p className="text-[var(--text-secondary)]">Simple steps to publish your research</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and complete your researcher profile" },
              { step: "02", title: "Submit Article", desc: "Upload your manuscript with metadata" },
              { step: "03", title: "Peer Review", desc: "Expert reviewers evaluate your work" },
              { step: "04", title: "Get Published", desc: "Approved articles go live in our journals" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[var(--primary)] mb-2">{item.title}</h3>
                <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Share Your Research?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join our community of researchers and make your work accessible to the world.
          </p>
          <Link href="/auth/register" className="btn-secondary text-lg px-10 py-4">
            Start Publishing Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--primary)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-[var(--secondary)] font-bold font-serif">AJ</span>
                </div>
                <span className="font-bold font-serif">American Journal</span>
              </div>
              <p className="text-white/70 text-sm">
                Excellence in academic publishing since 2020.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Journals", "Pricing", "Submit Article", "For Reviewers"] },
              { title: "Resources", links: ["Author Guidelines", "Ethics Policy", "FAQ", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Copyright"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/70 hover:text-white text-sm transition">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
            © 2024 American Journal Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
