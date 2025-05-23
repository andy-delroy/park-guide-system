import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import SectionCard from '@/Components/SectionCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/parallax';
import 'swiper/css/effect-coverflow';

import SwiperCore from 'swiper';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import Button from '@/Components/Button';

SwiperCore.use([EffectCoverflow]);

const MediaIndex = () => {
  const [media, setMedia] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const videoSwiperRef = useRef(null); // ref for video swiper

  useEffect(() => {
    axios.get('/media')
      .then(res => {
        setMedia(res.data.data || []);
        setUserRole(res.data.meta?.user?.role || null);
      })
      .catch(err => console.error('Error fetching media:', err));
  }, []);

  // Play the video of the active slide
  const handleSlideChange = () => {
    setTimeout(() => {
      const swiper = videoSwiperRef.current;
      if (!swiper) return;

      // Find the currently active slide's video element
      const currentSlide = swiper.slides[swiper.activeIndex];
      const video = currentSlide.querySelector('video');
      if (video) {
        video.currentTime = 0; // reset to start
        video.play().catch(() => {
          // Autoplay might be blocked on some devices without user interaction
          console.log('Autoplay blocked');
        });
      }
    }, 10); // slight delay ensures DOM is updated
  };

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
          <div className="flex space-x-2">
            <Link
              href="/manage-media"
            >
              <Button type='edit'>
                Manage Media
              </Button>
            </Link>
            <Link
              href="/media/create"
            >
              <Button>
                + Upload New Media
              </Button>
            </Link>
          </div>
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
          allowTouchMove={false}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className="media-swiper"
        >
          {media.filter(item => item.type === 'image').map((item) => (
            <SwiperSlide key={item.id} style={{ width: '80%' }}>
              <div className="overflow-hidden rounded-lg relative">
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

      <div className="relative w-full h-[500px]">
        <Swiper
          onSwiper={(swiper) => (videoSwiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          spaceBetween={0}
          centeredSlides={false}
          slidesPerView={1}
          allowTouchMove={false}
          loop={true}
          autoplay={false}
          className="w-full h-full"
        >
          {media.filter(item => item.type === 'video').map((item) => (
            <SwiperSlide key={item.id} className="w-full h-full">
              <div className="w-full h-full relative overflow-hidden rounded-lg">
                <video
                  src={item.url}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  onEnded={() => {
                    if (videoSwiperRef.current) {
                      videoSwiperRef.current.slideNext();
                    }
                  }}
                />
                {item.caption && (
                  <div className="caption-overlay absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center text-lg font-medium">
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
