import { useEffect, useState } from 'react'
import { LogOut, Camera, Trash2, MapPin, Calendar, Eye, Heart } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getMyLooks, deleteLook, getPhotoUrl } from '../api/client'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce look ?')) return

    try {
      await deleteLook(id)
      setLooks(looks.filter((l) => l.id !== id))
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

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-8"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </div>
          <span className="text-lg font-bold text-lookup-black">LOOKUP</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 bg-lookup-cream rounded-full flex items-center justify-center"
        >
          <LogOut size={16} className="text-lookup-gray" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-4 border-lookup-mint-light"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lookup-mint to-pink-300 flex items-center justify-center text-white text-3xl font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-lookup-black">{user?.username}</h1>
            {user?.full_name && (
              <p className="text-lookup-gray">{user.full_name}</p>
            )}
            <div className="flex items-center gap-1 text-lookup-gray text-sm mt-1">
              <Calendar size={14} />
              <span>
                Membre depuis{' '}
                {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-lookup-cream rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-lookup-black">{looks.length}</p>
              <p className="text-lookup-gray text-xs">Looks</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Eye size={16} className="text-lookup-mint" />
                <p className="text-2xl font-bold text-lookup-black">{totalViews}</p>
              </div>
              <p className="text-lookup-gray text-xs">Vues</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <Heart size={16} className="text-pink-400" />
                <p className="text-2xl font-bold text-lookup-black">{totalLikes}</p>
              </div>
              <p className="text-lookup-gray text-xs">Likes</p>
            </div>
          </div>
        </div>

        {/* My Looks */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-lookup-black mb-4">Mes looks</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : looks.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {looks.map((look) => (
                <div key={look.id} className="relative group">
                  <img
                    src={getPhotoUrl(look.photo_url)}
                    alt=""
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleDelete(look.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                    {new Date(look.look_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-lookup-mint-light rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-lookup-mint/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera size={28} className="text-lookup-mint" />
              </div>
              <p className="text-lookup-black font-medium">Aucun look enregistre</p>
              <p className="text-lookup-gray text-sm mt-1">
                Publie ton premier look !
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-medium py-3 rounded-full border border-red-200 hover:bg-red-100 transition"
        >
          <LogOut size={18} />
          <span>Deconnexion</span>
        </button>
      </div>
    </div>
  )
}
