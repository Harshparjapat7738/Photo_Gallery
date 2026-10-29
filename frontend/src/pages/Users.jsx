import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Image, Loader2, Mail, MapPin, Maximize2, X } from 'lucide-react'
import { api } from '../services/api'

function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

function ProfileAvatar({ user, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = (user.name || user.userName || 'User')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700 ${className}`}>
      {user.profilePicture && !imageFailed ? (
        <img
          src={user.profilePicture}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials || 'U'
      )}
    </span>
  )
}

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedUserId = searchParams.get('userId')
  const selectedAlbumId = searchParams.get('albumId')
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [albums, setAlbums] = useState([])
  const [albumsLoading, setAlbumsLoading] = useState(false)
  const [albumsError, setAlbumsError] = useState('')
  const [albumsRetryCount, setAlbumsRetryCount] = useState(0)
  const [photos, setPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photosError, setPhotosError] = useState('')
  const [photosRetryCount, setPhotosRetryCount] = useState(0)
  const [activePhotoIndex, setActivePhotoIndex] = useState(null)

  const selectedUser = useMemo(
    () => users.find((user) => String(user.userId) === selectedUserId),
    [users, selectedUserId],
  )
  const selectedAlbum = useMemo(
    () => albums.find((album) => String(album.albumId) === selectedAlbumId),
    [albums, selectedAlbumId],
  )
  const activePhoto = activePhotoIndex === null ? null : photos[activePhotoIndex]

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError('')
    try {
      const response = await api.users.getAll()
      if (!response.ok) throw new Error('Could not load users. Please try again.')
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('The users response was not a list.')
      setUsers(data)
    } catch (error) {
      setUsersError(getErrorMessage(error, 'Could not load users. Please try again.'))
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (usersLoading) return
    if (!selectedUserId) {
      if (selectedAlbumId) setSearchParams({}, { replace: true })
      return
    }
    if (!selectedUser) {
      setSearchParams({}, { replace: true })
    }
  }, [usersLoading, selectedUser, selectedUserId, selectedAlbumId, setSearchParams])

  useEffect(() => {
    let active = true
    setAlbums([])
    setAlbumsError('')

    if (!selectedUserId || !selectedUser) {
      setAlbumsLoading(false)
      return () => {
        active = false
      }
    }

    const loadAlbums = async () => {
      setAlbumsLoading(true)
      try {
        const response = await api.albums.getByUser(selectedUserId)
        if (!response.ok) throw new Error('Could not load this user’s albums. Please try again.')
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('The albums response was not a list.')
        if (active) setAlbums(data)
      } catch (error) {
        if (active) setAlbumsError(getErrorMessage(error, 'Could not load albums. Please try again.'))
      } finally {
        if (active) setAlbumsLoading(false)
      }
    }

    loadAlbums()
    return () => {
      active = false
    }
  }, [selectedUserId, selectedUser, albumsRetryCount])

  useEffect(() => {
    let active = true
    setActivePhotoIndex(null)
    setPhotos([])
    setPhotosError('')

    if (!selectedAlbumId || !selectedUserId) {
      setPhotosLoading(false)
      return () => {
        active = false
      }
    }

    if (albumsLoading) {
      setPhotosLoading(true)
      return () => {
        active = false
      }
    }

    if (!selectedAlbum) {
      setPhotosLoading(false)
      setPhotosError('This album does not belong to the selected user or is no longer available.')
      return () => {
        active = false
      }
    }

    const loadPhotos = async () => {
      setPhotosLoading(true)
      try {
        const response = await api.photos.getByAlbum(selectedAlbumId)
        if (!response.ok) throw new Error('Could not load photos. Please try again.')
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('The photos response was not a list.')
        if (active) setPhotos(data)
      } catch (error) {
        if (active) setPhotosError(getErrorMessage(error, 'Could not load photos. Please try again.'))
      } finally {
        if (active) setPhotosLoading(false)
      }
    }

    loadPhotos()
    return () => {
      active = false
    }
  }, [selectedAlbumId, selectedUserId, selectedAlbum, albumsLoading, photosRetryCount])

  const selectUser = (user) => {
    setActivePhotoIndex(null)
    setSearchParams({ userId: String(user.userId) })
  }

  const selectAlbum = (album) => {
    setActivePhotoIndex(null)
    setSearchParams({
      userId: String(selectedUser.userId),
      albumId: String(album.albumId),
    })
  }

  const closeAlbum = () => {
    setActivePhotoIndex(null)
    if (selectedUserId) setSearchParams({ userId: selectedUserId })
    else setSearchParams({})
  }

  useEffect(() => {
    if (activePhotoIndex === null) return undefined

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
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhotoIndex, photos.length])

  return (
    <main className="flex min-h-[calc(100vh-5rem)] bg-slate-100 pt-20 text-slate-900">
      <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
        <h2 className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Users</h2>
        {usersLoading ? (
          <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading users...
          </div>
        ) : usersError ? (
          <div className="p-3 text-sm text-rose-700">
            <p>{usersError}</p>
            <button type="button" onClick={loadUsers} className="mt-2 font-semibold underline">
              Try again
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {users.map((user) => (
              <li key={user.userId}>
                <button
                  type="button"
                  onClick={() => selectUser(user)}
                  aria-current={String(user.userId) === selectedUserId ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    String(user.userId) === selectedUserId ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <ProfileAvatar user={user} className="h-10 w-10 text-sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{user.name || user.userName || 'User'}</span>
                    <span className="block truncate text-xs text-slate-500">{user.email || 'No email provided'}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
        {!selectedUserId ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-semibold">Welcome</h1>
            <p className="mt-3 text-slate-600">Pick a user from the list to browse their albums and photos.</p>
          </div>
        ) : !selectedUser ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-rose-700">
            {usersLoading ? 'Loading selected user...' : usersError || 'The selected user is unavailable.'}
          </div>
        ) : (
          <>
            <header className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar user={selectedUser} className="h-14 w-14 text-lg" />
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold">{selectedUser.name || selectedUser.userName}</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedUser.userName ? `@${selectedUser.userName}` : selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {selectedUser.email && (
                  <span className="inline-flex items-center gap-2">
                    <Mail size={15} aria-hidden="true" />
                    {selectedUser.email}
                  </span>
                )}
                {selectedUser.address?.city && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} aria-hidden="true" />
                    {selectedUser.address.city}
                  </span>
                )}
                {selectedUser.phone && <span>{selectedUser.phone}</span>}
                {selectedUser.website && <span>{selectedUser.website}</span>}
              </div>
            </header>

            <div className="mb-4 mt-7 flex items-center gap-3">
              <h2 className="text-lg font-semibold">Albums</h2>
              {!albumsLoading && !albumsError && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {albums.length}
                </span>
              )}
            </div>

            {albumsLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading albums...
              </div>
            ) : albumsError ? (
              <div className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700">
                <p>{albumsError}</p>
                <button
                  type="button"
                  onClick={() => setAlbumsRetryCount((count) => count + 1)}
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : albums.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No albums found for this user.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {albums.map((album, index) => (
                  <button
                    key={album.albumId}
                    type="button"
                    onClick={() => selectAlbum(album)}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {album.coverImage && (
                      <img src={album.coverImage} alt="" className="mb-3 aspect-[16/9] w-full rounded-lg object-cover" />
                    )}
                    <span className="block text-xs font-medium text-blue-700">Album {index + 1}</span>
                    <span className="mt-1 block font-medium">{album.albumName || 'Untitled album'}</span>
                    {album.description && (
                      <span className="mt-1 block line-clamp-2 text-sm text-slate-500">{album.description}</span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Image size={14} aria-hidden="true" />
                      {album.photoCount || 0} photos
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {selectedAlbumId && selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAlbum()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeAlbum()
          }}
        >
          <section
            className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={selectedAlbum ? `Photos in ${selectedAlbum.albumName}` : 'Album photos'}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  Photos
                  {!photosLoading && !photosError && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {photos.length}
                    </span>
                  )}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {selectedAlbum?.albumName || (albumsLoading ? 'Loading album...' : 'Album')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAlbum}
                aria-label="Close album photos"
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X size={20} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {photosLoading || albumsLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading photos...
                </div>
              ) : photosError ? (
                <div className="py-10 text-center text-sm text-rose-700">
                  <p>{photosError}</p>
                  <button
                    type="button"
                    onClick={() => setPhotosRetryCount((count) => count + 1)}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              ) : photos.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-600">No photos found in this album.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {photos.map((photo) => (
                    <figure key={photo.imageId} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setActivePhotoIndex(photos.findIndex((item) => item.imageId === photo.imageId))}
                        aria-label={`View ${photo.imageTitle || 'photo'} full screen`}
                        className="relative block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                      >
                      <img
                        src={photo.imageUrl}
                        alt={photo.imageTitle || 'Album photo'}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                        <span className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <Maximize2 size={16} aria-hidden="true" />
                        </span>
                      </button>
                      <figcaption className="truncate p-2 text-xs text-slate-600">
                        {photo.imageTitle || 'Untitled photo'}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activePhoto && (
        <div
          className="fixed inset-0 z-[110] flex flex-col bg-black/95 text-white"
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
                {activePhoto.imageTitle || 'Untitled photo'}
              </p>
              <p className="text-xs text-white/60 sm:text-sm">
                {activePhotoIndex + 1} / {photos.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              aria-label="Close full-screen image"
              className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setActivePhotoIndex((index) => (index - 1 + photos.length) % photos.length)}
                aria-label="Previous image"
                className="absolute left-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
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
                className="absolute right-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
