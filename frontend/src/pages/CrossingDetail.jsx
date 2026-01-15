import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, MapPin, Clock, Timer, Tag, Heart, Eye, UserPlus } from 'lucide-react'
import { getCrossingDetail, likeLook, viewLook, getLookStats, getPhotoUrl } from '../api/client'
import toast from 'react-hot-toast'

const CATEGORY_LABELS = {
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
  outerwear: 'Veste/Manteau',
  accessory: 'Accessoire',
}

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
      <div className="min-h-screen bg-lookup-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-lookup-cream flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-lookup-mint-light rounded-full flex items-center justify-center mb-4">
          <MapPin size={32} className="text-lookup-mint" />
        </div>
        <p className="text-lookup-gray text-center">Croisement non trouve ou expire</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-lookup-mint font-medium"
        >
          Retour a l'accueil
        </button>
      </div>
    )
  }

  const { crossing, other_user, other_look } = data

  return (
    <div className="min-h-full bg-lookup-cream pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-lookup-black">{other_user?.username}</h1>
            {timeRemaining && (
              <div className="flex items-center justify-center gap-1 text-lookup-mint text-xs">
                <Timer size={12} />
                <span>Expire dans {timeRemaining}</span>
              </div>
            )}
          </div>
          <button className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <UserPlus size={18} className="text-lookup-gray" />
          </button>
        </div>
      </div>

      {/* Photo */}
      {other_look?.photo_url ? (
        <div className="px-4 pt-4 mb-4">
          <div className="relative">
            <img
              src={getPhotoUrl(other_look.photo_url)}
              alt="Look"
              className="w-full rounded-2xl object-cover max-h-[55vh] shadow-sm"
            />
            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <button
                onClick={handleLike}
                disabled={liking}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md transition ${
                  stats.user_liked
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/90 text-lookup-black'
                }`}
              >
                <Heart
                  size={20}
                  fill={stats.user_liked ? 'currentColor' : 'none'}
                />
                <span className="font-semibold">{stats.likes_count}</span>
              </button>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-lookup-black backdrop-blur-md">
                <Eye size={20} />
                <span className="font-semibold">{stats.views_count}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 pt-4 mb-4">
          <div className="w-full aspect-[3/4] rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <p className="text-lookup-gray">Pas de photo</p>
          </div>
        </div>
      )}

      {/* User info card */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {other_user?.avatar_url ? (
              <img
                src={other_user.avatar_url}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white font-bold text-lg">
                {other_user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-lookup-black">{other_user?.username}</p>
              <div className="flex items-center gap-1 text-lookup-gray text-sm">
                <Clock size={12} />
                <span>
                  Croise {new Date(crossing.crossed_at).toLocaleString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {crossing.location_name && (
            <div className="flex items-center gap-2 text-lookup-gray text-sm mt-3 pt-3 border-t border-lookup-gray-light">
              <MapPin size={14} className="text-lookup-mint" />
              <span>{crossing.location_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pieces */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide mb-3 flex items-center gap-2">
          <Tag size={14} />
          Pieces du look ({other_look?.items?.length || 0})
        </h2>

        {other_look?.items?.length > 0 ? (
          <div className="space-y-2">
            {other_look.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
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
            <p className="text-lookup-gray text-sm">Aucune piece renseignee pour ce look</p>
          </div>
        )}
      </div>
    </div>
  )
}
