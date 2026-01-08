"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "./api"
import { useRouter } from "next/navigation"

interface User {
    id: number
    username: string
    first_name: string
    last_name: string
    is_staff: boolean
    is_superuser: boolean
    is_finance_admin: boolean
    is_expert: boolean
    profile_picture: string | null
    balance: string
    subscription: {
        id: number
        plan_id: number
        plan_name: string
        start_date: string
        end_date: string
        articles_used_this_month: number
        is_active: boolean
    } | null
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (tokens: { access: string; refresh: string }) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem("accessToken")
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const res = await api.get("/auth/me/")
            setUser(res.data)
        } catch (err) {
            console.error("Failed to fetch user:", err)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const login = async (tokens: { access: string; refresh: string }) => {
        localStorage.setItem("accessToken", tokens.access)
        localStorage.setItem("refreshToken", tokens.refresh)
        await fetchUser()
    }

    const logout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setUser(null)
        router.push("/")
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
