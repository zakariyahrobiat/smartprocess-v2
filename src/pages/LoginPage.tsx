import { useAuth } from '../context/auth-provider'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function LoginPage() {
  const { currentUser, loading, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && currentUser) navigate('/', { replace: true })
  }, [currentUser, loading, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm text-center shadow-xl">

        {/* SK Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sk-teal">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="5" fill="#fff" />
              <g stroke="#F47B20" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
                <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
                <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
                <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
                <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
              </g>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-foreground font-bold text-base leading-tight">Sun King</span>
            <span className="text-muted-foreground text-xs leading-tight">SmartProcess v2</span>
          </div>
        </div>

        <h1 className="text-foreground text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground text-sm mb-8">Sign in with your Sun King Google account</p>

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium rounded-lg px-4 py-3 hover:bg-gray-50 border border-border transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="mt-6 text-xs text-muted-foreground">
          Restricted to @sunking.com accounts
        </p>
      </div>
    </div>
  )
}
