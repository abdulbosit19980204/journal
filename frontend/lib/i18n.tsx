"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Import translations
import en from '@/locales/en.json'
import uz from '@/locales/uz.json'
import ru from '@/locales/ru.json'

type Locale = 'en' | 'uz' | 'ru'

interface TranslationContext {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
    tStatus: (status: string) => string
    translations: typeof en
}

const translations = { en, uz, ru }

// Status mapping for translation keys
const statusMapping: Record<string, string> = {
    'DRAFT': 'submissions.status_draft',
    'SUBMITTED': 'submissions.status_submitted',
    'UNDER_REVIEW': 'submissions.status_under_review',
    'ACCEPTED': 'submissions.status_accepted',
    'REJECTED': 'submissions.status_rejected',
    'PUBLISHED': 'submissions.status_published',
    'WITHDRAWN': 'submissions.status_withdrawn',
    // Billing statuses
    'PAID': 'billing.paid',
    'PENDING': 'billing.pending',
    'CANCELLED': 'billing.cancelled',
    // Issue statuses
    'OPEN': 'journals.open_access',
}

const I18nContext = createContext<TranslationContext | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en')

    useEffect(() => {
        // Load saved locale from localStorage
        const saved = localStorage.getItem('locale') as Locale
        if (saved && translations[saved]) {
            setLocaleState(saved)
        }
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('locale', newLocale)
    }

    // Get nested translation by dot notation key
    const t = (key: string): string => {
        const keys = key.split('.')
        let value: any = translations[locale]

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                // Fallback to English
                value = translations['en']
                for (const fk of keys) {
                    if (value && typeof value === 'object' && fk in value) {
                        value = value[fk]
                    } else {
                        return key // Return key if not found
                    }
                }
                break
            }
        }

        return typeof value === 'string' ? value : key
    }

    // Translate status codes (DRAFT, SUBMITTED, etc.)
    const tStatus = (status: string): string => {
        const key = statusMapping[status.toUpperCase()]
        if (key) {
            return t(key)
        }
        // Fallback: capitalize first letter, lowercase rest
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, tStatus, translations: translations[locale] }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    return context
}

// Language Selector Component
export function LanguageSelector() {
    const { locale, setLocale } = useI18n()

    const languages = [
        { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
        { code: 'uz' as Locale, name: "O'zbekcha", flag: '🇺🇿' },
        { code: 'ru' as Locale, name: 'Русский', flag: '🇷🇺' },
    ]

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        border: locale === lang.code ? '2px solid #c9a227' : '1px solid rgba(255,255,255,0.3)',
                        background: locale === lang.code ? 'rgba(201,162,39,0.2)' : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        minWidth: '45px',
                        justifyContent: 'center'
                    }}
                    title={lang.name}
                >
                    <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                    <span style={{ textTransform: 'uppercase' }}>{lang.code}</span>
                </button>
            ))}
        </div>
    )
}
