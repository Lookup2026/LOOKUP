import { useEffect, useState } from 'react'
import { LogOut, Camera, Trash2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { getMyLooks, deleteLook } from '../api/client'
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

  return (
    <div className="p-4 pb-24">
      {/* Header profil */}
      <div className="flex items-center gap-4 mb-6">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-lookup-accent flex items-center justify-center text-black text-2xl font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-white">{user?.username}</h1>
          {user?.full_name && (
            <p className="text-gray-400">{user.full_name}</p>
          )}
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-lookup-gray rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{looks.length}</p>
            <p className="text-gray-400 text-sm">Looks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p className="text-gray-400 text-sm">Membre depuis</p>
          </div>
        </div>
      </div>

      {/* Mes looks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Mes looks</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : looks.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {looks.map((look) => (
              <div key={look.id} className="relative group">
                <img
                  src={look.photo_url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  onClick={() => handleDelete(look.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
                <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                  {new Date(look.look_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Aucun look enregistre</p>
          </div>
        )}
      </div>

      {/* Deconnexion */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-3 rounded-lg hover:bg-red-600/30 transition"
      >
        <LogOut size={18} />
        <span>Deconnexion</span>
      </button>
    </div>
  )
}
