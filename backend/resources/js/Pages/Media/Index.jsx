import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import SectionCard from '@/Components/SectionCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/parallax';
import 'swiper/css/effect-coverflow';

import SwiperCore from 'swiper';
import { EffectCoverflow, Autoplay } from 'swiper/modules';

SwiperCore.use([EffectCoverflow]);

const MediaIndex = () => {
  const [media, setMedia] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    axios.get('/media')
      .then(res => {
        setMedia(res.data.data || []);
        setUserRole(res.data.meta?.user?.role || null);
      })
      .catch(err => console.error('Error fetching media:', err));
  }, []);

  if (media.length === 0)
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 6h14"
            />
          </svg>
          <p className="text-lg font-medium">No media available.</p>
          {userRole === 'admin' && (
            <Link
              href="/media/create"
              className="inline-block bg-[#00693D] text-white px-5 py-2 rounded-lg shadow hover:bg-green-800 transition"
            >
              + Upload New Media
            </Link>
          )}
        </div>
      </SectionCard>
    );

  return (
    <SectionCard>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Discover the beauty of Sarawak
        </h2>
        {userRole === 'admin' && (
          <Link
            href="/media/create"
            className="bg-[#00693D] text-white px-4 py-2 text-sm rounded-lg shadow hover:bg-green-800 transition"
          >
            + Upload New Media
          </Link>
        )}
      </div>

      <div className="relative">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          slidesPerView={'auto'}
          effect={'coverflow'}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          loop={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className="media-swiper"
        >
          {media.map((item) => (
            <SwiperSlide key={item.id} style={{ width: '80%' }}>
              <div className="overflow-hidden rounded-lg shadow-lg relative">
                <img
                  src={item.url}
                  alt={item.caption || 'Media item'}
                  className="w-full h-[400px] object-cover"
                />
                {item.caption && (
                  <div className="caption-overlay">
                    {item.caption}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        .media-swiper {
          width: 100%;
          height: 450px;
          padding: 0 10%;
        }

        .swiper-slide {
          transition: transform 0.3s ease;
        }

        .swiper-slide-prev,
        .swiper-slide-next {
          opacity: 0.6;
          transform: scale(0.9);
        }

        .swiper-slide-active {
          opacity: 1;
          transform: scale(1);
        }

        .caption-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 1rem;
          font-weight: 500;
          text-align: center;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </SectionCard>
  );
};

export default MediaIndex;
