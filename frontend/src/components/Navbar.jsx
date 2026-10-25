import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Image, Users, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Could not sign out')
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              <Image size={20} strokeWidth={2} />
            </div>
            <Link to="/" className="font-bold text-xl tracking-tight text-foreground">
              Photo<span className="text-primary-600">Gallery</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary/25"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
                >
                  <Users size={18} strokeWidth={2} />
                  <span className="hidden md:inline">Community</span>
                </Link>
                <button
                  onClick={() => navigate('/albums/create')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary/25"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="hidden md:inline">Create Album</span>
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary-600 transition-colors"
                >
                  <User size={18} strokeWidth={2} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <div className="flex items-center gap-2 pl-4">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs cursor-pointer overflow-hidden hover:scale-105 transition-transform" onClick={() => navigate('/dashboard')}>
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user?.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name || 'User')
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground hidden md:inline">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  <LogOut size={18} strokeWidth={2} />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
