import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Image, Trash2, Edit3, Loader2, Upload, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ACCEPTED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

export default function AlbumDetail() {
  const { albumId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [album, setAlbum] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([]) // { file, preview, id }
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)
  const closeViewerRef = useRef(null)
  const isOwner = isAuthenticated && user?.userId === album?.userId
  const activePhoto = activePhotoIndex === null ? null : photos[activePhotoIndex]

  useEffect(() => {
    loadAlbum()
    loadPhotos()
  }, [albumId])

  useEffect(() => {
    if (activePhotoIndex === null) return undefined

    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeViewerRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActivePhotoIndex(null)
      if (event.key === 'ArrowLeft') {
        setActivePhotoIndex((index) => (index - 1 + photos.length) % photos.length)
      }
      if (event.key === 'ArrowRight') {
        setActivePhotoIndex((index) => (index + 1) % photos.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [activePhotoIndex, photos.length])

  const loadAlbum = async () => {
    try {
      const res = await api.albums.getById(albumId)
      const data = await res.json()
      setAlbum(data)
    } catch (err) {
      toast.error('Failed to load album')
    }
  }

  const loadPhotos = async () => {
    try {
      const res = await api.photos.getByAlbum(albumId)
      const data = await res.json()
      setPhotos(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    const errors = []

    files.forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
        errors.push(`${file.name} - only .png, .jpg, .webp allowed`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} - file too large (max 5MB)`)
        return
      }
      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      })
    })

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err))
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])
    e.target.value = ''
  }

  const removeSelectedFile = (id) => {
    const file = selectedFiles.find((f) => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.preview)
    }
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select images to upload')
      return
    }

    setUploading(true)
    const formData = new FormData()
    selectedFiles.forEach((item) => {
      formData.append('files', item.file)
    })

    try {
      const res = await api.photos.upload(albumId, formData)
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Sign in to upload photos'
            : res.status === 403
              ? 'Only the album owner can upload photos'
              : 'Upload failed',
        )
      }
      const data = await res.json()
      setPhotos((prev) => [...prev, ...data])
      setSelectedFiles([])
      toast.success(`${data.length} image(s) uploaded!`)
    } catch (err) {
      toast.error(err.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      const response = await api.photos.delete(id)
      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Sign in to delete photos'
            : response.status === 403
              ? 'Only the album owner can delete photos'
              : 'Failed to delete photo',
        )
      }
      setPhotos((prev) => prev.filter((p) => p.imageId !== id))
      toast.success('Photo deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete photo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={album?.userId ? `/users/${album.userId}/albums` : '/'}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-primary-600 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft size={18} strokeWidth={2} />
              Back to albums
            </Link>
            <span className="text-muted-foreground" aria-hidden="true">/</span>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Community
            </Link>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => navigate(`/albums/${albumId}/edit`)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Edit3 size={16} strokeWidth={2} /> Edit Album
            </button>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{album?.albumName || 'Loading...'}</h1>
          {album?.description && (
            <p className="text-muted-foreground">{album.description}</p>
          )}
        </div>

        {isOwner && (
        <div className="glass-panel rounded-2xl p-6 mb-8 shadow-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Upload size={20} strokeWidth={2.5} /> Add Photos
            </h2>
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
              .png · .jpg · .webp
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select multiple images
            </label>
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp"
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-sm file:font-semibold file:bg-primary-600 file:text-white
                hover:file:bg-primary-700 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Preview ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedFiles.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                    <img
                      src={item.preview}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1">
                      <button
                        onClick={() => removeSelectedFile(item.id)}
                        className="p-1.5 bg-red-500/90 text-white rounded hover:bg-red-600 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                      <p className="text-white text-xs truncate">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} strokeWidth={2.5} />
                      Upload {selectedFiles.length} Image(s)
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
                    setSelectedFiles([])
                  }}
                  className="px-4 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Photos Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Photos ({photos.length})
          </h2>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-border">
            <Image size={64} strokeWidth={1.5} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No photos yet</h3>
            <p className="text-muted-foreground">Upload your first images to this album</p>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                key={photo.imageId}
                className="card-hover group rounded-xl overflow-hidden border border-border relative"
              >
                <button
                  type="button"
                  onClick={() => setActivePhotoIndex(index)}
                  aria-label={`View ${photo.imageTitle || 'photo'} full screen`}
                  className="relative block aspect-square w-full overflow-hidden bg-secondary/50 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-600"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.imageTitle}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white font-medium text-sm mb-1">
                      {photo.imageTitle || 'Untitled'}
                    </h3>
                    {photo.imageDescription && (
                      <p className="text-white/80 text-xs line-clamp-1">
                        {photo.imageDescription}
                      </p>
                    )}
                  </div>
                  <span className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Maximize2 size={16} aria-hidden="true" />
                  </span>
                </button>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOwner && <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePhoto(photo.imageId)
                    }}
                    className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                    aria-label={`Delete ${photo.imageTitle || 'photo'}`}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${activePhoto.imageTitle || 'Photo'} full-screen viewer`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setActivePhotoIndex(null)
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium sm:text-base">
                {activePhoto.imageTitle || 'Untitled'}
              </p>
              {activePhoto.imageDescription && (
                <p className="truncate text-xs text-white/60 sm:text-sm">{activePhoto.imageDescription}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs tabular-nums text-white/70 sm:text-sm">
                {activePhotoIndex + 1} / {photos.length}
              </span>
              <button
                ref={closeViewerRef}
                type="button"
                onClick={() => setActivePhotoIndex(null)}
                aria-label="Close full-screen image"
                className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-5 sm:px-20">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setActivePhotoIndex((index) => (index - 1 + photos.length) % photos.length)}
                aria-label="Previous image"
                className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.imageTitle || 'Album photo'}
              className="max-h-full max-w-full object-contain"
            />
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setActivePhotoIndex((index) => (index + 1) % photos.length)}
                aria-label="Next image"
                className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
          <p className="shrink-0 pb-3 text-center text-xs text-white/50">
            Use ← → to browse · Esc to close
          </p>
        </div>
      )}
    </div>
  )
}
