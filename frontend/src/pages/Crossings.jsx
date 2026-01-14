import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, MapPin } from 'lucide-react'
import { getMyCrossings } from '../api/client'

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
    } finally {
      setLoading(false)
    }
  }

  // Grouper par date
  const groupedCrossings = crossings.reduce((acc, crossing) => {
    const date = new Date(crossing.crossed_at).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(crossing)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Looks croises</h1>

      {crossings.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun croisement pour le moment</p>
          <p className="text-gray-500 text-sm mt-2">
            Activez la detection pour voir les looks autour de vous
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedCrossings).map(([date, dateCrossings]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                {date}
              </h2>
              <div className="space-y-2">
                {dateCrossings.map((crossing) => (
                  <Link
                    key={crossing.id}
                    to={`/crossings/${crossing.id}`}
                    className="flex items-center gap-4 bg-lookup-gray rounded-xl p-4 hover:bg-lookup-light-gray transition"
                  >
                    {crossing.other_look_photo_url ? (
                      <img
                        src={crossing.other_look_photo_url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-lookup-light-gray flex items-center justify-center">
                        <Camera size={24} className="text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {crossing.other_username}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(crossing.crossed_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {crossing.location_name && ` - ${crossing.location_name}`}
                      </p>
                      {crossing.other_look_items?.length > 0 && (
                        <p className="text-lookup-accent text-xs mt-1">
                          {crossing.other_look_items
                            .slice(0, 2)
                            .map((item) => item.brand || item.category)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
