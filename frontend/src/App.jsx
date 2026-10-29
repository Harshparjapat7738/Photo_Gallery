import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AlbumCreate from './pages/AlbumCreate'
import AlbumDetail from './pages/AlbumDetail'
import Users from './pages/Users'
import UserAlbums from './pages/UserAlbums'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Navbar />
        <Toaster position="top-right" />
        <Outlet />
      </>
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
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'albums/create', element: <AlbumCreate /> },
      { path: 'albums/:albumId', element: <AlbumDetail /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
