import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Eye, Heart, Settings, Plus, RefreshCw, Search, Users, Tag, ChevronRight } from 'lucide-react'
import { getTodayLook, getMyCrossings, getPhotoUrl, getFriendsFeed } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import toast from 'react-hot-toast'
import PullToRefresh from 'react-simple-pull-to-refresh'
import { HomeSkeleton } from '../components/Skeleton'

export default function Home() {
  const navigate = useNavigate()
  const { sendPing } = useLocationStore()

  const shouldShowOnboarding = localStorage.getItem('show_onboarding') === 'true'

  useLayoutEffect(() => {
    if (shouldShowOnboarding) {
      localStorage.removeItem('show_onboarding')
      navigate('/onboarding', { replace: true })
    }
  }, [shouldShowOnboarding, navigate])

  const [todayLooks, setTodayLooks] = useState([])
  const [crossings, setCrossings] = useState([])
  const [friendsFeed, setFriendsFeed] = useState([])
  const [feedTab, setFeedTab] = useState('crossings')
  const [loading, setLoading] = useState(true)
  const [pingStatus, setPingStatus] = useState('waiting')

  const doPing = async () => {
    try {
      const result = await sendPing()
      setPingStatus('success')

      if (result?.new_crossings > 0) {
        toast.success(`${result.new_crossings} nouveau(x) croisement(s) !`)
      }

      const res = await getMyCrossings()
      setCrossings(res.data || [])
      return result
    } catch (err) {
      setPingStatus('error')
      console.error('Ping error:', err)
    }
  }

  useEffect(() => {
    loadData()
    doPing()
    const pingInterval = setInterval(() => { doPing() }, 30000)
    return () => clearInterval(pingInterval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [lookRes, crossingsRes, feedRes] = await Promise.all([
        getTodayLook(),
        getMyCrossings(),
        getFriendsFeed()
      ])
      const looksData = lookRes.data
      if (Array.isArray(looksData)) {
        setTodayLooks(looksData)
      } else if (looksData) {
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
    if (diffMins < 60) return `${diffMins} min`
    if (diffHours < 24) return `${diffHours}h`
    return crossed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const getApproxLocation = (crossing) => {
    if (crossing.location_name) return crossing.location_name
    return 'Près de vous'
  }

  const handleRefresh = async () => {
    await Promise.all([loadData(), doPing()])
  }

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
      {/* Header — clean & minimal */}
      <div className="glass-strong px-4 pt-4 pb-3 rounded-b-3xl shadow-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/search" className="w-9 h-9 glass rounded-full flex items-center justify-center">
              <Search size={18} className="text-lookup-gray" />
            </Link>
            <Link to="/settings" className="w-9 h-9 glass rounded-full flex items-center justify-center">
              <Settings size={18} className="text-lookup-gray" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              pingStatus === 'success' ? 'bg-green-500' :
              pingStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } animate-pulse`}></div>
            <span className="text-xl font-extrabold text-lookup-black tracking-tight">LOOKUP</span>
          </div>
          <div className="w-[76px]"></div>
        </div>
      </div>

      {/* Feed Tabs — croisements en premier */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFeedTab('crossings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              feedTab === 'crossings'
                ? 'bg-lookup-black text-white shadow-sm'
                : 'glass text-lookup-gray'
            }`}
          >
            <MapPin size={14} />
            Croisements
            {crossings.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                feedTab === 'crossings' ? 'bg-white/20' : 'bg-lookup-mint-light'
              }`}>{crossings.length}</span>
            )}
          </button>
          <button
            onClick={() => setFeedTab('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              feedTab === 'friends'
                ? 'bg-lookup-black text-white shadow-sm'
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
                <p className="text-lookup-black font-semibold text-lg">Aucun croisement</p>
                <p className="text-lookup-gray text-sm mt-1">
                  Déplace-toi pour croiser d'autres utilisateurs LOOKUP
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-lookup-gray text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    pingStatus === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                  } animate-pulse`}></div>
                  <span>GPS {pingStatus === 'success' ? 'actif' : 'en attente'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {crossings.map((crossing) => (
                  <Link
                    key={crossing.id}
                    to={`/crossings/${crossing.id}`}
                    className="block rounded-2xl overflow-hidden shadow-glass bg-white"
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
                          <MapPin size={48} className="text-lookup-gray" />
                        </div>
                      )}
                      {/* Username badge — haut gauche */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                        {crossing.other_avatar_url ? (
                          <img src={getPhotoUrl(crossing.other_avatar_url)} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
                            {crossing.other_username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-white text-sm font-medium">{crossing.other_username}</span>
                      </div>
                      {/* Time badge — haut droite */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
                        <Clock size={12} />
                        <span>{getTimeAgo(crossing.crossed_at)}</span>
                      </div>
                      {/* Bottom gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-16">
                        <p className="text-white font-bold text-xl leading-tight">{crossing.other_look_title || 'Look du jour'}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <MapPin size={13} />
                            <span>{getApproxLocation(crossing)}</span>
                          </div>
                        </div>
                        {/* Aperçu des marques — le coeur du concept */}
                        {crossing.other_look_items && crossing.other_look_items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {crossing.other_look_items.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                                {item.brand || item.product_name || item.category}
                              </span>
                            ))}
                            {crossing.other_look_items.length > 3 && (
                              <span className="px-2.5 py-1 rounded-full bg-white/15 text-white/70 text-xs">
                                +{crossing.other_look_items.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Bottom bar — stats + CTA */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Eye size={16} />
                          <span className="text-sm">{crossing.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Heart size={16} />
                          <span className="text-sm">{crossing.likes_count || 0}</span>
                        </div>
                        {crossing.other_look_items && crossing.other_look_items.length > 0 && (
                          <div className="flex items-center gap-1.5 text-lookup-gray">
                            <Tag size={14} />
                            <span className="text-sm">{crossing.other_look_items.length} pièces</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-lookup-accent font-medium text-sm">
                        <span>Voir</span>
                        <ChevronRight size={16} />
                      </div>
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
              <div className="glass rounded-2xl p-8 text-center shadow-glass">
                <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={28} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-black font-semibold">Aucun look d'amis</p>
                <p className="text-lookup-gray text-sm mt-1">
                  Suis des personnes pour voir leurs looks ici
                </p>
                <Link to="/search" className="inline-block mt-3 text-lookup-accent text-sm font-medium">
                  Rechercher des amis
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {friendsFeed.map((look) => (
                  <Link
                    key={look.id}
                    to={`/look/${look.id}`}
                    className="block rounded-2xl overflow-hidden shadow-glass bg-white"
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
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-16">
                        <div className="flex items-center gap-2">
                          {look.user?.avatar_url && (
                            <img
                              src={getPhotoUrl(look.user.avatar_url)}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border-2 border-white"
                            />
                          )}
                          <p className="text-white font-bold text-lg">{look.user?.username}</p>
                        </div>
                        {look.title && (
                          <p className="text-white/90 text-sm mt-1">{look.title}</p>
                        )}
                        <div className="flex items-center gap-1 text-white/70 text-xs mt-1.5">
                          <Clock size={12} />
                          <span>{getTimeAgo(look.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Eye size={16} />
                          <span className="text-sm">{look.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-lookup-gray">
                          <Heart size={16} />
                          <span className="text-sm">{look.likes_count || 0}</span>
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

      {/* Mes looks — section compacte en bas */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wider">
            Mes looks {todayLooks.length > 0 && `(${todayLooks.length})`}
          </h2>
          <Link to="/add-look" className="flex items-center gap-1 text-lookup-accent text-sm font-medium">
            <Plus size={14} />
            Ajouter
          </Link>
        </div>

        {todayLooks.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {todayLooks.map((look) => (
              <Link
                key={look.id}
                to={`/edit-look/${look.id}`}
                className="flex-shrink-0 snap-start"
              >
                <div className="rounded-xl overflow-hidden shadow-sm bg-white w-28">
                  <img
                    src={getPhotoUrl(look.photo_url)}
                    alt="Mon look"
                    className="w-28 h-36 object-cover bg-gray-100"
                    loading="lazy"
                  />
                  <div className="p-2">
                    <p className="text-xs text-lookup-black font-medium truncate">
                      {look.title || 'Sans titre'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5 text-lookup-gray text-[10px]">
                        <Eye size={9} />
                        <span>{look.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-lookup-gray text-[10px]">
                        <Heart size={9} />
                        <span>{look.likes_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/add-look" className="flex-shrink-0 snap-start">
              <div className="rounded-xl overflow-hidden bg-white w-28 h-[184px] flex flex-col items-center justify-center border-2 border-dashed border-lookup-gray-light">
                <div className="w-8 h-8 bg-lookup-mint-light rounded-full flex items-center justify-center mb-1.5">
                  <Plus size={16} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-gray text-xs">Ajouter</p>
              </div>
            </Link>
          </div>
        ) : (
          <Link to="/add-look" className="block">
            <div className="glass rounded-xl p-4 text-center shadow-glass flex items-center gap-4">
              <div className="w-12 h-12 bg-lookup-mint-light rounded-full flex items-center justify-center flex-shrink-0">
                <Plus size={20} className="text-lookup-mint" />
              </div>
              <div className="text-left">
                <p className="text-lookup-black font-medium text-sm">Publie ton look du jour</p>
                <p className="text-lookup-gray text-xs mt-0.5">Pour être visible par ceux que tu croises</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
    </PullToRefresh>
  )
}
