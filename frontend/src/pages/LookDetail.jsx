import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart, Eye, Bookmark, Tag, ExternalLink, Clock, MoreVertical, Share2, Flag, Ban, X, Camera } from 'lucide-react'
import { getLook, likeLook, saveLook, getPhotoUrl, followUser, isFollowing, reportContent, blockUser } from '../api/client'
import PhotoCarousel from '../components/PhotoCarousel'
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
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const REPORT_REASONS = [
    { value: 'inappropriate', label: 'Contenu inapproprie' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harcelement' },
    { value: 'fake', label: 'Faux compte' },
    { value: 'other', label: 'Autre' },
  ]

  useEffect(() => {
    loadLook()
  }, [id])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false)
    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

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
        toast.success('Look like !')
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
      toast.success(saveData.saved ? 'Look sauvegarde !' : 'Look retire des sauvegardes')
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

  const handleShare = async () => {
    const shareData = {
      title: `Look de ${data.user?.username}`,
      text: `Decouvre ce look sur LOOKUP !`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Erreur de partage')
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copie !')
      } catch (err) {
        toast.error('Impossible de copier le lien')
      }
    }
  }

  const handleReport = async () => {
    if (!reportReason || submitting) return
    setSubmitting(true)
    try {
      await reportContent({
        reported_user_id: data.user?.id,
        look_id: parseInt(id),
        reason: reportReason,
        details: reportDetails,
      })
      toast.success('Signalement envoye')
      setShowReportModal(false)
      setReportReason('')
      setReportDetails('')
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Tu as deja signale ce contenu')
      } else {
        toast.error('Erreur lors du signalement')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBlock = async () => {
    if (!data?.user?.id || submitting) return
    setSubmitting(true)
    try {
      const { data: blockData } = await blockUser(data.user.id)
      toast.success(blockData.blocked ? `${data.user.username} a ete bloque` : `${data.user.username} a ete debloque`)
      setShowBlockModal(false)
      if (blockData.blocked) {
        navigate(-1)
      }
    } catch (error) {
      toast.error('Erreur')
    } finally {
      setSubmitting(false)
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
        <p className="text-lookup-gray text-center">Look non trouve</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-lookup-mint font-medium">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="glass-strong px-4 pb-3 rounded-b-3xl shadow-glass sticky top-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-lookup-black">{data.user?.username}</h1>
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
                  <Flag size={16} className="text-orange-500" />
                  <span>Signaler</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowBlockModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full border-t border-gray-100"
                >
                  <Ban size={16} />
                  <span>Bloquer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User info - au dessus de la photo */}
      <div className="px-4 pt-4 mb-3">
        <div className="flex items-center gap-3">
          {data.user?.avatar_url ? (
            <img
              src={getPhotoUrl(data.user.avatar_url)}
              alt=""
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white font-bold text-lg">
              {data.user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-lookup-black">{data.user?.username}</p>
          </div>
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
      </div>

      {/* Photo + Info card (colles) */}
      <div className="px-4 mb-4">
        {(data.photo_urls?.length > 0 || data.photo_url) ? (
          <div className="relative rounded-t-2xl overflow-hidden shadow-sm">
            <PhotoCarousel
              photoUrls={data.photo_urls?.length > 0 ? data.photo_urls : [data.photo_url]}
              className="w-full max-h-[55vh]"
              imgClassName="w-full max-h-[55vh] object-cover"
              alt="Look"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm z-10">
              <Eye size={14} />
              <span>{stats.views_count}</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] rounded-t-2xl bg-white flex items-center justify-center shadow-sm">
            <div className="text-center">
              <Camera size={32} className="mx-auto text-lookup-gray mb-2" />
              <p className="text-lookup-gray">Pas de photo</p>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-lookup-gray-light text-lookup-gray text-xs">
              <Eye size={14} />
              <span>{stats.views_count}</span>
            </div>
          </div>
        )}
        <div className="glass rounded-b-2xl p-4 shadow-glass">
          <div className="flex items-center gap-1 text-lookup-gray text-sm">
            <Clock size={14} />
            <span>
              Publie {new Date(data.created_at).toLocaleString('fr-FR', {
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

      {/* Action buttons */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_liked
                ? 'bg-lookup-mint text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Heart size={20} fill={stats.user_liked ? 'currentColor' : 'none'} />
            <span className="font-semibold">{stats.likes_count}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition shadow-sm active:scale-95 ${
              stats.user_saved
                ? 'bg-lookup-mint text-white'
                : 'bg-white text-lookup-black border border-gray-100'
            }`}
          >
            <Bookmark size={20} fill={stats.user_saved ? 'currentColor' : 'none'} />
            <span className="font-medium">Sauvegarder</span>
          </button>
          <button
            onClick={handleShare}
            className="w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm active:scale-95 bg-white text-lookup-black border border-gray-100"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Pieces */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide mb-3 flex items-center gap-2">
          <Tag size={14} />
          Pieces du look ({data.items?.length || 0})
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
            <p className="text-lookup-gray text-sm">Aucune piece renseignee pour ce look</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Flag size={24} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-lookup-black text-center">
              Signaler ce contenu
            </h3>
            <p className="text-lookup-gray text-sm text-center mt-2">
              Pourquoi signales-tu ce contenu ?
            </p>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((option) => (
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

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Details supplementaires (optionnel)"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none h-20 mt-4"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason('')
                  setReportDetails('')
                }}
                className="flex-1 py-3 rounded-full border border-gray-200 font-medium text-lookup-black"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || submitting}
                className="flex-1 py-3 rounded-full bg-orange-500 font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Envoyer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Ban size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-lookup-black text-center">
              Bloquer {data.user?.username} ?
            </h3>
            <p className="text-lookup-gray text-sm text-center mt-2">
              Cette personne ne pourra plus voir tes looks et tu ne verras plus les siens.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 rounded-full border border-gray-200 font-medium text-lookup-black"
              >
                Annuler
              </button>
              <button
                onClick={handleBlock}
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-red-500 font-medium text-white flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Bloquer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
