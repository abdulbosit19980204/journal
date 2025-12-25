"use client"

import { useEffect, useState, useRef } from "react"
import api from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { resolveMediaUrl } from "@/lib/utils"

export default function ProfileSettingsPage() {
    const { t } = useI18n()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        institution: ""
    })

    useEffect(() => {
        api.get("/auth/me/")
            .then(res => {
                setUser(res.data)
                setFormData({
                    first_name: res.data.first_name || "",
                    last_name: res.data.last_name || "",
                    bio: res.data.bio || "",
                    institution: res.data.institution || ""
                })
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const data = new FormData()
            data.append("first_name", formData.first_name)
            data.append("last_name", formData.last_name)
            data.append("bio", formData.bio)
            data.append("institution", formData.institution)

            if (fileInputRef.current?.files?.[0]) {
                data.append("profile_picture", fileInputRef.current.files[0])
            }

            const res = await api.patch("/auth/me/", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setUser(res.data)
            alert("Profile updated successfully")
        } catch (err) {
            alert("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh', padding: '4rem 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="card" style={{ padding: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                        Profile Settings
                    </h1>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Profile Picture */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: '#e5e5e5',
                                overflow: 'hidden',
                                border: '3px solid white',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                {user?.profile_picture ? (
                                    <img src={resolveMediaUrl(user.profile_picture)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#9ca3af' }}>👤</div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e3a5f' }}>Profile Picture</label>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ fontSize: '0.875rem' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e3a5f' }}>First Name</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e3a5f' }}>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e3a5f' }}>Institution</label>
                            <input
                                type="text"
                                value={formData.institution}
                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                placeholder="E.g. National University of Uzbekistan"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e3a5f' }}>Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={5}
                                placeholder="Tell us about your research interests and background..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600 }}
                        >
                            {saving ? "Saving..." : "Save Profile Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
