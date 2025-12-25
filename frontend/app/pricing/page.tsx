"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function PricingPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<number | null>(null)

  useEffect(() => {
    api.get("/plans/").then(res => setPlans(res.data)).finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      router.push("/auth/login?next=/pricing")
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (parseFloat(user.balance) < parseFloat(plan?.price || "0")) {
      alert(t('billing.insufficient_balance'))
      router.push("/profile/billing")
      return
    }

    setSubscribing(planId)
    try {
      await api.post("/billing/subscribe/", { plan_id: planId })
      await refreshUser()
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.response?.data?.error || t('billing.payment_failed'))
    } finally {
      setSubscribing(null)
    }
  }

  // Localized features
  const features: Record<string, Record<string, string[]>> = {
    "basic-researcher": {
      en: ["1 article/month", "Standard review", "Email support"],
      uz: ["Oyiga 1 ta maqola", "Standart tekshiruv", "Email yordam"],
      ru: ["1 статья/месяц", "Стандартная проверка", "Email поддержка"]
    },
    "professional-author": {
      en: ["5 articles/month", "Priority review", "AI assistant", "Analytics"],
      uz: ["Oyiga 5 ta maqola", "Tezkor tekshiruv", "AI yordamchi", "Analitika"],
      ru: ["5 статей/месяц", "Приоритетная проверка", "AI помощник", "Аналитика"]
    },
    "institution-unlimited": {
      en: ["Unlimited articles", "Express review (48h)", "Dedicated manager", "API access"],
      uz: ["Cheksiz maqolalar", "Tezkor tekshiruv (48s)", "Shaxsiy menejer", "API kirish"],
      ru: ["Безлимитные статьи", "Экспресс проверка (48ч)", "Персональный менеджер", "API доступ"]
    }
  }

  // Localized FAQ
  const faqData: Record<string, { q: string; a: string }[]> = {
    en: [
      { q: "Can I change my plan later?", a: "Yes, upgrade or downgrade anytime. Changes take effect immediately." },
      { q: "What payment methods do you accept?", a: "Credit cards, PayPal, Click, and Payme." },
      { q: "Is there a refund policy?", a: "30-day money-back guarantee for all paid plans." },
    ],
    uz: [
      { q: "Keyinroq tarifni o'zgartira olamanmi?", a: "Ha, istalgan vaqtda yangilash yoki pasaytirish mumkin. O'zgarishlar darhol kuchga kiradi." },
      { q: "Qaysi to'lov usullarini qabul qilasiz?", a: "Kredit kartalar, PayPal, Click va Payme." },
      { q: "Pulni qaytarish siyosati bormi?", a: "Barcha pullik tariflar uchun 30 kunlik kafolat." },
    ],
    ru: [
      { q: "Могу ли я изменить тариф позже?", a: "Да, можете повысить или понизить в любое время. Изменения вступают в силу немедленно." },
      { q: "Какие способы оплаты вы принимаете?", a: "Кредитные карты, PayPal, Click и Payme." },
      { q: "Есть ли политика возврата?", a: "30-дневная гарантия возврата для всех платных тарифов." },
    ]
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
            {t('pricing.title')}
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '2rem' }}>
            {t('pricing.subtitle')}
          </p>

          {user && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '50px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div>
                <span style={{ fontSize: '0.9rem', opacity: 0.8, marginRight: '0.5rem' }}>{t('billing.balance')}:</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${user.balance}</span>
              </div>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
              <Link href="/profile/billing" style={{ color: '#c9a227', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                + {t('billing.top_up')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ padding: '4rem 0', background: '#faf9f6', marginTop: '-2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {plans.map((plan, i) => {
              const isPopular = plan.slug === 'professional-author'
              const planFeatures = features[plan.slug]?.[locale] || features[plan.slug]?.en || []

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
                      {t('pricing.popular')}
                    </div>
                  )}

                  <div style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>{plan.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{plan.description}</p>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '3rem', fontWeight: 700, color: '#1e3a5f' }}>
                        ${parseFloat(plan.price).toFixed(0)}
                      </span>
                      <span style={{ color: '#6b7280' }}>{t('pricing.per_month')}</span>
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
                      {subscribing === plan.id ? t('common.loading') : t('pricing.subscribe')}
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
            FAQ
          </h2>

          {(faqData[locale] || faqData.en).map((faq, i) => (
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
