import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, Thumbs, EffectFade, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';
import '../../../css/Gallery.css';

export default function MediaGallery() {
  const [mediaList, setMediaList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const progressBarRef = useRef(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  
  // For progress bar animation
  const autoplayDelay = 4000;
  const progressInterval = useRef(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/media');
      setMediaList(res.data.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    
    // Clean up on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleSlideChange = (swiper) => {
    // Reset and start progress bar
    if (progressBarRef.current) {
      const fillElement = progressBarRef.current.querySelector('.swiper-progress-bar-fill');
      fillElement.style.width = '0%';
      
      // Clear previous interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Start new progress animation
      let progress = 0;
      progressInterval.current = setInterval(() => {
        progress += 1;
        if (fillElement) {
          fillElement.style.width = `${progress}%`;
        }
        if (progress >= 100) {
          clearInterval(progressInterval.current);
        }
      }, autoplayDelay / 100);
    }
  };

  const currentMedia = selectedIndex !== null ? mediaList[selectedIndex] : null;

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/videos/AdobeStock_368350463.mov" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to the Semenggoh Wildlife Centre</h1>
          <p className="hero-subtitle">Discover the untamed beauty of our parks</p>
        </div>
      </div>

      <div className="gallery-wrapper">
        <div className="overlay-content">
          <h2>📸 Gallery Showcase</h2>

          {/* Main Swiper Slideshow */}
          <div className="swiper-container">
            <Swiper
              modules={[Autoplay, Navigation, Pagination, EffectFade, Thumbs, Keyboard]}
              spaceBetween={30}
              loop={true}
              autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
              navigation={true}
              pagination={{ clickable: true }}
              effect="fade"
              keyboard={{ enabled: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              onSlideChange={handleSlideChange}
              className="main-swiper"
            >
              {isLoading ? (
                // Loading placeholders
                Array.from({ length: 3 }).map((_, idx) => (
                  <SwiperSlide key={`placeholder-${idx}`}>
                    <div className="media-slide">
                      <div className="gallery-image loading"></div>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                mediaList.map((item, idx) => (
                  <SwiperSlide key={item.id}>
                    <div
                      className="media-slide"
                      onClick={() => setSelectedIndex(idx)}
                      onMouseEnter={(e) => {
                        e.currentTarget.closest('.swiper').swiper.autoplay.stop();
                        const vid = e.currentTarget.querySelector('video');
                        if (vid) vid.play();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.closest('.swiper').swiper.autoplay.start();
                        const vid = e.currentTarget.querySelector('video');
                        if (vid) vid.pause();
                      }}
                    >
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          className="gallery-image" 
                          alt={item.caption || 'Gallery image'} 
                          loading="lazy"
                        />
                      ) : (
                        <video 
                          src={item.url} 
                          className="gallery-image" 
                          muted 
                          loop 
                          preload="metadata"
                        />
                      )}
                      
                      <div className="caption-overlay">
                        {item.title && <h5 className="caption-title">{item.title}</h5>}
                        <p className="caption-text">{item.caption}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))
              )}
            </Swiper>
            
            {/* Progress Bar */}
            <div className="swiper-progress-bar" ref={progressBarRef}>
              <div className="swiper-progress-bar-fill"></div>
            </div>
          </div>
          
          {/* Thumbnails - Only show image thumbnails */}
          {!isLoading && mediaList.length > 0 && (
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={'auto'}
              centeredSlides={true}
              slideToClickedSlide={true}
              watchSlidesProgress={true}
              className="thumbs-swiper"
              breakpoints={{
                320: { slidesPerView: 3 },
                640: { slidesPerView: 4 },
                768: { slidesPerView: 5 },
                1024: { slidesPerView: 6 },
              }}
            >
              {mediaList.map((item, index) => (
                <SwiperSlide key={`thumb-${item.id}`}>
                  {/* Use a placeholder for videos, actual image for photos */}
                  <img 
                    src={item.type === 'image' ? item.url : '/images/video-placeholder.jpg'} 
                    className="thumb-image" 
                    alt={`Thumbnail ${index + 1}`} 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Animated Stats */}
          <div className="stats-section" ref={ref}>
            <div className="stats-background" />
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{inView && <CountUp end={120} duration={2} />}+</div>
                <div className="stat-label">Plant Species</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{inView && <CountUp end={45} duration={2} />}+</div>
                <div className="stat-label">Insect Species</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{inView && <CountUp end={30} duration={2} />}+</div>
                <div className="stat-label">Bird Types</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{inView && <CountUp end={7} duration={2} />}+</div>
                <div className="stat-label">Protected Parks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Lightbox */}
        {currentMedia && (
          <div className="media-popup" onClick={() => setSelectedIndex(null)}>
            <div className="popup-content">
              <button
                className="popup-nav left"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + mediaList.length) % mediaList.length);
                }}
              >◀</button>

              {currentMedia.type === 'image' ? (
                <img src={currentMedia.url} alt={currentMedia.caption || 'Full size image'} />
              ) : (
                <video src={currentMedia.url} controls autoPlay />
              )}

              <button
                className="popup-nav right"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % mediaList.length);
                }}
              >▶</button>

              <div className="popup-caption">
                {currentMedia.title && <h4 className="caption-title">{currentMedia.title}</h4>}
                <p className="caption-text">{currentMedia.caption}</p>
              </div>

              <span className="popup-close" onClick={() => setSelectedIndex(null)}>&times;</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}