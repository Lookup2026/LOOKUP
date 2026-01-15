import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Camera, Eye, Heart, Calendar, Settings, MapPin, Grid3X3, Trash2, X, Tag, MoreVertical, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getMyLooks, deleteLook, getPhotoUrl, uploadAvatar } from '../api/client'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
  outerwear: 'Veste/Manteau',
  accessory: 'Accessoire',
}

export default function Profile() {
  const { user, logout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const avatarInputRef = useRef(null)
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLook, setSelectedLook] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    loadLooks()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null)
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpenId])

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const { data } = await uploadAvatar(formData)
      setUser(data)
      toast.success('Photo de profil mise à jour')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error.response?.data?.detail || 'Erreur lors du téléchargement')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce look ?')) return

    try {
      await deleteLook(id)
      setLooks(looks.filter((l) => l.id !== id))
      setSelectedLook(null)
      setShowModal(false)
      toast.success('Look supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openLookDetail = (look) => {
    setSelectedLook(look)
    setShowModal(true)
  }

  const closeLookDetail = () => {
    setShowModal(false)
    setSelectedLook(null)
  }

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
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

      {/* Hidden file input for avatar */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Profile Card */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="relative cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {user?.avatar_url ? (
                <img
                  src={getPhotoUrl(user.avatar_url)}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border-2 border-lookup-mint"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white text-2xl font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
              {/* Small camera badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-lookup-mint rounded-full flex items-center justify-center border-2 border-white">
                <Camera size={12} className="text-white" />
              </div>
            </div>
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
          <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">Ma bibliothèque</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : looks.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {looks.map((look) => (
              <div key={look.id} className="relative">
                {/* Image container */}
                <div
                  className="relative aspect-[3/4] group cursor-pointer"
                  onClick={() => openLookDetail(look)}
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

                </div>

                {/* Look name below image */}
                <p className="mt-1.5 text-sm text-lookup-black font-medium truncate px-0.5">
                  {look.title || 'Sans titre'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <Camera size={28} className="text-lookup-mint" />
            </div>
            <p className="text-lookup-black font-medium">Aucun look enregistré</p>
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
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Look Detail Modal */}
      {showModal && selectedLook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex flex-col">
          {/* Modal Header - Clean minimal design */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={closeLookDetail}
              className="p-2 -ml-2 text-white/80 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="text-white text-center flex-1 px-4">
              <p className="font-semibold text-lg">{selectedLook.title || 'Mon look'}</p>
              <p className="text-xs text-white/50 mt-0.5">
                {new Date(selectedLook.look_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === selectedLook.id ? null : selectedLook.id)
                }}
                className="p-2 -mr-2 text-white/80 hover:text-white"
              >
                <MoreVertical size={24} />
              </button>

              {/* Dropdown menu */}
              {menuOpenId === selectedLook.id && (
                <div
                  className="absolute top-10 right-0 bg-white rounded-xl shadow-lg overflow-hidden z-10 min-w-[150px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setMenuOpenId(null)
                      setShowModal(false)
                      navigate(`/edit-look/${selectedLook.id}`)
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-lookup-black hover:bg-lookup-cream w-full"
                  >
                    <Pencil size={16} className="text-lookup-mint" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpenId(null)
                      handleDelete(selectedLook.id)
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full border-t border-gray-100"
                  >
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Photo */}
            <div className="px-4 pt-4">
              <img
                src={getPhotoUrl(selectedLook.photo_url)}
                alt="Mon look"
                className="w-full max-h-[50vh] object-contain rounded-2xl"
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="flex items-center gap-2 text-white">
                <Eye size={20} />
                <span className="font-semibold">{selectedLook.views_count || 0} vues</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Heart size={20} className="text-pink-400" />
                <span className="font-semibold">{selectedLook.likes_count || 0} likes</span>
              </div>
            </div>

            {/* Items/Pieces */}
            {selectedLook.items && selectedLook.items.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Pièces du look ({selectedLook.items.length})
                </h3>
                <div className="space-y-2">
                  {selectedLook.items.map((item, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-3">
                      <span className="inline-block text-xs text-white bg-lookup-mint px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      {item.brand && (
                        <p className="text-white font-semibold mt-1">{item.brand}</p>
                      )}
                      {item.product_name && (
                        <p className="text-white/70 text-sm">{item.product_name}</p>
                      )}
                      {item.color && (
                        <p className="text-white/50 text-xs mt-1">Couleur: {item.color}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No items message */}
            {(!selectedLook.items || selectedLook.items.length === 0) && (
              <div className="px-4 pb-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <p className="text-white/70 text-sm">Aucune pièce renseignée pour ce look</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
