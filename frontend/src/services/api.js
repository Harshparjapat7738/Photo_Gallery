const DEFAULT_API_BASE = 'https://photo-gallery-2-j186.onrender.com'
const configuredApiBase = import.meta.env.VITE_API_BASE?.trim()
const isLocalApiBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiBase || '')
const isVercelFrontend = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

const shouldUseRenderApi = !configuredApiBase || (isLocalApiBase && (import.meta.env.PROD || isVercelFrontend))
export const API_BASE = (shouldUseRenderApi ? DEFAULT_API_BASE : configuredApiBase).replace(/\/+$/, '')

export const api = {
  users: {
    create: (data) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
    register: (data) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users`, {
      method: 'POST',
      body: data,
      credentials: 'include',
    }),
    getAll: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users`),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users/${id}`),
    me: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users/me`, {
      credentials: 'include',
    }),
    logout: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users/logout`, {
      method: 'POST',
      credentials: 'include',
    }),
    login: (email, password) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }),
  },
  albums: {
    getAll: () => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album`),
    getByUser: (userId) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/user/${userId}`),
    create: (data) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/${id}`),
    update: (id, data) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
    delete: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/album/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
  },
  photos: {
    upload: (albumId, formData) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/album/${albumId}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }),
    getByAlbum: (albumId) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/album/${albumId}`),
    getById: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/${id}`),
    update: (id, data) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }),
    delete: (id) => fetch(`${API_BASE}/jsonplaceholder.typicode.com/photo/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
  },
}
