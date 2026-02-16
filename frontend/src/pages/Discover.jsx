import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Search, Heart, Eye, Compass, Filter } from 'lucide-react'
import { discoverLooks, getPhotoUrl, likeLook } from '../api/client'
import toast from 'react-hot-toast'

// ===== DEMO MODE — Pour screenshots App Store =====
const DEMO_MODE = false

const MOCK_DISCOVER = [
  {
    id: 401, title: 'All black everything',
    photo_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop'],
    user: { username: 'user.marie', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    views_count: 312, likes_count: 145,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    items: [{ category: 'outerwear', brand: 'The Kooples', color: 'Noir' }, { category: 'shoes', brand: 'Dr Martens', color: 'Noir' }]
  },
  {
    id: 402, title: 'Streetwear Paris',
    photo_url: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&h=500&fit=crop'],
    user: { username: 'user.lucas', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    views_count: 234, likes_count: 98,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    items: [{ category: 'top', brand: 'Stussy', color: 'Blanc' }, { category: 'shoes', brand: 'Nike Dunk', color: 'Blanc' }]
  },
  {
    id: 403, title: 'Boheme chic',
    photo_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop'],
    user: { username: 'user.sofia', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    views_count: 289, likes_count: 134,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    items: [{ category: 'outerwear', brand: 'Sezane', color: 'Beige' }, { category: 'accessory', brand: 'Polene', color: 'Camel' }]
  },
  {
    id: 404, title: 'Casual Friday',
    photo_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=500&fit=crop'],
    user: { username: 'user.theo', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    views_count: 178, likes_count: 67,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    items: [{ category: 'outerwear', brand: 'Carhartt WIP', color: 'Kaki' }, { category: 'bottom', brand: "Levi's", color: 'Bleu' }]
  },
  {
    id: 405, title: 'Minimaliste',
    photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'],
    user: { username: 'user.chloe', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face' },
    views_count: 267, likes_count: 112,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    items: [{ category: 'top', brand: 'COS', color: 'Blanc' }, { category: 'bottom', brand: 'Uniqlo', color: 'Noir' }]
  },
  {
    id: 406, title: 'Sport luxe',
    photo_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
    photo_urls: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop'],
    user: { username: 'user.alex', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
    views_count: 198, likes_count: 87,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    items: [{ category: 'outerwear', brand: 'Stone Island', color: 'Noir' }, { category: 'shoes', brand: 'Nike Air Max', color: 'Blanc' }]
  },
]
// ===== FIN DEMO MODE =====

export default function Discover() {
  const navigate = useNavigate()
  const [looks, setLooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('week')
  const [likedIds, setLikedIds] = useState(new Set())

  useEffect(() => {
    loadLooks()
  }, [period])

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLooks()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadLooks = async () => {
    if (DEMO_MODE) {
      // Filtrer les mock data selon la recherche
      if (search) {
        const filtered = MOCK_DISCOVER.filter(l =>
          l.title?.toLowerCase().includes(search.toLowerCase()) ||
          l.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
          l.items?.some(i => i.brand?.toLowerCase().includes(search.toLowerCase()))
        )
        setLooks(filtered)
      } else {
        setLooks(MOCK_DISCOVER)
      }
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await discoverLooks({ q: search || undefined, period })
      setLooks(data || [])
    } catch (error) {
      console.error('Erreur discover:', error)
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (e, lookId) => {
    e.preventDefault()
    e.stopPropagation()

    if (likedIds.has(lookId)) return

    setLikedIds(prev => new Set([...prev, lookId]))
    setLooks(prev => prev.map(l =>
      l.id === lookId ? { ...l, likes_count: (l.likes_count || 0) + 1 } : l
    ))

    if (!DEMO_MODE) {
      try {
        await likeLook(lookId)
      } catch (e) {
        // Revert on error
        setLikedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(lookId)
          return newSet
        })
        setLooks(prev => prev.map(l =>
          l.id === lookId ? { ...l, likes_count: (l.likes_count || 0) - 1 } : l
        ))
      }
    }
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="glass-strong px-4 pb-3 rounded-b-3xl shadow-glass sticky top-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="w-9"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black dark:text-white">LOOKUP</span>
          </div>
          <div className="w-9"></div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lookup-gray" />
          <input
            type="text"
            placeholder="Recherche un event, une marque, un style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-800 rounded-xl pl-11 pr-4 py-3 text-lookup-black dark:text-white border border-lookup-gray-light dark:border-neutral-700 placeholder-lookup-gray/60 text-sm"
          />
        </div>
      </div>

      {/* Title + Filters */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-lookup-black dark:text-white">Decouvrir</h1>
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-lookup-mint" />
          </div>
        </div>

        {/* Period filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: 'week', label: 'Cette semaine' },
            { id: 'month', label: 'Ce mois' },
            { id: 'all', label: 'Tout' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                period === p.id
                  ? 'bg-lookup-mint text-white animate-tab-active'
                  : 'bg-lookup-cream dark:bg-neutral-800 text-lookup-gray'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : looks.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center shadow-glass">
            <div className="w-16 h-16 bg-lookup-mint-light dark:bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Compass size={28} className="text-lookup-mint" />
            </div>
            <p className="text-lookup-black dark:text-white font-medium">
              {search ? 'Aucun look trouve' : 'Aucun look populaire'}
            </p>
            <p className="text-lookup-gray text-sm mt-1">
              {search
                ? `Essaie avec d'autres mots-cles`
                : 'Les looks les plus likes apparaitront ici'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {looks.map((look, index) => (
              <Link
                key={look.id}
                to={`/look/${look.id}`}
                className="glass rounded-2xl overflow-hidden shadow-glass animate-card-enter"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative">
                  <img
                    src={getPhotoUrl(look.photo_urls?.[0] || look.photo_url)}
                    alt=""
                    className="w-full aspect-[3/4] object-cover bg-gray-100"
                  />

                  {/* Like button */}
                  <button
                    onClick={(e) => handleLike(e, look.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition ${
                      likedIds.has(look.id)
                        ? 'bg-red-500 text-white animate-like-bounce'
                        : 'bg-black/30 text-white'
                    }`}
                  >
                    <Heart size={16} fill={likedIds.has(look.id) ? 'white' : 'none'} />
                  </button>

                  {/* Username badge */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 w-fit max-w-full">
                      {look.user?.avatar_url ? (
                        <img src={getPhotoUrl(look.user.avatar_url)} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-lookup-mint flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {look.user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-white text-xs font-medium truncate">{look.user?.username}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-lookup-black dark:text-white text-sm truncate">
                    {look.title || 'Look'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-lookup-gray text-xs">
                      <Heart size={12} />
                      <span>{look.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-lookup-gray text-xs">
                      <Eye size={12} />
                      <span>{look.views_count || 0}</span>
                    </div>
                  </div>
                  {/* Brands */}
                  {look.items && look.items.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {look.items.slice(0, 2).map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-lookup-cream dark:bg-neutral-700 text-lookup-gray px-1.5 py-0.5 rounded-full"
                        >
                          {item.brand}
                        </span>
                      ))}
                      {look.items.length > 2 && (
                        <span className="text-[10px] text-lookup-gray">
                          +{look.items.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
