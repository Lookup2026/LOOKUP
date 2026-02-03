import { useState } from 'react'
import { MapPin, Clock, Eye, Heart } from 'lucide-react'
import PhotoCarousel from './PhotoCarousel'
import { getPhotoUrl } from '../api/client'

export default function FeedCard({
  type, // 'crossing' or 'look'
  item,
  onTap,
  heartAnimation,
  getTimeAgo,
  getApproxLocation
}) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const isCrossing = type === 'crossing'
  const itemKey = `${type}-${item.id}`

  // Déterminer les photos
  const photoUrls = isCrossing
    ? (item.other_look_photo_urls?.length > 0 ? item.other_look_photo_urls : (item.other_look_photo_url ? [item.other_look_photo_url] : []))
    : (item.photo_urls?.length > 0 ? item.photo_urls : (item.photo_url ? [item.photo_url] : []))

  const hasPhotos = photoUrls.length > 0
  const showOverlay = currentSlide === 0

  return (
    <div
      onClick={(e) => onTap(e, type, item.id, isCrossing ? `/crossings/${item.id}` : `/look/${item.id}`)}
      className="block glass rounded-2xl overflow-hidden shadow-glass cursor-pointer"
    >
      <div className="relative">
        {hasPhotos ? (
          <PhotoCarousel
            itemId={itemKey}
            photoUrls={photoUrls}
            className="w-full aspect-[4/5]"
            imgClassName="w-full aspect-[4/5] object-cover bg-gray-100"
            onSlideChange={(index) => setCurrentSlide(index)}
          />
        ) : (
          <div className="w-full aspect-[4/5] bg-lookup-mint-light flex items-center justify-center">
            {isCrossing ? (
              <MapPin size={48} className="text-lookup-mint" />
            ) : (
              <Heart size={48} className="text-lookup-mint" />
            )}
          </div>
        )}

        {/* Heart animation on double tap */}
        {heartAnimation === itemKey && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Heart size={80} className="text-white drop-shadow-lg animate-heart-pop" fill="white" />
          </div>
        )}

        {/* Overlays - visible seulement sur la première photo */}
        {isCrossing ? (
          <>
            {/* Username en haut à gauche */}
            <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
              {item.other_avatar_url ? (
                <img src={getPhotoUrl(item.other_avatar_url)} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-lookup-mint flex items-center justify-center text-white text-xs font-bold">
                  {item.other_username?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-white text-sm font-medium">{item.other_username}</span>
            </div>
            {/* Gradient infos */}
            <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-white font-semibold text-lg">{item.other_look_title || 'Look du jour'}</p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <Clock size={14} />
                  <span>{getTimeAgo(item.crossed_at)}</span>
                </div>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <MapPin size={14} />
                  <span>{getApproxLocation(item)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Look overlay */
          <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              {item.user?.avatar_url && (
                <img
                  src={getPhotoUrl(item.user.avatar_url)}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
              )}
              <p className="text-white font-semibold text-lg">{item.user?.username}</p>
            </div>
            {item.title && (
              <p className="text-white/90 text-sm">{item.title}</p>
            )}
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <Clock size={14} />
                <span>{getTimeAgo(item.created_at)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-lookup-gray">
            <Eye size={18} />
            <span className="text-sm font-medium">{item.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-lookup-gray">
            <Heart size={18} />
            <span className="text-sm font-medium">{item.likes_count || 0}</span>
          </div>
        </div>
        {isCrossing ? (
          <span className="text-lookup-mint text-sm font-medium">Voir les détails</span>
        ) : (
          item.items?.length > 0 && (
            <span className="text-lookup-gray text-xs">
              {item.items.map(i => i.brand).filter(Boolean).join(', ')}
            </span>
          )
        )}
      </div>
    </div>
  )
}
