import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart, Eye, Bookmark, Tag, ExternalLink, Clock, UserPlus, UserCheck } from 'lucide-react'
import { getLook, likeLook, saveLook, getPhotoUrl, followUser, isFollowing } from '../api/client'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
  outerwear: 'Veste/Manteau',
  accessory: 'Accessoire',
}

export default function LookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ likes_count: 0, views_count: 0, user_liked: false, user_saved: false })
  const [liking, setLiking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    loadLook()
  }, [id])

  const loadLook = async () => {
    try {
      const { data: lookData } = await getLook(id)
      setData(lookData)
      if (lookData.stats) {
        setStats(lookData.stats)
      }

      // Verifier si on suit cet utilisateur
      if (lookData.user?.id) {
        try {
          const { data: followData } = await isFollowing(lookData.user.id)
          setFollowing(followData.is_following)
        } catch (e) {}
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const { data: likeData } = await likeLook(id)
      setStats(prev => ({
        ...prev,
        likes_count: likeData.likes_count,
        user_liked: likeData.liked
      }))
      if (likeData.liked) {
        toast.success('Look liké !')
      }
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setLiking(false)
    }
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { data: saveData } = await saveLook(id)
      setStats(prev => ({
        ...prev,
        user_saved: saveData.saved
      }))
      toast.success(saveData.saved ? 'Look sauvegardé !' : 'Look retiré des sauvegardes')
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleFollow = async () => {
    if (!data?.user?.id || followLoading) return
    setFollowLoading(true)
    try {
      const { data: followData } = await followUser(data.user.id)
      setFollowing(followData.following)
      toast.success(followData.following ? `Tu suis ${data.user.username}` : `Tu ne suis plus ${data.user.username}`)
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lookup-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-lookup-cream flex flex-col items-center justify-center px-4">
        <p className="text-lookup-gray text-center">Look non trouvé</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-lookup-mint font-medium">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="glass-strong px-4 pt-4 pb-3 rounded-b-3xl shadow-glass">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <h1 className="text-lg font-bold text-lookup-black">{data.title || 'Look'}</h1>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Photo */}
      {data.photo_url && (
        <div className="px-4 pt-4 mb-4">
          <img
            src={getPhotoUrl(data.photo_url)}
            alt="Look"
            className="w-full rounded-2xl object-cover max-h-[55vh] shadow-sm"
            loading="lazy"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_liked
                ? 'bg-pink-500 text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Heart size={22} fill={stats.user_liked ? 'currentColor' : 'none'} />
            <span className="font-semibold">{stats.likes_count}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_saved
                ? 'bg-lookup-mint text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Bookmark size={22} fill={stats.user_saved ? 'currentColor' : 'none'} />
            <span className="font-medium">{stats.user_saved ? 'Sauvegardé' : 'Sauvegarder'}</span>
          </button>
          <div className="ml-auto flex items-center gap-1.5 text-lookup-gray">
            <Eye size={18} />
            <span className="text-sm font-medium">{stats.views_count}</span>
          </div>
        </div>
      </div>

      {/* User info card */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {data.user?.avatar_url ? (
              <img
                src={getPhotoUrl(data.user.avatar_url)}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white font-bold text-lg">
                {data.user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lookup-black">{data.user?.username}</p>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition active:scale-95 ${
                    following
                      ? 'bg-lookup-cream text-lookup-gray border border-gray-200'
                      : 'bg-lookup-mint text-white'
                  }`}
                >
                  {followLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : following ? 'Suivi' : 'Suivre'}
                </button>
              </div>
              <div className="flex items-center gap-1 text-lookup-gray text-sm mt-1">
                <Clock size={12} />
                <span>
                  {new Date(data.created_at).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide mb-3 flex items-center gap-2">
          <Tag size={14} />
          Pièces du look ({data.items?.length || 0})
        </h2>

        {data.items?.length > 0 ? (
          <div className="space-y-2">
            {data.items.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="inline-block text-xs text-white bg-lookup-mint px-3 py-1 rounded-full font-medium">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    {item.brand && (
                      <p className="text-lookup-black font-semibold text-lg mt-2">{item.brand}</p>
                    )}
                    {item.product_name && (
                      <p className="text-lookup-gray">{item.product_name}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {item.color && (
                        <p className="text-lookup-gray text-sm">
                          <span className="text-lookup-black">Couleur:</span> {item.color}
                        </p>
                      )}
                      {item.product_reference && (
                        <p className="text-lookup-gray text-sm">
                          <span className="text-lookup-black">Ref:</span> {item.product_reference}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.product_url && (
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 bg-lookup-mint text-white px-4 py-2 rounded-full flex items-center gap-1 text-sm font-medium hover:bg-lookup-mint-dark transition"
                    >
                      <ExternalLink size={14} />
                      Acheter
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-lookup-gray text-sm">Aucune pièce renseignée pour ce look</p>
          </div>
        )}
      </div>
    </div>
  )
}
