import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Eye, Heart, Settings, Plus, RefreshCw, Users, AlertTriangle, Search } from 'lucide-react'
import { getTodayLook, getMyCrossings, getPhotoUrl, getFriendsFeed, likeLook, likeCrossing } from '../api/client'
import FeedCard from '../components/FeedCard'
import { useLocationStore } from '../stores/locationStore'
import toast from 'react-hot-toast'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { HomeSkeleton } from '../components/Skeleton'

// ===== MOCK DATA — A SUPPRIMER =====
const DEMO_MODE = true

const MOCK_LOOKS = [
  { id: 101, title: 'Casual Friday', photo_url: 'https://picsum.photos/seed/look1/400/500', photo_urls: ['https://picsum.photos/seed/look1/400/500', 'https://picsum.photos/seed/look1b/400/500'], views_count: 24, likes_count: 8, created_at: new Date().toISOString() },
  { id: 102, title: 'Streetwear vibes', photo_url: 'https://picsum.photos/seed/look2/400/500', photo_urls: ['https://picsum.photos/seed/look2/400/500'], views_count: 12, likes_count: 3, created_at: new Date(Date.now() - 3600000).toISOString() },
]

const MOCK_CROSSINGS = [
  { id: 201, other_username: 'marie_style', other_avatar_url: null, other_look_title: 'Total black', other_look_photo_url: 'https://picsum.photos/seed/cross1/400/500', other_look_photo_urls: ['https://picsum.photos/seed/cross1/400/500', 'https://picsum.photos/seed/cross1b/400/500'], crossed_at: new Date(Date.now() - 300000).toISOString(), location_name: 'Rue de Rivoli', views_count: 5, likes_count: 2 },
  { id: 202, other_username: 'alex.drip', other_avatar_url: null, other_look_title: 'Vintage 90s', other_look_photo_url: 'https://picsum.photos/seed/cross2/400/500', other_look_photo_urls: ['https://picsum.photos/seed/cross2/400/500', 'https://picsum.photos/seed/cross2b/400/500', 'https://picsum.photos/seed/cross2c/400/500'], crossed_at: new Date(Date.now() - 1800000).toISOString(), location_name: 'Champs-Elysees', views_count: 18, likes_count: 7 },
  { id: 203, other_username: 'lucas.fit', other_avatar_url: null, other_look_title: 'Sport chic', other_look_photo_url: 'https://picsum.photos/seed/cross3/400/500', other_look_photo_urls: ['https://picsum.photos/seed/cross3/400/500'], crossed_at: new Date(Date.now() - 7200000).toISOString(), location_name: 'Le Marais', views_count: 9, likes_count: 4 },
  { id: 204, other_username: 'sofia.mode', other_avatar_url: null, other_look_title: 'Boheme chic', other_look_photo_url: 'https://picsum.photos/seed/cross4/400/500', other_look_photo_urls: ['https://picsum.photos/seed/cross4/400/500', 'https://picsum.photos/seed/cross4b/400/500'], crossed_at: new Date(Date.now() - 10800000).toISOString(), location_name: 'Saint-Germain', views_count: 32, likes_count: 15 },
]

