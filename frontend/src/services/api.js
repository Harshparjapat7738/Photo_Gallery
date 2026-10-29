const DEFAULT_API_BASE = 'https://photo-gallery-2-j186.onrender.com'
const configuredApiBase = import.meta.env.VITE_API_BASE?.trim()
const isLocalApiBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiBase || '')
const isVercelFrontend = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

const shouldUseRenderApi = !configuredApiBase || (isLocalApiBase && (import.meta.env.PROD || isVercelFrontend))
export const API_BASE = (shouldUseRenderApi ? DEFAULT_API_BASE : configuredApiBase).replace(/\/+$/, '')

export const api = {
  users: {
    getAll: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users`),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users/${id}`),
  },
  albums: {
    getAll: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album`),
    getByUser: (userId) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/user/${userId}`),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/${id}`),
  },
  photos: {
    getByAlbum: (albumId) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/album/${albumId}`),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/${id}`),
  },
}
