import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, User as UserIcon, Lock, AlertCircle, Image, Upload } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    password: '',
  })
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.userName.trim()) newErrors.userName = 'User Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only .png, .jpg, .jpeg, .webp allowed for profile picture')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture too large (max 5MB)')
      return
    }
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  const openProfilePicker = () => {
    fileInputRef.current.click()
  }

  const removeProfile = () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview)
    setProfileFile(null)
    setProfilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const formDataPayload = new FormData()
    formDataPayload.append('name', formData.name)
    formDataPayload.append('userName', formData.userName)
    formDataPayload.append('email', formData.email)
    formDataPayload.append('password', formData.password)
    if (profileFile) formDataPayload.append('profilePicture', profileFile)

    try {
      const res = await api.users.register(formDataPayload)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Registration failed')
      }
      const data = await res.json()
      toast.success('Account created successfully!')
      login(data)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join PhotoGallery and start organizing your memories</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-foreground required-field">
              <UserIcon size={14} strokeWidth={2} className="mr-1.5" />
              Full Name
            </label>
            <input
              type="text"
              required
              className={`w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                fieldError('name') ? 'border-destructive focus:ring-destructive' : ''
              }`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              aria-invalid={!!fieldError('name')}
            />
            {fieldError('name') && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} strokeWidth={2} /> {fieldError('name')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-foreground required-field">
              <UserIcon size={14} strokeWidth={2} className="mr-1.5" />
              User Name
            </label>
            <input
              type="text"
              required
              className={`w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                fieldError('userName') ? 'border-destructive focus:ring-destructive' : ''
              }`}
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              placeholder="Choose a username"
              aria-invalid={!!fieldError('userName')}
            />
            {fieldError('userName') && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} strokeWidth={2} /> {fieldError('userName')}
              </p>
            )}
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              <Image size={14} strokeWidth={2} className="mr-1.5" />
              Profile Picture (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".png,.jpg,.jpeg,.webp"
              className="sr-only"
              onChange={handleProfileChange}
            />
            <div className="relative group">
              <button
                type="button"
                onClick={openProfilePicker}
                className={`flex flex-col items-center justify-center w-full h-48 rounded-full border-2 border-dashed ${
                  profilePreview ? 'border-primary-500 bg-primary-50' : 'border-border text-muted-foreground hover:border-primary-600 hover:text-primary-600 hover:bg-secondary transition-colors'
                }`}
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <>
                    <Upload size={24} strokeWidth={2.5} className="mb-2 opacity-50" />
                    <span className="text-sm">Upload profile picture</span>
                  </>
                )}
              </button>
              {profilePreview && (
                <button
                  type="button"
                  onClick={removeProfile}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove profile picture"
                >
                  <AlertCircle size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
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
                Creating...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
