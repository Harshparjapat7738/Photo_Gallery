import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AtSign, Mail, Users as UsersIcon } from 'lucide-react'
import { api } from '../services/api'

function uniqueByEmail(users) {
  const seenEmails = new Set()
  return users.filter((user) => {
    const email = user.email?.trim().toLowerCase()
    if (!email) return true
    if (seenEmails.has(email)) return false
    seenEmails.add(email)
    return true
  })
}

function ProfileAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false)
  const name = user.name || user.userName || 'User'
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-base font-semibold text-blue-700 ring-4 ring-blue-50">
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
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.users.getAll()
      if (!res.ok) throw new Error('Could not load the community. Please try again.')
      const data = await res.json()
      setUsers(Array.isArray(data) ? uniqueByEmail(data) : [])
    } catch (err) {
      setError(err.message || 'Could not load the community. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" role="status" aria-label="Loading community" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-12 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">PhotoGallery / Community</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">People behind the pictures</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              Meet the photographers and explore the albums they share.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <UsersIcon size={16} strokeWidth={2} className="text-blue-700" />
            {users.length} {users.length === 1 ? 'member' : 'members'}
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Community unavailable</h2>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              type="button"
              onClick={loadUsers}
              className="mt-5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UsersIcon size={36} strokeWidth={1.5} className="mx-auto mb-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">No members yet</h2>
            <p className="mt-1 text-sm text-slate-600">Create an account to be the first to share your albums.</p>
            <Link
              to="/register"
              className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Create account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <Link
                key={user.userId}
                to={`/users/${user.userId}/albums`}
                aria-label={`Explore albums by ${user.name || user.userName || 'this member'}`}
                className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <ProfileAvatar user={user} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
                    {user.name || 'Name not provided'}
                  </h2>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-sm text-slate-600">
                    <AtSign size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{user.userName || 'Username not provided'}</span>
                  </p>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-sm text-slate-500">
                    <Mail size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{user.email || 'Email not provided'}</span>
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700">
                  Albums
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
