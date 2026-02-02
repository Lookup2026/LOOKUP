import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import { getPhotoUrl } from '../api/client'

import 'swiper/css'
import 'swiper/css/pagination'

export default function PhotoCarousel({ photoUrls, className = '', imgClassName = '', alt = '' }) {
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
    <Swiper
      modules={[Pagination]}
      pagination={{
        clickable: true,
        bulletClass: 'swiper-pagination-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active',
      }}
      spaceBetween={0}
      slidesPerView={1}
      className={`photo-carousel ${className}`}
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
      `}</style>
    </Swiper>
  )
}
