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
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement?.classList.add('bg-lookup-mint-light')
        }}
      />
    )
  }

  return (
    <div>
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
        threshold={20}
        touchAngle={30}
        speed={300}
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
              onError={(e) => {
                e.target.style.opacity = '0'
                e.target.parentElement?.classList.add('bg-lookup-mint-light')
              }}
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
        `}</style>
      </Swiper>
    </div>
  )
}
