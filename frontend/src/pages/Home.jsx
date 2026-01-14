import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, MapPin, RefreshCw } from 'lucide-react'
import { getTodayLook, getMyCrossings } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Home() {
  const { user } = useAuthStore()
  const { isTracking, startTracking, sendPing } = useLocationStore()
  const [todayLook, setTodayLook] = useState(null)
  const [recentCrossings, setRecentCrossings] = useState([])
  const [pinging, setPinging] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [lookRes, crossingsRes] = await Promise.all([
        getTodayLook(),
        getMyCrossings(),
      ])
      setTodayLook(lookRes.data)
      setRecentCrossings(crossingsRes.data.slice(0, 5))
    } catch (error) {
      console.error('Erreur chargement:', error)
    }
  }

  const handlePing = async () => {
    setPinging(true)
    try {
      const result = await sendPing()
      if (result.new_crossings > 0) {
        toast.success(`${result.new_crossings} nouveau(x) croisement(s)!`)
        loadData()
      } else {
        toast.success('Position mise a jour')
      }
    } catch (error) {
      toast.error('Erreur de localisation')
    } finally {
      setPinging(false)
    }
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Salut {user?.full_name || user?.username} !
        </h1>
        <p className="text-gray-400">Pret a croiser des looks ?</p>
      </div>

      {/* Today's Look */}
      <div className="bg-lookup-gray rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Look du jour</h2>
        {todayLook ? (
          <div className="flex items-center gap-4">
            <img
              src={todayLook.photo_url}
              alt="Look du jour"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <p className="text-white">{todayLook.title || 'Mon look'}</p>
              <p className="text-gray-400 text-sm">
                {todayLook.items?.length || 0} pieces
              </p>
            </div>
          </div>
        ) : (
          <Link
            to="/add-look"
            className="flex items-center justify-center gap-2 bg-lookup-light-gray text-white py-4 rounded-lg hover:bg-gray-600 transition"
          >
            <Camera size={20} />
            <span>Ajouter mon look du jour</span>
          </Link>
        )}
      </div>

      {/* Location Ping */}
      <div className="bg-lookup-gray rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Localisation</h2>
        <button
          onClick={handlePing}
          disabled={pinging}
          className="w-full flex items-center justify-center gap-2 bg-lookup-accent text-black font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {pinging ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
          <span>{pinging ? 'Detection...' : 'Detecter les croisements'}</span>
        </button>
        <p className="text-gray-400 text-xs mt-2 text-center">
          Activez pour voir les looks des personnes autour de vous
        </p>
      </div>

      {/* Recent Crossings */}
      <div className="bg-lookup-gray rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white">Croisements recents</h2>
          <Link to="/crossings" className="text-lookup-accent text-sm">
            Voir tout
          </Link>
        </div>
        {recentCrossings.length > 0 ? (
          <div className="space-y-3">
            {recentCrossings.map((crossing) => (
              <Link
                key={crossing.id}
                to={`/crossings/${crossing.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-lookup-light-gray transition"
              >
                {crossing.other_look_photo_url ? (
                  <img
                    src={crossing.other_look_photo_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-lookup-light-gray flex items-center justify-center">
                    <Camera size={20} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-white">{crossing.other_username}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(crossing.crossed_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Aucun croisement pour le moment
          </p>
        )}
      </div>
    </div>
  )
}
