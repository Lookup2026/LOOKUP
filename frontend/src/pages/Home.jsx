import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, MapPin, ChevronRight, Settings } from 'lucide-react'
import { getTodayLook, deleteLook, getPhotoUrl } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import toast from 'react-hot-toast'

export default function Home() {
  const { sendPing } = useLocationStore()
  const [todayLook, setTodayLook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Send ping on load
    sendPing().catch(() => {})
  }, [])

  const loadData = async () => {
    try {
      const lookRes = await getTodayLook()
      setTodayLook(lookRes.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!todayLook) return
    if (!confirm('Supprimer ce look ?')) return

    try {
      await deleteLook(todayLook.id)
      setTodayLook(null)
      toast.success('Look supprime')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

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
        Mon look du jour
      </h1>

      {/* Look Card */}
      <div className="px-4">
        {todayLook ? (
          <div className="bg-lookup-mint-light rounded-3xl overflow-hidden">
            {/* Photo */}
            <div className="relative aspect-[3/4] max-h-[400px]">
              <img
                src={getPhotoUrl(todayLook.photo_url)}
                alt="Mon look"
                className="w-full h-full object-cover"
              />
              {/* Arrow button */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Link
                  to="/crossings"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <ChevronRight size={20} className="text-lookup-black" />
                </Link>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-lookup-black font-semibold capitalize">{dateStr}</p>
              <div className="flex items-center gap-1 text-lookup-gray text-sm mt-1">
                <MapPin size={14} />
                <span>Pret a etre croise</span>
              </div>

              <p className="text-lookup-gray text-sm mt-3">
                Look publie, explorez et decouvrez d'autres passionnes de mode autour de vous
              </p>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  to="/add-look"
                  className="flex-1 py-3 px-4 bg-white rounded-full text-center font-medium text-lookup-black border border-lookup-gray-light"
                >
                  Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-white rounded-full text-center font-medium text-lookup-black border border-lookup-gray-light"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-lookup-mint-light rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-lookup-mint/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin size={32} className="text-lookup-mint" />
            </div>
            <h3 className="text-lg font-semibold text-lookup-black mb-2">
              Aucun look aujourd'hui
            </h3>
            <p className="text-lookup-gray text-sm mb-6">
              Publie ton look du jour pour que d'autres passionnes de mode puissent te croiser
            </p>
            <Link
              to="/add-look"
              className="inline-block bg-lookup-mint text-white font-semibold py-3 px-8 rounded-full shadow-button"
            >
              Ajouter mon look
            </Link>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="px-4 mt-6">
        <Link
          to="/crossings"
          className="block w-full bg-lookup-mint text-white font-semibold py-4 rounded-full text-center shadow-button"
        >
          Explorer les looks croises
        </Link>
      </div>
    </div>
  )
}
