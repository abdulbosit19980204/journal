"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminUsersPage() {
    const router = useRouter()

    return (
        <main style={{ background: '#faf9f6', minHeight: '100vh' }}>
            <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)', color: 'white', padding: '2rem 0' }}>
                <div className="container">
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>← Back to Admin</Link>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        User Management
                    </h1>
                </div>
            </section>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>
                        User Management
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                        For full user management capabilities, please use the Django Admin panel.
                        This provides secure access to all user accounts and permissions.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <a
                            href="http://localhost:8000/admin/users/user/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            Open Django Admin → Users
                        </a>
                        <a
                            href="http://localhost:8000/admin/auth/group/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid #1e3a5f',
                                color: '#1e3a5f',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Manage Groups
                        </a>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a5f', marginBottom: '1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {[
                            { title: 'All Users', desc: 'View and edit all users', href: 'http://localhost:8000/admin/users/user/', icon: '👤' },
                            { title: 'Staff Members', desc: 'Manage editors and admins', href: 'http://localhost:8000/admin/users/user/?is_staff__exact=1', icon: '🔑' },
                            { title: 'Subscriptions', desc: 'View user subscriptions', href: 'http://localhost:8000/admin/billing/usersubscription/', icon: '💳' },
                        ].map((item, i) => (
                            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="card" style={{ padding: '1.5rem', textDecoration: 'none', display: 'block' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                                <h4 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.25rem' }}>{item.title}</h4>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{item.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
