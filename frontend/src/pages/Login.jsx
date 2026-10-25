import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, User as UserIcon, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await api.users.login(formData.email, formData.password)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Invalid email or password')
      }
      const data = await res.json()
      login(data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field) => errors[field]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary/50 px-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <UserIcon size={32} strokeWidth={2.5} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your photo galleries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-foreground required-field">
              <Mail size={14} strokeWidth={2} className="mr-1.5" />
              Email Address
            </label>
            <input
              type="email"
              required
              className={`w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                fieldError('email') ? 'border-destructive focus:ring-destructive' : ''
              }`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              aria-invalid={!!fieldError('email')}
            />
            {fieldError('email') && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} strokeWidth={2} /> {fieldError('email')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-foreground required-field">
              <Lock size={14} strokeWidth={2} className="mr-1.5" />
              Password
            </label>
            <input
              type="password"
              required
              className={`w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                fieldError('password') ? 'border-destructive focus:ring-destructive' : ''
              }`}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              aria-invalid={!!fieldError('password')}
            />
            {fieldError('password') && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} strokeWidth={2} /> {fieldError('password')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
