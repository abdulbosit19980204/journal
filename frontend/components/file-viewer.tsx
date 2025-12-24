"use client"

import { useState } from "react"

interface FileViewerProps {
    fileUrl: string
    fileName?: string
}

export default function FileViewer({ fileUrl, fileName = 'document' }: FileViewerProps) {
    const [viewMode, setViewMode] = useState<'embed' | 'download'>('embed')

    // Determine file type
    const getFileType = () => {
        const url = fileUrl.toLowerCase()
        if (url.endsWith('.pdf')) return 'pdf'
        if (url.endsWith('.doc') || url.endsWith('.docx')) return 'word'
        return 'other'
    }

    const fileType = getFileType()
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8000${fileUrl}`

    // Google Docs Viewer for Word files (works with public URLs only in production)
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`

    // Office Online Viewer (alternative)
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`

    return (
        <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                background: 'white',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: fileType === 'pdf' ? '#dc2626' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 700
                    }}>
                        {fileType === 'pdf' ? 'PDF' : 'DOC'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, color: '#1a1a1a' }}>{fileName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>{fileType} Document</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {fileType === 'pdf' && (
                        <button
                            onClick={() => setViewMode(viewMode === 'embed' ? 'download' : 'embed')}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {viewMode === 'embed' ? '📥 Download View' : '👁️ Embed View'}
                        </button>
                    )}
                    <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #1e3a5f',
                            color: '#1e3a5f',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        Open in New Tab
                    </a>
                    <a
                        href={fullUrl}
                        download
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#1e3a5f',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        Download
                    </a>
                </div>
            </div>

            {/* Viewer */}
            <div style={{ minHeight: '500px' }}>
                {fileType === 'pdf' ? (
                    viewMode === 'embed' ? (
                        <iframe
                            src={fullUrl}
                            style={{ width: '100%', height: '600px', border: 'none' }}
                            title="PDF Viewer"
                        />
                    ) : (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>PDF Document</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Click the buttons above to view or download</p>
                            <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                Open PDF
                            </a>
                        </div>
                    )
                ) : fileType === 'word' ? (
                    <div style={{ padding: '2rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '8px',
                            padding: '3rem',
                            textAlign: 'center',
                            border: '1px solid #e5e5e5'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                            <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>Word Document</h3>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                Word documents cannot be previewed directly in the browser. Please download the file to view it.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <a
                                    href={fullUrl}
                                    download
                                    className="btn btn-primary"
                                >
                                    📥 Download Word File
                                </a>
                                <a
                                    href={fullUrl}
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
                                    Open in New Tab
                                </a>
                            </div>

                            {/* Alternative: Google Docs Viewer (only works with publicly accessible URLs) */}
                            <details style={{ marginTop: '2rem', textAlign: 'left' }}>
                                <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.875rem' }}>
                                    Try online preview (may not work with local files)
                                </summary>
                                <div style={{ marginTop: '1rem' }}>
                                    <iframe
                                        src={googleDocsUrl}
                                        style={{ width: '100%', height: '500px', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                                        title="Document Preview"
                                    />
                                </div>
                            </details>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📎</div>
                        <h3 style={{ fontWeight: 600, color: '#1e3a5f', marginBottom: '0.5rem' }}>File Attachment</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Download the file to view its contents</p>
                        <a href={fullUrl} download className="btn btn-primary">Download File</a>
                    </div>
                )}
            </div>
        </div>
    )
}
