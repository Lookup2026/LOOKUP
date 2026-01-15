import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Eye, Heart, Settings, Plus, ChevronRight } from 'lucide-react'
import { getTodayLook, getMyCrossings, getPhotoUrl } from '../api/client'
import { useLocationStore } from '../stores/locationStore'

export default function Home() {
  const { sendPing } = useLocationStore()
  const [todayLook, setTodayLook] = useState(null)
  const [crossings, setCrossings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    sendPing().catch(() => {})

    // Ping automatique toutes les 30 secondes pour détecter les croisements
    const pingInterval = setInterval(() => {
      sendPing().then(() => {
        // Recharger les croisements après chaque ping
        getMyCrossings().then(res => setCrossings(res.data || [])).catch(() => {})
      }).catch(() => {})
    }, 30000)

    return () => clearInterval(pingInterval)
  }, [])

  const loadData = async () => {
    try {
      const [lookRes, crossingsRes] = await Promise.all([
        getTodayLook(),
        getMyCrossings()
      ])
      setTodayLook(lookRes.data)
      setCrossings(crossingsRes.data || [])
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const crossed = new Date(date)
    const diffMs = now - crossed
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return crossed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getApproxLocation = (crossing) => {
    if (crossing.location_name) return crossing.location_name
    return 'Près de vous'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lookup-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
          <div className="w-9"></div>
        </div>
      </div>

      {/* My Look Today - Mini Card */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">Mon look du jour</h2>
          <Link to="/add-look" className="text-lookup-mint text-sm font-medium">
            {todayLook ? 'Modifier' : 'Ajouter'}
          </Link>
        </div>

        {todayLook ? (
          <Link to="/add-look" className="block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-center p-3 gap-4">
              <img
                src={getPhotoUrl(todayLook.photo_url)}
                alt="Mon look"
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <p className="font-semibold text-lookup-black">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="flex items-center gap-1 text-lookup-gray text-sm mt-1">
                  <MapPin size={14} />
                  <span>Visible par les autres</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-lookup-gray text-xs">
                    <Eye size={12} />
                    <span>{todayLook.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-lookup-gray text-xs">
                    <Heart size={12} />
                    <span>{todayLook.likes_count || 0}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-lookup-gray" />
            </div>
          </Link>
        ) : (
          <Link to="/add-look" className="block">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-lookup-mint-light rounded-full mx-auto mb-3 flex items-center justify-center">
                <Plus size={24} className="text-lookup-mint" />
              </div>
              <p className="text-lookup-black font-medium">Publie ton look du jour</p>
              <p className="text-lookup-gray text-sm mt-1">Pour être visible par ceux que tu croises</p>
            </div>
          </Link>
        )}
      </div>

      {/* Crossed Looks Feed */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide mb-3">
          Looks récemment croisés
        </h2>

        {crossings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin size={28} className="text-lookup-mint" />
            </div>
            <p className="text-lookup-black font-medium">Aucun croisement pour l'instant</p>
            <p className="text-lookup-gray text-sm mt-1">
              Déplacez-vous pour croiser d'autres passionnés de mode
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {crossings.map((crossing) => (
              <Link
                key={crossing.id}
                to={`/crossings/${crossing.id}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Photo */}
                <div className="relative">
                  {crossing.other_look_photo_url ? (
                    <img
                      src={getPhotoUrl(crossing.other_look_photo_url)}
                      alt=""
                      className="w-full aspect-[4/5] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] bg-lookup-mint-light flex items-center justify-center">
                      <MapPin size={48} className="text-lookup-mint" />
                    </div>
                  )}

                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-semibold text-lg">{crossing.other_username}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <Clock size={14} />
                        <span>{getTimeAgo(crossing.crossed_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/90 text-sm">
                        <MapPin size={14} />
                        <span>{getApproxLocation(crossing)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-lookup-gray">
                      <Eye size={18} />
                      <span className="text-sm font-medium">{crossing.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-lookup-gray">
                      <Heart size={18} />
                      <span className="text-sm font-medium">{crossing.likes_count || 0}</span>
                    </div>
                  </div>
                  <span className="text-lookup-mint text-sm font-medium">Voir les détails</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
