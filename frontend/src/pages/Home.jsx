import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Eye, Heart, Settings, Plus, ChevronRight, RefreshCw } from 'lucide-react'
import { getTodayLook, getMyCrossings, getPhotoUrl } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import toast from 'react-hot-toast'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { HomeSkeleton } from '../components/Skeleton'

export default function Home() {
  const navigate = useNavigate()
  const { sendPing } = useLocationStore()

  // Check for onboarding redirect immediately (before any render)
  const shouldShowOnboarding = localStorage.getItem('show_onboarding') === 'true'

  // Verifier si on doit afficher l'onboarding (useLayoutEffect pour execution synchrone)
  useLayoutEffect(() => {
    if (shouldShowOnboarding) {
      localStorage.removeItem('show_onboarding')
      navigate('/onboarding', { replace: true })
    }
  }, [shouldShowOnboarding, navigate])

  const [todayLooks, setTodayLooks] = useState([])
  const [crossings, setCrossings] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastPing, setLastPing] = useState(null)
  const [pingStatus, setPingStatus] = useState('waiting') // waiting, success, error
  const [debugInfo, setDebugInfo] = useState(null)

  const doPing = async () => {
    try {
      const result = await sendPing()
      setLastPing(new Date())
      setPingStatus('success')
      setDebugInfo({
        zone: result?.zone,
        newCrossings: result?.new_crossings || 0,
        time: new Date().toLocaleTimeString('fr-FR')
      })

      // Vérifier si nouveau croisement
      if (result?.new_crossings > 0) {
        toast.success(`${result.new_crossings} nouveau(x) croisement(s) !`)
      }

      // Recharger les croisements
      const res = await getMyCrossings()
      setCrossings(res.data || [])

      return result
    } catch (err) {
      setPingStatus('error')
      setDebugInfo({ error: err.message || 'Erreur GPS', time: new Date().toLocaleTimeString('fr-FR') })
      console.error('Ping error:', err)
    }
  }

  useEffect(() => {
    loadData()
    doPing()

    // Ping automatique toutes les 30 secondes pour détecter les croisements
    const pingInterval = setInterval(() => {
      doPing()
    }, 30000)

    return () => clearInterval(pingInterval)
  }, [])

  const loadData = async () => {
    try {
      const [lookRes, crossingsRes] = await Promise.all([
        getTodayLook(),
        getMyCrossings()
      ])
      // Gerer les deux cas: ancien endpoint (objet) et nouveau (tableau)
      const looksData = lookRes.data
      if (Array.isArray(looksData)) {
        setTodayLooks(looksData)
      } else if (looksData) {
        // Ancien format: objet unique -> convertir en tableau
        setTodayLooks([looksData])
      } else {
        setTodayLooks([])
      }
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

  // Fonction de rafraichissement pour pull-to-refresh
  const handleRefresh = async () => {
    await Promise.all([loadData(), doPing()])
  }

  // Ne pas rendre si redirection vers onboarding en cours
  if (shouldShowOnboarding) {
    return (
      <div className="min-h-screen bg-lookup-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (loading) {
    return <HomeSkeleton />
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className="flex justify-center py-4">
          <RefreshCw size={24} className="text-lookup-mint animate-pulse" />
        </div>
      }
      refreshingContent={
        <div className="flex justify-center py-4">
          <RefreshCw size={24} className="text-lookup-mint animate-spin" />
        </div>
      }
    >
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Link to="/settings" className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <Settings size={18} className="text-lookup-gray" />
          </Link>
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className={`w-2 h-2 rounded-full ${
              pingStatus === 'success' ? 'bg-green-500' :
              pingStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } animate-pulse`}></div>
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black">LOOKUP</span>
          </div>
          <div className="w-9"></div>
        </div>

        {/* Debug Panel */}
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-100 rounded-lg text-xs font-mono">
            {debugInfo.error ? (
              <p className="text-red-500">Erreur: {debugInfo.error}</p>
            ) : (
              <>
                <p>Zone: {debugInfo.zone}</p>
                <p>Dernier ping: {debugInfo.time}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* My Looks Today - Horizontal Carousel */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3 px-4">
          <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">
            Mes looks {todayLooks.length > 0 && `(${todayLooks.length})`}
          </h2>
          <Link to="/add-look" className="text-lookup-mint text-sm font-medium">
            Ajouter
          </Link>
        </div>

        {todayLooks.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {todayLooks.map((look) => (
              <Link
                key={look.id}
                to={`/edit-look/${look.id}`}
                className="flex-shrink-0 snap-start"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm w-36">
                  <img
                    src={getPhotoUrl(look.photo_url)}
                    alt="Mon look"
                    className="w-36 h-44 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs text-lookup-gray truncate">
                      {look.title || new Date(look.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-lookup-gray text-xs">
                        <Eye size={10} />
                        <span>{look.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-lookup-gray text-xs">
                        <Heart size={10} />
                        <span>{look.likes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {/* Add new look card */}
            <Link to="/add-look" className="flex-shrink-0 snap-start">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm w-36 h-[212px] flex flex-col items-center justify-center border-2 border-dashed border-lookup-gray-light">
                <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center mb-2">
                  <Plus size={20} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-gray text-xs">Ajouter</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="px-4">
            <Link to="/add-look" className="block">
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-lookup-mint-light rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Plus size={24} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-black font-medium">Publie ton look du jour</p>
                <p className="text-lookup-gray text-sm mt-1">Pour être visible par ceux que tu croises</p>
              </div>
            </Link>
          </div>
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
    </PullToRefresh>
  )
}
