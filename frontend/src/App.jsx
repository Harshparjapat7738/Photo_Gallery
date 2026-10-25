import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import AlbumCreate from './pages/AlbumCreate'
import AlbumDetail from './pages/AlbumDetail'
import Users from './pages/Users'
import UserAlbums from './pages/UserAlbums'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" role="status" aria-label="Checking sign-in" />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Navbar />
        <Toaster position="top-right" />
        <Outlet />
      </AuthProvider>
    ),
    errorElement: (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">The page you are looking for could not be found.</p>
      </div>
    ),
    children: [
      { index: true, element: <Users /> },
      { path: 'users', element: <Users /> },
      { path: 'users/:userId/albums', element: <UserAlbums /> },
      { path: 'dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'albums/create', element: <RequireAuth><AlbumCreate /></RequireAuth> },
      { path: 'albums/:albumId', element: <AlbumDetail /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
