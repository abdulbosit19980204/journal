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
      if (err.response?.status === 401) {
        router.push("/auth/login")
      } else {
        alert("Subscription failed. Please try again.")
      }
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading plans...</p>
        </div>
      </div>
    )
  }

  const planFeatures: Record<string, string[]> = {
    "basic-researcher": [
      "1 article per month",
      "Standard review process",
      "Email support",
      "Access to all journals"
    ],
    "professional-author": [
      "5 articles per month",
      "Priority review process",
      "Priority email support",
      "AI writing assistant",
      "Analytics dashboard"
    ],
    "institution-unlimited": [
      "Unlimited articles",
      "Express review (48h)",
      "Dedicated account manager",
      "Advanced AI tools",
      "Custom branding",
      "API access"
    ]
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="ornament mb-4">
              <span className="text-[var(--secondary)]">◆</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              Choose the plan that fits your publishing needs. Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const isPopular = plan.slug === 'professional-author'
              const features = planFeatures[plan.slug] || []
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative bg-white rounded-2xl shadow-xl overflow-hidden card-hover ${isPopular ? 'ring-2 ring-[var(--secondary)] scale-105' : 'border border-gray-100'}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-[var(--secondary)] text-[var(--primary)] text-xs font-bold px-4 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                    <h3 className="text-xl font-bold text-[var(--primary)] mb-2">{plan.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-[var(--primary)]">
                        ${parseFloat(plan.price).toFixed(0)}
                      </span>
                      <span className="text-[var(--text-muted)]">/month</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="text-[var(--success)] mt-0.5">✓</span>
                          <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                      className={`w-full py-3 rounded-lg font-medium transition ${
                        isPopular 
                          ? 'bg-[var(--secondary)] text-[var(--primary)] hover:brightness-110' 
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
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
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--primary)] text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              { q: "Can I change my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and local payment methods like Click and Payme." },
              { q: "Is there a refund policy?", a: "We offer a 30-day money-back guarantee for all paid plans. No questions asked." },
              { q: "Do unused articles roll over?", a: "Article limits reset monthly. Unused articles do not roll over to the next month." },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-[var(--primary)] mb-2">{faq.q}</h3>
                <p className="text-[var(--text-muted)] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl opacity-80 mb-8">Our team is here to help you choose the right plan.</p>
          <a href="mailto:support@americanjournal.org" className="btn-secondary">
            Contact Sales
          </a>
        </div>
      </section>
    </div>
  )
}
