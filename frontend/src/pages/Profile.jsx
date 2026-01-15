import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Camera, Eye, Heart, Calendar, Settings, MapPin, Grid3X3, Trash2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getMyLooks, deleteLook, getPhotoUrl } from '../api/client'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLook, setSelectedLook] = useState(null)

  useEffect(() => {
    loadLooks()
  }, [])

  const loadLooks = async () => {
    try {
      const { data } = await getMyLooks()
      setLooks(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce look ?')) return

    try {
      await deleteLook(id)
      setLooks(looks.filter((l) => l.id !== id))
      setSelectedLook(null)
      toast.success('Look supprime')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Deconnexion reussie')
  }

  const totalViews = looks.reduce((sum, l) => sum + (l.views_count || 0), 0)
  const totalLikes = looks.reduce((sum, l) => sum + (l.likes_count || 0), 0)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Link to="/settings" className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <Settings size={18} className="text-lookup-gray" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black">LOOKUP</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center"
          >
            <LogOut size={18} className="text-lookup-gray" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-3 border-lookup-mint"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white text-2xl font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-lookup-black">{user?.username}</h1>
              {user?.full_name && (
                <p className="text-lookup-gray text-sm">{user.full_name}</p>
              )}
              <div className="flex items-center gap-1 text-lookup-gray text-xs mt-1">
                <Calendar size={12} />
                <span>
                  Membre depuis {' '}
                  {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-lookup-gray-light">
            <div className="text-center">
              <p className="text-2xl font-bold text-lookup-black">{looks.length}</p>
              <p className="text-lookup-gray text-xs">Looks</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Eye size={14} className="text-lookup-mint" />
                <p className="text-2xl font-bold text-lookup-black">{totalViews}</p>
              </div>
              <p className="text-lookup-gray text-xs">Vues</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Heart size={14} className="text-pink-400" />
                <p className="text-2xl font-bold text-lookup-black">{totalLikes}</p>
              </div>
              <p className="text-lookup-gray text-xs">Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Looks Library */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Grid3X3 size={16} className="text-lookup-gray" />
          <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">Ma bibliotheque</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : looks.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {looks.map((look) => (
              <div
                key={look.id}
                className="relative aspect-[3/4] group cursor-pointer"
                onClick={() => setSelectedLook(selectedLook?.id === look.id ? null : look)}
              >
                <img
                  src={getPhotoUrl(look.photo_url)}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Always visible overlay - Instagram Reels style */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg">
                  {/* Date at top */}
                  <div className="absolute top-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {formatDate(look.look_date)}
                  </div>

                  {/* Stats at bottom */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Eye size={12} />
                        <span className="font-medium">{look.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Heart size={12} />
                        <span className="font-medium">{look.likes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete button - show on selection */}
                {selectedLook?.id === look.id && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <button
                      onClick={(e) => handleDelete(look.id, e)}
                      className="p-3 bg-red-500 rounded-full text-white shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <Camera size={28} className="text-lookup-mint" />
            </div>
            <p className="text-lookup-black font-medium">Aucun look enregistre</p>
            <p className="text-lookup-gray text-sm mt-1">
              Publie ton premier look du jour !
            </p>
            <Link
              to="/add-look"
              className="inline-block mt-4 bg-lookup-mint text-white font-medium py-2.5 px-6 rounded-full text-sm"
            >
              Ajouter un look
            </Link>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="px-4 pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-red-500 font-medium py-3 rounded-full border border-red-200 hover:bg-red-50 transition shadow-sm"
        >
          <LogOut size={18} />
          <span>Deconnexion</span>
        </button>
      </div>
    </div>
  )
}
