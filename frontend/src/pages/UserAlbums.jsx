import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Folder, Image, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function UserAlbums() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isOwner = user?.userId === userId

  const fetchUserAlbums = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.albums.getByUser(userId)
      if (!response.ok) throw new Error('Could not load albums. Please try again.')
      const data = await response.json()
      setAlbums(Array.isArray(data) ? data : [])
    } catch (error) {
      setError(error.message || 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUserAlbums()
  }, [fetchUserAlbums])

  const handleDeleteAlbum = async (event, album) => {
    event.stopPropagation()
    if (!window.confirm(`Delete "${album.albumName}" and all its photos? This cannot be undone.`)) return

    try {
      const response = await api.albums.delete(album.albumId)
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Sign in to delete this album'
            : response.status === 403
              ? 'Only the album owner can delete this album'
              : 'Failed to delete album',
        )
      }
      setAlbums((currentAlbums) => currentAlbums.filter((item) => item.albumId !== album.albumId))
      toast.success('Album deleted')
    } catch (error) {
      toast.error(error.message || 'Failed to delete album')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" role="status" aria-label="Loading albums" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-secondary/30 pb-10 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary-600 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Back to community
        </Link>

        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600">
            <Folder size={26} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{isOwner ? 'My albums' : 'Albums'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isOwner ? 'Manage your photo albums' : 'Browse this member’s photo albums'}
            </p>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-background p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Albums unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={fetchUserAlbums}
              className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        ) : albums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <Folder size={48} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold text-foreground">No albums yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isOwner ? 'Create an album to start sharing your photos.' : 'This member has not created any albums yet.'}
            </p>
            {isOwner && (
              <button
                type="button"
                onClick={() => navigate('/albums/create')}
                className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Create album
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <article
                key={album.albumId}
                role="link"
                tabIndex={0}
                aria-label={`Open album ${album.albumName}`}
                onClick={() => navigate(`/albums/${album.albumId}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/albums/${album.albumId}`)
                  }
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/50">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary-600/50">
                      <Folder size={48} strokeWidth={1.5} />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <Image size={14} />
                    {album.photoCount || 0} photos
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(event) => handleDeleteAlbum(event, album)}
                      aria-label={`Delete ${album.albumName}`}
                      className="absolute right-3 top-3 rounded-lg bg-red-600 p-2 text-white shadow transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="truncate text-lg font-semibold text-foreground group-hover:text-primary-600">
                    {album.albumName || 'Untitled album'}
                  </h2>
                  {album.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{album.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
