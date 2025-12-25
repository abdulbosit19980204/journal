import Link from 'next/link'

export default function NotFound() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#faf9f6',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '500px' }}>
                <div style={{
                    fontSize: '6rem',
                    fontWeight: 700,
                    color: '#1e3a5f',
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: 1,
                    marginBottom: '1rem'
                }}>
                    404
                </div>
                <h1 style={{
                    fontSize: '2rem',
                    color: '#1a1a1a',
                    marginBottom: '1.5rem',
                    fontFamily: "'Playfair Display', serif"
                }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: '#6b7280',
                    fontSize: '1.125rem',
                    marginBottom: '2.5rem',
                    lineHeight: 1.6
                }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="btn btn-primary"
                    style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}
                >
                    Return to Homepage
                </Link>
            </div>
        </main>
    )
}