const MOCK_FRIENDS = [
  { id: 301, title: 'Look du soir', photo_url: 'https://picsum.photos/seed/friend1/400/500', photo_urls: ['https://picsum.photos/seed/friend1/400/500', 'https://picsum.photos/seed/friend1b/400/500'], user: { username: 'emma.fashion', avatar_url: null }, views_count: 45, likes_count: 12, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 302, title: 'Oversize mood', photo_url: 'https://picsum.photos/seed/friend2/400/500', photo_urls: ['https://picsum.photos/seed/friend2/400/500'], user: { username: 'theo.style', avatar_url: null }, views_count: 21, likes_count: 6, created_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 303, title: 'Minimaliste', photo_url: 'https://picsum.photos/seed/friend3/400/500', photo_urls: ['https://picsum.photos/seed/friend3/400/500', 'https://picsum.photos/seed/friend3b/400/500'], user: { username: 'chloe.looks', avatar_url: null }, views_count: 67, likes_count: 28, created_at: new Date(Date.now() - 14400000).toISOString() },
]
// ===== FIN MOCK DATA =====

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sendPing, permissionDenied, openLocationSettings } = useLocationStore()

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
  const [likedItems, setLikedItems] = useState({}) // { 'look-3': true, 'crossing-5': true }
  const [heartAnimation, setHeartAnimation] = useState(null) // 'look-3' or 'crossing-5'
  const [loading, setLoading] = useState(true)
  const [lastPing, setLastPing] = useState(null)
  const [pingStatus, setPingStatus] = useState('waiting') // waiting, success, error
  const [debugInfo, setDebugInfo] = useState(null)
  const lastTapRef = useRef({})
  const tapTimeoutRef = useRef({})

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
    if (!DEMO_MODE) {
      doPing()
    }

    // Ping foreground toutes les 60s (le background tracking gere le reste)
    const pingInterval = DEMO_MODE ? null : setInterval(() => {
      doPing()
    }, 60000)

    return () => { if (pingInterval) clearInterval(pingInterval) }
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
    // Mode demo pour tester l'interface
    if (DEMO_MODE) {
      setTodayLooks(MOCK_LOOKS)
      setCrossings(MOCK_CROSSINGS)
      setFriendsFeed(MOCK_FRIENDS)
      setPingStatus('success')
      setLoading(false)
      return
    }
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

  // Double-tap to like (mobile compatible)
  const handleTap = (e, type, id, path) => {
    const key = `${type}-${id}`
    const now = Date.now()
    const lastTap = lastTapRef.current[key] || 0

    // Clear any pending navigation timeout
    if (tapTimeoutRef.current[key]) {
      clearTimeout(tapTimeoutRef.current[key])
      tapTimeoutRef.current[key] = null
    }

    if (now - lastTap < 300) {
      // Double tap detected - like the item
      e.preventDefault()
      lastTapRef.current[key] = 0

      // Animation coeur
      setHeartAnimation(key)
      setTimeout(() => setHeartAnimation(null), 800)

      // Like si pas deja liké
      if (!likedItems[key]) {
        setLikedItems(prev => ({ ...prev, [key]: true }))
        if (type === 'look') {
          likeLook(id).then(() => {
            setFriendsFeed(prev => prev.map(l =>
              l.id === id ? { ...l, likes_count: (l.likes_count || 0) + 1 } : l
            ))
          }).catch(() => {})
        } else {
          likeCrossing(id).then(() => {
            setCrossings(prev => prev.map(c =>
              c.id === id ? { ...c, likes_count: (c.likes_count || 0) + 1 } : c
            ))
          }).catch(() => {})
        }
      }
    } else {
      // First tap - wait to see if double tap
      lastTapRef.current[key] = now
      tapTimeoutRef.current[key] = setTimeout(() => {
        // Single tap - navigate
        navigate(path)
      }, 300)
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
      <div className="min-h-screen bg-lookup-cream dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (loading) {
    return <HomeSkeleton />
  }

  return (
    <>
    {/* Header - fixed */}
    <div className="glass-strong px-4 pb-3 rounded-b-3xl shadow-glass fixed top-0 left-0 right-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
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
            <span className="text-xl font-extrabold text-lookup-black dark:text-white">LOOKUP</span>
          </div>
          <Link to="/settings" className="w-9 h-9 glass rounded-full flex items-center justify-center">
            <Settings size={18} className="text-lookup-gray" />
          </Link>
        </div>

      </div>

    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent={
        <div className="flex justify-center py-4">
          <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
            <RefreshCw size={20} className="text-lookup-mint transition-transform duration-300" style={{ transform: 'rotate(0deg)' }} />
          </div>
        </div>
      }
      refreshingContent={
        <div className="flex justify-center py-4">
          <div className="w-10 h-10 bg-lookup-mint rounded-full flex items-center justify-center animate-pulse">
            <RefreshCw size={20} className="text-white animate-spin" />
          </div>
        </div>
      }
    >
    <div className="min-h-full pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 16px) + 60px)' }}>

      {/* Bandeau permission localisation refusee */}
      {permissionDenied && (
        <div className="mx-4 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} className="text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">Localisation désactivée</p>
            <p className="text-xs text-orange-600">Active la localisation pour détecter les croisements.</p>
          </div>
          <button
            onClick={openLocationSettings}
            className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full"
          >
            Réglages
          </button>
        </div>
      )}

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
          <div className="ml-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {todayLooks.map((look, index) => (
              <Link
                key={look.id}
                to={`/edit-look/${look.id}`}
                className="flex-shrink-0 snap-start animate-card-enter"
                style={{ animationDelay: `${index * 60}ms` }}
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
                <p className="text-lookup-black dark:text-white font-medium">Publie ton look du jour</p>
                <p className="text-lookup-gray text-sm mt-1">Pour être visible par ceux que tu croises</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Feed Tabs + Content */}
      <div className="px-4 pt-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFeedTab('crossings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              feedTab === 'crossings'
                ? 'bg-gradient-to-r from-lookup-mint to-lookup-mint-dark text-white shadow-button animate-tab-active'
                : 'glass text-lookup-gray'
            }`}
          >
            <MapPin size={14} />
            Croisements
          </button>
          <button
            onClick={() => setFeedTab('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              feedTab === 'friends'
                ? 'bg-gradient-to-r from-lookup-mint to-lookup-mint-dark text-white shadow-button animate-tab-active'
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
                <p className="text-lookup-black dark:text-white font-medium">Aucun croisement pour l'instant</p>
                <p className="text-lookup-gray text-sm mt-1">
                  Déplacez-vous pour croiser d'autres passionnés de mode
                </p>
              </div>
            ) : (
              <div className="space-y-3" >
                {crossings.map((crossing, index) => (
                  <div key={crossing.id} className="animate-card-enter" style={{ animationDelay: `${index * 80}ms` }}>
                    <FeedCard
                      type="crossing"
                      item={crossing}
                      onTap={handleTap}
                      heartAnimation={heartAnimation}
                      getTimeAgo={getTimeAgo}
                      getApproxLocation={getApproxLocation}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Friends Feed */}
        {feedTab === 'friends' && (
          <>
            {friendsFeed.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={28} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-black dark:text-white font-medium">Aucun look d'amis</p>
                <p className="text-lookup-gray text-sm mt-1">
                  Suis des personnes pour voir leurs looks ici
                </p>
                <Link to="/search" className="inline-block mt-3 text-lookup-mint text-sm font-medium">
                  Rechercher des amis
                </Link>
              </div>
            ) : (
              <div className="space-y-3" >
                {friendsFeed.map((look, index) => (
                  <div key={look.id} className="animate-card-enter" style={{ animationDelay: `${index * 80}ms` }}>
                    <FeedCard
                      type="look"
                      item={look}
                      onTap={handleTap}
                      heartAnimation={heartAnimation}
                      getTimeAgo={getTimeAgo}
                      getApproxLocation={getApproxLocation}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
    </PullToRefresh>
    </>
  )
}
