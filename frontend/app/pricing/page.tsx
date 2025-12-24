"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<number | null>(null)

  useEffect(() => {
    api.get("/plans/").then(res => setPlans(res.data)).finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: number) => {
    setSubscribing(planId)
    try {
      await api.post("/billing/subscribe/", { plan_id: planId })
      router.push("/dashboard")
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/auth/login")
      else alert("Subscription failed")
    } finally {
      setSubscribing(null)
    }
  }

  const features: Record<string, string[]> = {
    "basic-researcher": ["1 article/month", "Standard review", "Email support"],
    "professional-author": ["5 articles/month", "Priority review", "AI assistant", "Analytics"],
    "institution-unlimited": ["Unlimited articles", "Express review (48h)", "Dedicated manager", "API access"]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
            <span style={{ color: '#c9a227' }}>◆</span>
            <div style={{ width: '60px', height: '1px', background: '#c9a227' }} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.8 }}>
            Choose the plan that fits your publishing needs
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ padding: '4rem 0', background: '#faf9f6', marginTop: '-2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {plans.map((plan, i) => {
              const isPopular = plan.slug === 'professional-author'
              const planFeatures = features[plan.slug] || []

              return (
                <div key={plan.id} className="card" style={{
                  position: 'relative',
                  transform: isPopular ? 'scale(1.05)' : 'none',
                  boxShadow: isPopular ? '0 20px 50px rgba(30, 58, 95, 0.2)' : undefined,
                  border: isPopular ? '2px solid #c9a227' : '1px solid #e5e5e5'
                }}>
                  {isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#c9a227',
                      color: '#1e3a5f',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0 8px 0 8px'
                    }}>
                      POPULAR
                    </div>
                  )}

                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{plan.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{plan.description}</p>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 700, color: '#1e3a5f' }}>
                        ${parseFloat(plan.price).toFixed(0)}
                      </span>
                      <span style={{ color: '#6b7280' }}>/mo</span>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                      {planFeatures.map((f, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                          <span style={{ color: '#059669' }}>✓</span>
                          <span style={{ color: '#4a4a4a' }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: subscribing === plan.id ? 'not-allowed' : 'pointer',
                        opacity: subscribing === plan.id ? 0.7 : 1,
                        background: isPopular ? '#c9a227' : '#1e3a5f',
                        color: isPopular ? '#1e3a5f' : 'white',
                        border: 'none'
                      }}
                    >
                      {subscribing === plan.id ? 'Processing...' : plan.price === '0.00' ? 'Get Started Free' : 'Subscribe Now'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', textAlign: 'center', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
            Frequently Asked Questions
          </h2>

          {[
            { q: "Can I change my plan later?", a: "Yes, upgrade or downgrade anytime. Changes take effect immediately." },
            { q: "What payment methods do you accept?", a: "Credit cards, PayPal, Click, and Payme." },
            { q: "Is there a refund policy?", a: "30-day money-back guarantee for all paid plans." },
          ].map((faq, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{faq.q}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
