import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Folder, Image, Plus, Camera, Image as ImageIcon } from 'lucide-react'
import { api } from '../services/api'

export default function AlbumCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ albumName: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.albumName.trim()) {
      toast.error('Album name is required')
      return
    }
    setLoading(true)
    try {
      const res = await api.albums.create({
        albumName: formData.albumName,
        description: formData.description,
        createdAt: new Date().toISOString(),
      })
      if (!res.ok) throw new Error('Failed to create album')
      const data = await res.json()
      toast.success('Album created!')
      navigate(`/albums/${data.albumId}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create album')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <nav className="glass-panel sticky top-0 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary-600 transition-colors">
             <ArrowLeft size={20} strokeWidth={2} /> Back to Albums
           </button>
         </div>
       </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-panel rounded-2xl p-8 shadow-xl border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Folder size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create New Album</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-foreground required-field">
                <Folder size={14} strokeWidth={2} className="mr-1.5" />
                Album Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                value={formData.albumName}
                onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                placeholder="e.g. Vacation 2024"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                <Image size={14} strokeWidth={2} className="mr-1.5" />
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-lg border input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this album..."
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} strokeWidth={2.5} />
                    Create Album
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
