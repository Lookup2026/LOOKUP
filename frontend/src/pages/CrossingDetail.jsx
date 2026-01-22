import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ExternalLink, MapPin, Clock, Timer, Tag, Heart, Eye, MoreVertical, Map, Bookmark, Camera, Share2, ShieldOff, AlertTriangle, X } from 'lucide-react'
import { getCrossingDetail, likeCrossing, saveCrossing, getPhotoUrl, blockUser, reportContent } from '../api/client'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom marker icon matching app design
const customIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #E8A0A0 0%, #D4817F 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(96, 153, 102, 0.4);
      border: 3px solid white;
    ">
      <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

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
  const [stats, setStats] = useState({ likes_count: 0, views_count: 0, user_liked: false, user_saved: false })
  const [liking, setLiking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    loadDetail()
  }, [id])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

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

      // Les stats viennent maintenant directement de l'API crossing detail
      if (crossingData.stats) {
        setStats(crossingData.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (liking) return

    setLiking(true)
    try {
      const { data: likeData } = await likeCrossing(id)
      setStats(prev => ({
        ...prev,
        likes_count: likeData.likes_count,
        user_liked: likeData.liked
      }))
      if (likeData.liked) {
        toast.success('Croisement like !')
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
      const { data: saveData } = await saveCrossing(id)
      setStats(prev => ({
        ...prev,
        user_saved: saveData.saved
      }))
      if (saveData.saved) {
        toast.success('Croisement sauvegarde !')
      } else {
        toast.success('Croisement retire des sauvegardes')
      }
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/crossings/${id}`
    const shareData = {
      title: `Look de ${data?.other_user?.username || 'quelqu\'un'} sur LOOKUP`,
      text: `Regarde ce look que j'ai croise sur LOOKUP !`,
      url: shareUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
        if (err.name !== 'AbortError') {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareUrl)
          toast.success('Lien copie !')
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(shareUrl)
      toast.success('Lien copie !')
    }
  }

  const handleBlock = async () => {
    if (!data?.other_user?.id || blocking) return

    setBlocking(true)
    try {
      const { data: blockData } = await blockUser(data.other_user.id)
      setShowBlockConfirm(false)
      if (blockData.blocked) {
        toast.success('Utilisateur bloque')
        // Retourner a l'accueil car on ne veut plus voir ce croisement
        navigate('/')
      } else {
        toast.success('Utilisateur debloque')
      }
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setBlocking(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason || reporting) return

    setReporting(true)
    try {
      await reportContent({
        user_id: data?.other_user?.id,
        look_id: data?.other_look?.id,
        reason: reportReason
      })
      setShowReportModal(false)
      setReportReason('')
      toast.success('Merci pour ton signalement')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur')
    } finally {
      setReporting(false)
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
        <p className="text-lookup-gray text-center">Croisement non trouvé ou expiré</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-lookup-mint font-medium"
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  const { crossing, other_user, other_look } = data
  const hasLocation = crossing.latitude && crossing.longitude && crossing.latitude !== 0 && crossing.longitude !== 0

  return (
    <div className="min-h-full bg-lookup-cream pb-4">
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
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center"
            >
              <MoreVertical size={18} className="text-lookup-gray" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div
                className="absolute top-10 right-0 bg-white rounded-xl shadow-lg overflow-hidden z-10 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowReportModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-lookup-black hover:bg-gray-50 w-full"
                >
                  <AlertTriangle size={16} className="text-orange-500" />
                  <span>Signaler</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowBlockConfirm(true)
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full border-t border-gray-100"
                >
                  <ShieldOff size={16} />
                  <span>Bloquer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo */}
      {other_look?.photo_url && !imageError ? (
        <div className="px-4 pt-4 mb-4">
          <div className="relative">
            {/* Loading placeholder */}
            {imageLoading && (
              <div className="w-full aspect-[3/4] rounded-2xl bg-gray-100 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-3 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={getPhotoUrl(other_look.photo_url)}
              alt="Look"
              className={`w-full rounded-2xl object-cover max-h-[55vh] shadow-sm ${imageLoading ? 'hidden' : ''}`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setImageError(true)
              }}
            />
            {/* Views badge - discret en bas à droite */}
            {!imageLoading && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm">
                <Eye size={14} />
                <span>{stats.views_count}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 pt-4 mb-4">
          <div className="relative w-full aspect-[3/4] rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <div className="text-center">
              <Camera size={32} className="mx-auto text-lookup-gray mb-2" />
              <p className="text-lookup-gray">{imageError ? 'Erreur de chargement' : 'Pas de photo'}</p>
              {imageError && (
                <button
                  onClick={() => {
                    setImageError(false)
                    setImageLoading(true)
                  }}
                  className="mt-2 text-lookup-mint text-sm font-medium"
                >
                  Reessayer
                </button>
              )}
            </div>
            {/* Views badge même sans photo */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-lookup-gray-light text-lookup-gray text-xs">
              <Eye size={14} />
              <span>{stats.views_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Like - toujours actif (like le croisement) */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_liked
                ? 'bg-pink-500 text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Heart
              size={22}
              fill={stats.user_liked ? 'currentColor' : 'none'}
            />
            <span className="font-semibold">{stats.likes_count}</span>
          </button>
          {/* Save - toujours actif (save le croisement) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_saved
                ? 'bg-lookup-mint text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Bookmark
              size={22}
              fill={stats.user_saved ? 'currentColor' : 'none'}
            />
            <span className="font-medium">{stats.user_saved ? 'Sauvegarde' : 'Sauvegarder'}</span>
          </button>
          {/* Share - always visible */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-full transition shadow-sm active:scale-95 bg-white text-lookup-black border border-gray-100 ml-auto"
          >
            <Share2 size={22} />
            <span className="font-medium">Partager</span>
          </button>
        </div>
      </div>

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
                  Croisé {new Date(crossing.crossed_at).toLocaleString('fr-FR', {
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

          {/* Location info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-lookup-gray-light">
            <div className="flex items-center gap-2 text-lookup-gray text-sm">
              <MapPin size={14} className="text-lookup-mint" />
              <span>{crossing.location_name || 'Zone de croisement'}</span>
            </div>
            {hasLocation && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-1 text-lookup-mint text-sm font-medium"
              >
                <Map size={14} />
                <span>{showMap ? 'Masquer' : 'Voir la carte'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Map */}
      {showMap && hasLocation && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-lookup-gray-light">
            {/* Map Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-lookup-mint-light to-white flex items-center gap-2">
              <div className="w-8 h-8 bg-lookup-mint rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-lookup-black">Zone de croisement</p>
                <p className="text-xs text-lookup-gray">{crossing.location_name || 'Position approximative'}</p>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-52 relative">
              <MapContainer
                center={[crossing.latitude, crossing.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
                dragging={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[crossing.latitude, crossing.longitude]} icon={customIcon}>
                  <Popup>
                    <div className="text-center py-1">
                      <p className="font-semibold text-lookup-black">Vous étiez ici</p>
                      {crossing.location_name && (
                        <p className="text-sm text-lookup-gray">{crossing.location_name}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Pulse animation overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ marginTop: '-20px' }}>
                <div className="w-16 h-16 rounded-full bg-lookup-mint/20 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pieces */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide mb-3 flex items-center gap-2">
          <Tag size={14} />
          Pièces du look ({other_look?.items?.length || 0})
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
            <p className="text-lookup-gray text-sm">Aucune pièce renseignée pour ce look</p>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <ShieldOff size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-lookup-black text-center">
              Bloquer {other_user?.username} ?
            </h3>
            <p className="text-lookup-gray text-sm text-center mt-2">
              Cette personne ne pourra plus voir tes looks et tu ne verras plus les siens.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 py-3 rounded-full border border-gray-200 font-medium text-lookup-black"
              >
                Annuler
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className="flex-1 py-3 rounded-full bg-red-500 font-medium text-white flex items-center justify-center gap-2"
              >
                {blocking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Bloquer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-lookup-black text-center">
              Signaler ce contenu
            </h3>
            <p className="text-lookup-gray text-sm text-center mt-2">
              Pourquoi signales-tu ce contenu ?
            </p>

            <div className="mt-4 space-y-2">
              {[
                { value: 'inappropriate_content', label: 'Contenu inapproprie' },
                { value: 'harassment', label: 'Harcelement' },
                { value: 'spam', label: 'Spam' },
                { value: 'fake_profile', label: 'Faux profil' },
                { value: 'other', label: 'Autre' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReportReason(option.value)}
                  className={`w-full py-3 px-4 rounded-xl text-left transition ${
                    reportReason === option.value
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                      : 'bg-gray-50 text-lookup-black hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason('')
                }}
                className="flex-1 py-3 rounded-full border border-gray-200 font-medium text-lookup-black"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || reporting}
                className="flex-1 py-3 rounded-full bg-orange-500 font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {reporting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
