import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Clock, Eye, Heart, Settings, Plus, ChevronRight, RefreshCw, Search, Users } from 'lucide-react'
import { getTodayLook, getMyCrossings, getPhotoUrl, getFriendsFeed } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import toast from 'react-hot-toast'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { HomeSkeleton } from '../components/Skeleton'

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [friendsFeed, setFriendsFeed] = useState([])
  const [feedTab, setFeedTab] = useState('crossings') // 'crossings' or 'friends'
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
  }, [location.key])

  // Recharger quand l'app revient au premier plan
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const loadData = async () => {
    try {
      const [lookRes, crossingsRes, feedRes] = await Promise.all([
        getTodayLook(),
        getMyCrossings(),
        getFriendsFeed()
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
      setFriendsFeed(feedRes.data || [])
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur de chargement')
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
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="glass-strong px-4 pt-4 pb-3 rounded-b-3xl shadow-glass">
        <div className="flex items-center justify-between">
          <Link to="/search" className="w-9 h-9 glass rounded-full flex items-center justify-center">
            <Search size={18} className="text-lookup-gray" />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              pingStatus === 'success' ? 'bg-green-500' :
              pingStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } animate-pulse`}></div>
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-lookup-black">LOOKUP</span>
          </div>
          <Link to="/settings" className="w-9 h-9 glass rounded-full flex items-center justify-center">
            <Settings size={18} className="text-lookup-gray" />
          </Link>
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
                <div className="glass rounded-2xl overflow-hidden shadow-glass w-36">
                  <img
                    src={getPhotoUrl(look.photo_url)}
                    alt="Mon look"
                    className="w-36 h-44 object-cover bg-gray-100"
                    loading="lazy"
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
              <div className="glass rounded-2xl overflow-hidden shadow-glass w-36 h-[212px] flex flex-col items-center justify-center border-2 border-dashed border-white/60">
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
              <div className="glass rounded-2xl p-6 text-center shadow-glass">
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

      {/* Feed Tabs + Content */}
      <div className="px-4 pt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFeedTab('crossings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              feedTab === 'crossings'
                ? 'bg-gradient-to-r from-lookup-mint to-lookup-mint-dark text-white shadow-button'
                : 'glass text-lookup-gray'
            }`}
          >
            <MapPin size={14} />
            Croisements
          </button>
          <button
            onClick={() => setFeedTab('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              feedTab === 'friends'
                ? 'bg-gradient-to-r from-lookup-mint to-lookup-mint-dark text-white shadow-button'
                : 'glass text-lookup-gray'
            }`}
          >
            <Users size={14} />
            Amis
          </button>
        </div>

        {/* Crossings Feed */}
        {feedTab === 'crossings' && (
          <>
            {crossings.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center shadow-glass">
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
                    className="block glass rounded-2xl overflow-hidden shadow-glass"
                  >
                    <div className="relative">
                      {crossing.other_look_photo_url ? (
                        <img
                          src={getPhotoUrl(crossing.other_look_photo_url)}
                          alt=""
                          className="w-full aspect-[4/5] object-cover bg-gray-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[4/5] bg-lookup-mint-light flex items-center justify-center">
                          <MapPin size={48} className="text-lookup-mint" />
                        </div>
                      )}
                      {/* Username en haut à gauche */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                        {crossing.other_avatar_url ? (
                          <img src={getPhotoUrl(crossing.other_avatar_url)} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-lookup-mint flex items-center justify-center text-white text-xs font-bold">
                            {crossing.other_username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-white text-sm font-medium">{crossing.other_username}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white font-semibold text-lg">{crossing.other_look_title || 'Look du jour'}</p>
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
                    <div className="flex items-center justify-between px-4 py-3">
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
          </>
        )}

        {/* Friends Feed */}
        {feedTab === 'friends' && (
          <>
            {friendsFeed.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={28} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-black font-medium">Aucun look d'amis</p>
                <p className="text-lookup-gray text-sm mt-1">
                  Suis des personnes pour voir leurs looks ici
                </p>
                <Link to="/search" className="inline-block mt-3 text-lookup-mint text-sm font-medium">
                  Rechercher des amis
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {friendsFeed.map((look) => (
                  <Link
                    key={look.id}
                    to={`/look/${look.id}`}
                    className="block glass rounded-2xl overflow-hidden shadow-glass"
                  >
                    <div className="relative">
                      {look.photo_url ? (
                        <img
                          src={getPhotoUrl(look.photo_url)}
                          alt=""
                          className="w-full aspect-[4/5] object-cover bg-gray-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[4/5] bg-lookup-mint-light flex items-center justify-center">
                          <Heart size={48} className="text-lookup-mint" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex items-center gap-2">
                          {look.user?.avatar_url && (
                            <img
                              src={getPhotoUrl(look.user.avatar_url)}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border-2 border-white"
                            />
                          )}
                          <p className="text-white font-semibold text-lg">{look.user?.username}</p>
                        </div>
                        {look.title && (
                          <p className="text-white/90 text-sm">{look.title}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <Clock size={14} />
                            <span>{getTimeAgo(look.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Eye size={18} />
                          <span className="text-sm font-medium">{look.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Heart size={18} />
                          <span className="text-sm font-medium">{look.likes_count || 0}</span>
                        </div>
                      </div>
                      {look.items?.length > 0 && (
                        <span className="text-lookup-gray text-xs">
                          {look.items.map(i => i.brand).filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </PullToRefresh>
  )
}
