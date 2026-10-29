import { Link } from 'react-router-dom'
import { Image, Users, Plus } from 'lucide-react'

export default function Navbar() {
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
        </div>
      </div>
    </nav>
  )
}
