import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAllRead, getPhotoUrl } from '../api/client'
import { ArrowLeft, UserPlus, Heart } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadNotifications()
    markAllRead().catch(() => {})
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleTap = (notif) => {
    if (notif.type === 'follow') {
      navigate(`/search?user=${notif.actor.username}`)
    } else if (notif.type === 'like' && notif.look_id) {
      navigate(`/look/${notif.look_id}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
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
                !notif.is_read ? 'bg-green-50/60' : ''
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
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                    {notif.actor.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* Icon badge */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                  notif.type === 'follow' ? 'bg-blue-500' : 'bg-red-500'
                }`}>
                  {notif.type === 'follow' ? (
                    <UserPlus size={10} className="text-white" />
                  ) : (
                    <Heart size={10} className="text-white fill-white" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{notif.actor.username}</span>{' '}
                  {notif.type === 'follow' ? "t'a suivi" : 'a aimé ton look'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
