import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin, Clock, Timer, User, Tag, Heart, Eye } from 'lucide-react'
import { getCrossingDetail, likeLook, viewLook, getLookStats } from '../api/client'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
  outerwear: 'Veste/Manteau',
  accessory: 'Accessoire',
}

// Calcul du temps restant avant expiration (24h)
function getTimeRemaining(crossedAt) {
  const crossed = new Date(crossedAt)
  const expires = new Date(crossed.getTime() + 24 * 60 * 60 * 1000)
  const now = new Date()
  const diff = expires - now

  if (diff <= 0) return null

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}min`
}

export default function CrossingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [stats, setStats] = useState({ likes_count: 0, views_count: 0, user_liked: false })
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    loadDetail()
  }, [id])

  // Mettre a jour le temps restant chaque minute
  useEffect(() => {
    if (data?.crossing?.crossed_at) {
      setTimeRemaining(getTimeRemaining(data.crossing.crossed_at))
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(data.crossing.crossed_at))
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [data])

  const loadDetail = async () => {
    try {
      const { data: crossingData } = await getCrossingDetail(id)
      setData(crossingData)

      // Enregistrer la vue et charger les stats si look existe
      if (crossingData.other_look?.id) {
        await viewLook(crossingData.other_look.id)
        const { data: statsData } = await getLookStats(crossingData.other_look.id)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!data?.other_look?.id || liking) return

    setLiking(true)
    try {
      const { data: likeData } = await likeLook(data.other_look.id)
      setStats(prev => ({
        ...prev,
        likes_count: likeData.likes_count,
        user_liked: likeData.liked
      }))
      if (likeData.liked) {
        toast.success('Look like !')
      }
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setLiking(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-gray-400">Croisement non trouve ou expire</p>
      </div>
    )
  }

  const { crossing, other_user, other_look } = data

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-gray-300 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Look croise</h1>
        </div>
        {timeRemaining && (
          <div className="flex items-center gap-1 text-lookup-accent text-sm">
            <Timer size={14} />
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Photo du look */}
      {other_look?.photo_url ? (
        <div className="px-4 mb-4 relative">
          <img
            src={other_look.photo_url}
            alt="Look"
            className="w-full rounded-xl object-cover max-h-[60vh]"
          />
          {/* Stats overlay */}
          <div className="absolute bottom-4 left-8 right-8 flex justify-between">
            {/* Bouton Like */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition ${
                stats.user_liked
                  ? 'bg-red-500/80 text-white'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart
                size={20}
                fill={stats.user_liked ? 'currentColor' : 'none'}
                className={stats.user_liked ? 'text-white' : ''}
              />
              <span className="font-medium">{stats.likes_count}</span>
            </button>
            {/* Compteur vues */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 text-white backdrop-blur-md">
              <Eye size={20} />
              <span className="font-medium">{stats.views_count}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 mb-4">
          <div className="w-full aspect-square rounded-xl bg-lookup-gray flex items-center justify-center">
            <p className="text-gray-500">Pas de photo</p>
          </div>
        </div>
      )}

      {/* Infos user */}
      <div className="px-4 mb-4">
        <div className="bg-lookup-gray rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {other_user?.avatar_url ? (
                <img
                  src={other_user.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-lookup-accent flex items-center justify-center text-black font-bold text-xl">
                  {other_user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-white font-medium text-lg">{other_user?.username}</span>
                </div>
                {other_look?.title && (
                  <p className="text-gray-400 text-sm">{other_look.title}</p>
                )}
              </div>
            </div>
            {/* Stats mini */}
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex items-center gap-1">
                <Heart size={14} fill={stats.likes_count > 0 ? 'currentColor' : 'none'} className="text-red-400" />
                <span className="text-sm">{stats.likes_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span className="text-sm">{stats.views_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infos croisement */}
      <div className="px-4 mb-6">
        <div className="bg-lookup-gray rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span>
              Croise le {new Date(crossing.crossed_at).toLocaleString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {crossing.location_name && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span>{crossing.location_name}</span>
            </div>
          )}
          {timeRemaining && (
            <div className="flex items-center gap-2 text-lookup-accent">
              <Timer size={16} />
              <span>Visible encore {timeRemaining}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pieces du look */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Tag size={18} />
          Pieces du look ({other_look?.items?.length || 0})
        </h2>

        {other_look?.items?.length > 0 ? (
          <div className="space-y-3">
            {other_look.items.map((item, index) => (
              <div
                key={index}
                className="bg-lookup-gray rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="inline-block text-xs text-black bg-lookup-accent px-2 py-0.5 rounded uppercase font-medium">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>

                    {item.brand && (
                      <p className="text-white font-semibold text-lg mt-2">{item.brand}</p>
                    )}

                    {item.product_name && (
                      <p className="text-gray-300">{item.product_name}</p>
                    )}

                    <div className="mt-2 space-y-1">
                      {item.color && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500">Couleur:</span> {item.color}
                        </p>
                      )}
                      {item.product_reference && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500">Ref:</span> {item.product_reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.product_url && (
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 bg-lookup-accent text-black px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium hover:opacity-80 transition"
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
          <div className="bg-lookup-gray rounded-xl p-6 text-center">
            <p className="text-gray-400">Aucune piece renseignee pour ce look</p>
          </div>
        )}
      </div>
    </div>
  )
}
