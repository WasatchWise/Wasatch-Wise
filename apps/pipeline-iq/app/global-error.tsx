'use client'

/**
 * Root-level error boundary. Renders its own html/body so the app
 * still shows a branded message if something crashes above the layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#1e3a5f', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 24, maxWidth: 400 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ opacity: 0.9, marginBottom: 24 }}>We&apos;re sorry. Please try again or visit the main page.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ padding: '10px 20px', background: '#fff', color: '#1e3a5f', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginRight: 8 }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ padding: '10px 20px', background: 'transparent', color: '#fff', border: '2px solid #fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
          >
            Groove overview
          </a>
        </div>
      </body>
    </html>
  )
}
