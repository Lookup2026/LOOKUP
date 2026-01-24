import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Eye, Heart, Settings } from 'lucide-react'
import { getMyCrossings, getPhotoUrl } from '../api/client'
import toast from 'react-hot-toast'

export default function Crossings() {
  const [crossings, setCrossings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCrossings()
  }, [])

  const loadCrossings = async () => {
    try {
      const { data } = await getMyCrossings()
      setCrossings(data)
    } catch (error) {
      console.error('Erreur:', error)
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

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return crossed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link to="/settings" className="w-8 h-8 bg-lookup-cream rounded-full flex items-center justify-center">
          <Settings size={18} className="text-lookup-gray" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </div>
          <span className="text-lg font-bold text-lookup-black">LOOKUP</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-lookup-black px-4 mt-4 mb-6">
        Looks croises aujourd'hui
      </h1>

      {crossings.length === 0 ? (
        <div className="px-4">
          <div className="bg-lookup-mint-light rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-lookup-mint/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin size={32} className="text-lookup-mint" />
            </div>
            <h3 className="text-lg font-semibold text-lookup-black mb-2">
              Aucun croisement
            </h3>
            <p className="text-lookup-gray text-sm mb-6">
              Deplacez-vous pour croiser d'autres passionnes de mode !
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid of crossings */}
          <div className="px-4 grid grid-cols-2 gap-3">
            {crossings.slice(0, 4).map((crossing) => (
              <Link
                key={crossing.id}
                to={`/crossings/${crossing.id}`}
                className="bg-lookup-mint-light rounded-2xl overflow-hidden"
              >
                {crossing.other_look_photo_url ? (
                  <div className="aspect-square">
                    <img
                      src={getPhotoUrl(crossing.other_look_photo_url)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-lookup-mint/20 flex items-center justify-center">
                    <MapPin size={32} className="text-lookup-mint" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-lookup-black">
                    {crossing.other_username}
                  </p>
                  <div className="flex items-center gap-1 text-lookup-gray text-xs mt-1">
                    <Clock size={12} />
                    <span>{getTimeAgo(crossing.crossed_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats section */}
          {crossings.length > 0 && (
            <div className="px-4 mt-6">
              <div className="bg-lookup-cream rounded-2xl p-4">
                <div className="flex justify-around">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Eye size={18} className="text-lookup-mint" />
                      <span className="text-xl font-bold text-lookup-black">
                        {crossings.length}
                      </span>
                    </div>
                    <p className="text-xs text-lookup-gray">looks croises</p>
                  </div>
                  <div className="w-px bg-lookup-gray-light"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Heart size={18} className="text-pink-400" />
                      <span className="text-xl font-bold text-lookup-black">
                        {crossings.reduce((sum, c) => sum + (c.likes_count || 0), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-lookup-gray">likes recus</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* More crossings list */}
          {crossings.length > 4 && (
            <div className="px-4 mt-6">
              <h2 className="font-semibold text-lookup-black mb-3">
                Autres croisements
              </h2>
              <div className="space-y-2">
                {crossings.slice(4).map((crossing) => (
                  <Link
                    key={crossing.id}
                    to={`/crossings/${crossing.id}`}
                    className="flex items-center justify-between bg-lookup-cream rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      {crossing.other_look_photo_url ? (
                        <img
                          src={getPhotoUrl(crossing.other_look_photo_url)}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-lookup-mint-light flex items-center justify-center">
                          <MapPin size={20} className="text-lookup-mint" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-lookup-black">
                          {crossing.other_username}
                        </p>
                        <p className="text-xs text-lookup-gray">
                          {getTimeAgo(crossing.crossed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye size={14} className="text-lookup-gray" />
                        <span className="text-sm text-lookup-gray">
                          {crossing.views_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-pink-400" />
                        <span className="text-sm text-lookup-gray">
                          {crossing.likes_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CTA Button */}
      <div className="px-4 mt-6">
        <Link
          to="/"
          className="block w-full bg-lookup-mint text-white font-semibold py-4 rounded-full text-center shadow-button"
        >
          Retour a l'accueil
        </Link>
      </div>
    </div>
  )
}
