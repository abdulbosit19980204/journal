"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/auth/register/", data)
      router.push("/auth/login?registered=true")
    } catch (err: any) {
      const msg = err.response?.data ? Object.values(err.response.data)[0] : t('auth.register_error')
      setError(Array.isArray(msg) ? msg[0] : String(msg))
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel */}
      <div style={{
        width: '50%',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)',
        color: 'white',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <span style={{ color: '#c9a227', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>AJ</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
          {t('auth.register_title')}
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6 }}>
          {t('auth.register_subtitle')}
        </p>
      </div>

      {/* Right Panel */}
      <div style={{
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#faf9f6'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              {t('auth.register_button')}
            </h2>
            <p style={{ color: '#6b7280' }}>
              {t('auth.have_account')}{" "}
              <Link href="/auth/login" style={{ color: '#1e3a5f', fontWeight: 500 }}>{t('auth.sign_in')}</Link>
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {t('auth.username')} *
              </label>
              <input {...register("username")} placeholder={t('auth.username')} autoComplete="username" style={inputStyle} />
              {errors.username && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.username.message}</p>}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {t('auth.email')} *
              </label>
              <input {...register("email")} type="email" placeholder={t('auth.email')} autoComplete="email" style={inputStyle} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                {t('auth.password')} *
              </label>
              <input {...register("password")} type="password" placeholder={t('auth.password')} autoComplete="new-password" style={inputStyle} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? t('common.loading') : t('auth.register_button')}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
            {t('footer.terms')} & {t('footer.privacy')}
          </p>
        </div>
      </div>
    </div>
  )
}
