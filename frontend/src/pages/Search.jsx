import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search as SearchIcon, UserPlus, UserCheck } from 'lucide-react'
import { searchUsers, followUser, getPhotoUrl } from '../api/client'
import toast from 'react-hot-toast'

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [followingMap, setFollowingMap] = useState({})

  const handleSearch = async (q) => {
    setQuery(q)
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    try {
      const { data } = await searchUsers(q)
      setResults(data || [])
      // Initialiser le map de suivi
      const map = {}
      data?.forEach(user => {
        map[user.id] = user.is_following
      })
      setFollowingMap(map)
      setSearched(true)
    } catch (error) {
      console.error('Erreur recherche:', error)
      toast.error('Erreur de recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (userId, username) => {
    try {
      const { data } = await followUser(userId)
      setFollowingMap(prev => ({ ...prev, [userId]: data.following }))
      toast.success(data.following ? `Tu suis ${username}` : `Tu ne suis plus ${username}`)
    } catch (error) {
      toast.error('Erreur')
    }
  }

  return (
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lookup-gray" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-lookup-cream rounded-full text-sm text-lookup-black placeholder:text-lookup-gray focus:outline-none focus:ring-2 focus:ring-lookup-mint/30"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-3 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-lookup-cream rounded-full mx-auto mb-3 flex items-center justify-center">
              <SearchIcon size={24} className="text-lookup-gray" />
            </div>
            <p className="text-lookup-black font-medium">Aucun résultat</p>
            <p className="text-lookup-gray text-sm mt-1">
              Aucun utilisateur trouvé pour "{query}"
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                {user.avatar_url ? (
                  <img
                    src={getPhotoUrl(user.avatar_url)}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white font-bold text-lg">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-lookup-black">{user.username}</p>
                </div>
                <button
                  onClick={() => handleFollow(user.id, user.username)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition active:scale-95 ${
                    followingMap[user.id]
                      ? 'bg-lookup-cream text-lookup-gray border border-gray-200'
                      : 'bg-lookup-mint text-white'
                  }`}
                >
                  {followingMap[user.id] ? (
                    <>
                      <UserCheck size={14} />
                      <span>Suivi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Suivre</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-lookup-mint-light rounded-full mx-auto mb-4 flex items-center justify-center">
              <SearchIcon size={28} className="text-lookup-mint" />
            </div>
            <p className="text-lookup-gray text-sm">
              Tape au moins 2 caractères pour rechercher
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
