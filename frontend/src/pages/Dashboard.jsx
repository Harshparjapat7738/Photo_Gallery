import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Folder, Plus, Image, User, Trash2, Edit3, Search, Album } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [newAlbumDesc, setNewAlbumDesc] = useState('')

  useEffect(() => {
    loadAlbums()
  }, [user])

  const loadAlbums = async () => {
    try {
      const res = await api.albums.getByUser(user.userId || user.name)
      const data = await res.json()
      setAlbums(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    if (!newAlbumName.trim()) return
    try {
      const res = await api.albums.create({
        albumName: newAlbumName,
        description: newAlbumDesc,
        userId: user.userId || user.name,
        createdAt: new Date().toISOString(),
      })
      if (!res.ok) throw new Error('Failed to create album')
      const data = await res.json()
      setAlbums([...albums, data])
      setNewAlbumName('')
      setNewAlbumDesc('')
      toast.success('Album created!')
    } catch (err) {
      toast.error(err.message || 'Failed to create album')
    }
  }

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm('Delete this album and all its photos?')) return
    try {
      const response = await api.albums.delete(id)
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Sign in to delete this album'
            : response.status === 403
              ? 'Only the album owner can delete this album'
              : 'Failed to delete album',
        )
      }
      setAlbums((currentAlbums) => currentAlbums.filter((album) => album.albumId !== id))
      toast.success('Album deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete album')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Could not sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <nav className="glass-panel sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Folder size={24} strokeWidth={2} className="text-primary-600" />
            <span>Photo<span className="text-primary-600">Gallery</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user?.name || user?.userName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Albums</h1>
            <p className="text-muted-foreground">Organize your memories into collections</p>
          </div>
          <button
            onClick={() => navigate('/albums/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary/25"
          >
            <Plus size={18} strokeWidth={2.5} /> New Album
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={18} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search albums..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-border">
            <Folder size={64} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No albums yet</h3>
            <p className="text-muted-foreground mb-6">Create your first album to start organizing photos</p>
            <button
              onClick={() => navigate('/albums/create')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Create First Album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div
                key={album.albumId}
                className="card-hover group glass-panel rounded-2xl overflow-hidden border cursor-pointer"
                onClick={() => navigate(`/albums/${album.albumId}`)}
              >
                <div className="aspect-video bg-secondary/50 relative overflow-hidden">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.albumName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Folder size={48} strokeWidth={2} className="text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Image size={14} strokeWidth={2} className="text-white" />
                      {album.photoCount || 0} photos
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/40 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                    {album.albumName.length > 20 ? album.albumName.slice(0, 17) + '...' : album.albumName}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary-600 transition-colors">
                    {album.albumName}
                  </h3>
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{album.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={12} strokeWidth={2} />
                      {album.userId || 'User'}
                    </span>
                    <span>{new Date(album.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="px-5 pb-4 flex justify-end gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/albums/${album.albumId}/edit`) }}
                    className="p-2 text-muted-foreground hover:text-primary-600 transition-colors"
                  >
                    <Edit3 size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.albumId) }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
