import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAllRead, getPhotoUrl, getFollowRequests, acceptFollowRequest, rejectFollowRequest } from '../api/client'
import { ArrowLeft, UserPlus, Heart, Clock, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

// ===== DEMO MODE — Pour screenshots App Store =====
const DEMO_MODE = false

const MOCK_FOLLOW_REQUESTS = [
  {
    id: 901, username: 'user.lea',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    requested_at: new Date(Date.now() - 1800000).toISOString()
  },
]

const MOCK_NOTIFICATIONS = [
  {
    id: 801, type: 'like', is_read: false, created_at: new Date(Date.now() - 300000).toISOString(), look_id: 101,
    actor: { id: 10, username: 'user.marie', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' }
  },
  {
    id: 802, type: 'follow', is_read: false, created_at: new Date(Date.now() - 900000).toISOString(),
    actor: { id: 11, username: 'user.lucas', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
  },
  {
    id: 803, type: 'like', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString(), look_id: 102,
    actor: { id: 12, username: 'user.sofia', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' }
  },
  {
    id: 804, type: 'follow_accepted', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString(),
    actor: { id: 13, username: 'user.emma', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' }
  },
  {
    id: 805, type: 'like', is_read: true, created_at: new Date(Date.now() - 14400000).toISOString(), look_id: 101,
    actor: { id: 14, username: 'user.alex', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' }
  },
  {
    id: 806, type: 'follow', is_read: true, created_at: new Date(Date.now() - 28800000).toISOString(),
    actor: { id: 15, username: 'user.theo', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }
  },
]
// ===== FIN DEMO MODE =====

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [followRequests, setFollowRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
    if (!DEMO_MODE) markAllRead().catch(() => {})
  }, [])

  const loadData = async () => {
    if (DEMO_MODE) {
      setNotifications(MOCK_NOTIFICATIONS)
      setFollowRequests(MOCK_FOLLOW_REQUESTS)
      setLoading(false)
      return
    }
    try {
      const [notifRes, requestsRes] = await Promise.all([
        getNotifications(),
        getFollowRequests()
      ])
      setNotifications(notifRes.data)
      setFollowRequests(requestsRes.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (request) => {
    setProcessingIds(prev => [...prev, request.id])
    try {
      await acceptFollowRequest(request.id)
      setFollowRequests(prev => prev.filter(r => r.id !== request.id))
      toast.success(`${request.username} te suit maintenant`)
    } catch {
      toast.error('Erreur')
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== request.id))
    }
  }

  const handleReject = async (request) => {
    setProcessingIds(prev => [...prev, request.id])
    try {
      await rejectFollowRequest(request.id)
      setFollowRequests(prev => prev.filter(r => r.id !== request.id))
    } catch {
      toast.error('Erreur')
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== request.id))
    }
  }

  const handleTap = (notif) => {
    if (notif.type === 'follow' || notif.type === 'follow_accepted') {
      navigate(`/search?user=${notif.actor.username}`)
    } else if (notif.type === 'like' && notif.look_id) {
      navigate(`/look/${notif.look_id}`)
    }
  }

  const getNotifText = (notif) => {
    switch (notif.type) {
      case 'follow':
        return "t'a suivi"
      case 'follow_request':
        return "veut te suivre"
      case 'follow_accepted':
        return "a accepté ta demande"
      case 'like':
        return 'a aimé ton look'
      default:
        return ''
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'follow':
      case 'follow_accepted':
        return <UserPlus size={10} className="text-white" />
      case 'follow_request':
        return <Clock size={10} className="text-white" />
      case 'like':
        return <Heart size={10} className="text-white fill-white" />
      default:
        return null
    }
  }

  const getNotifColor = (type) => {
    switch (type) {
      case 'follow':
      case 'follow_accepted':
        return 'bg-blue-500'
      case 'follow_request':
        return 'bg-amber-500'
      case 'like':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pb-4 flex items-center gap-3 dark:bg-neutral-900/70" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} className="dark:text-white" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Demandes d'abonnement */}
          {followRequests.length > 0 && (
            <div className="px-4 mb-4">
              <h2 className="text-sm font-semibold text-lookup-gray mb-2 dark:text-gray-400">
                Demandes d'abonnement ({followRequests.length})
              </h2>
              <div className="space-y-2">
                {followRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20"
                  >
                    {/* Avatar */}
                    {request.avatar_url ? (
                      <img
                        src={getPhotoUrl(request.avatar_url)}
                        alt={request.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-lg">
                        {request.username?.[0]?.toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold dark:text-white">{request.username}</p>
                      <p className="text-xs text-gray-400">{timeAgo(request.requested_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request)}
                        disabled={processingIds.includes(request.id)}
                        className="w-9 h-9 rounded-full bg-lookup-mint flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                      >
                        <Check size={18} className="text-white" />
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        disabled={processingIds.includes(request.id)}
                        className="w-9 h-9 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                      >
                        <X size={18} className="text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications normales */}
          {notifications.length === 0 && followRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="px-4 space-y-1">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleTap(notif)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                    !notif.is_read ? 'bg-green-50/60 dark:bg-green-900/20' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {notif.actor.avatar_url ? (
                      <img
                        src={getPhotoUrl(notif.actor.avatar_url)}
                        alt={notif.actor.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-lg">
                        {notif.actor.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {/* Icon badge */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getNotifColor(notif.type)}`}>
                      {getNotifIcon(notif.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-white">
                      <span className="font-semibold">{notif.actor.username}</span>{' '}
                      {getNotifText(notif)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
