import { useId } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { getPhotoUrl } from '../api/client'

import 'swiper/css'
import 'swiper/css/pagination'

export default function PhotoCarousel({
  photoUrls,
  className = '',
  imgClassName = '',
  alt = '',
  onSlideChange = null,
  itemId = ''
}) {
  const uniqueId = useId()
  const carouselId = itemId || uniqueId

  // Si une seule photo ou pas de photos, afficher une simple image
  if (!photoUrls || photoUrls.length === 0) return null

  if (photoUrls.length === 1) {
    return (
      <img
        src={getPhotoUrl(photoUrls[0])}
        alt={alt}
        className={imgClassName || className}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className="swiper-container-isolated"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <Swiper
        modules={[Pagination]}
        pagination={{
          clickable: true,
          bulletClass: `swiper-pagination-bullet swiper-bullet-${carouselId}`,
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        spaceBetween={0}
        slidesPerView={1}
        className={`photo-carousel photo-carousel-${carouselId} ${className}`}
        nested={true}
        touchEventsTarget="container"
        preventInteractionOnTransition={true}
        simulateTouch={true}
        allowTouchMove={true}
        onSlideChange={(swiper) => {
          if (onSlideChange) onSlideChange(swiper.activeIndex)
        }}
      >
        {photoUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <img
              src={getPhotoUrl(url)}
              alt={`${alt} ${index + 1}`}
              className={imgClassName || 'w-full h-full object-cover'}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </SwiperSlide>
        ))}

        <style>{`
          .photo-carousel .swiper-pagination-bullet {
            background: white;
            opacity: 0.5;
            width: 7px;
            height: 7px;
            transition: all 0.3s;
          }
          .photo-carousel .swiper-pagination-bullet-active {
            background: #609966;
            opacity: 1;
            width: 20px;
            border-radius: 4px;
          }
          .swiper-container-isolated {
            touch-action: pan-x;
            isolation: isolate;
          }
        `}</style>
      </Swiper>
    </div>
  )
}
