import { useRef, useState } from 'react'
import { X, Download, Instagram, MapPin, Heart, Eye } from 'lucide-react'
import html2canvas from 'html2canvas'
import { getPhotoUrl } from '../api/client'

export default function ShareCard({ crossing, look, user, stats, onClose }) {
  const cardRef = useRef(null)
  const [generating, setGenerating] = useState(false)

  const generateImage = async () => {
    if (!cardRef.current) return null

    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1A1A1A',
      })
      return canvas
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `lookup-${user?.username || 'look'}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const canvas = await generateImage()
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], 'lookup-story.png', { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Mon croisement LOOKUP',
            text: `J'ai croise ${user?.username} sur LOOKUP !`,
          })
        } else {
          // Fallback: download
          handleDownload()
        }
      }, 'image/png')
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleDownload()
      }
    }
  }

  // Get brands from look items
  const brands = look?.items?.map(i => i.brand).filter(Boolean).slice(0, 3) || []

  // Format date
  const crossedDate = crossing?.crossed_at
    ? new Date(crossing.crossed_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] px-4">
      <div className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lookup-black">Partager sur Story</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-4 bg-gray-100 flex justify-center overflow-auto">
          <div
            ref={cardRef}
            className="w-[270px] h-[480px] bg-[#1A1A1A] rounded-3xl overflow-hidden relative flex flex-col"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* Photo */}
            <div className="flex-1 relative">
              {look?.photo_url ? (
                <img
                  src={getPhotoUrl(look.photo_url)}
                  alt=""
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <MapPin size={48} className="text-gray-600" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Username */}
                <div className="flex items-center gap-2 mb-2">
                  {user?.avatar_url ? (
                    <img
                      src={getPhotoUrl(user.avatar_url)}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-white font-semibold text-lg">{user?.username}</span>
                </div>

                {/* Look title */}
                {look?.title && (
                  <p className="text-white/90 text-sm mb-2">{look.title}</p>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {brands.map((brand, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-white/80 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{crossing?.location_name || 'Paris'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart size={12} />
                    <span>{stats?.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{stats?.views_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer branding */}
            <div className="bg-[#1A1A1A] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <MapPin size={12} className="text-[#1A1A1A]" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide">LOOKUP</span>
              </div>
              <span className="text-white/50 text-xs">{crossedDate}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleShare}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold py-3.5 rounded-full"
          >
            <Instagram size={20} />
            <span>{generating ? 'Generation...' : 'Partager sur Instagram'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-lookup-black font-semibold py-3.5 rounded-full"
          >
            <Download size={20} />
            <span>Telecharger l'image</span>
          </button>
        </div>
      </div>
    </div>
  )
}
