"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/token/", data)
      localStorage.setItem("accessToken", res.data.access)
      localStorage.setItem("refreshToken", res.data.refresh)
      router.push("/dashboard")
    } catch (err: any) {
      console.error(err)
      setError(t('auth.login_error'))
    }
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
          {t('auth.login_title')}
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6 }}>
          {t('auth.login_subtitle')}
        </p>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#faf9f6'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
              {t('auth.login_button')}
            </h2>
            <p style={{ color: '#6b7280' }}>
              {t('auth.no_account')}{" "}
              <Link href="/auth/register" style={{ color: '#1e3a5f', fontWeight: 500 }}>{t('auth.sign_up')}</Link>
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
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', marginBottom: '0.5rem' }}>
                {t('auth.username')}
              </label>
              <input
                {...register("username")}
                type="text"
                autoComplete="username"
                className="input"
                placeholder={t('auth.username')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              {errors.username && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.username.message}</p>}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', marginBottom: '0.5rem' }}>
                {t('auth.password')}
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder={t('auth.password')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
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
                marginTop: '0.5rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? `${t('common.loading')}` : t('auth.login_button')}
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
