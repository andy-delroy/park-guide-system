// resources/js/Pages/Media/Index.jsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Gallery.css';

export default function MediaGallery() {
  const [mediaList, setMediaList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });
  const audioRef = useRef(null);
  const [reactions, setReactions] = useState({});

  const fetchMedia = () => {
    axios.get('/api/media').then((res) => {
      setMediaList(res.data.data);
    });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleReaction = (id, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [emoji]: (prev[id]?.[emoji] || 0) + 1,
      },
    }));
  };

  const currentMedia = selectedIndex !== null ? mediaList[selectedIndex] : null;

  return (
    <>
      {/* 🌿 Hero Section with Video Background */}
      <div className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/AdobeStock_368350463.mov" type="video/mp4" />
        </video>
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome to the Park Dream Gallery</h1>
          <p className="hero-subtitle">Discover the untamed beauty of our protected parks</p>
        </div>
      </div>

      {/* 🌿 Main Gallery Content */}
      <div className="gallery-wrapper">
        <div className="overlay-content">
          <h2 className="text-center text-white mb-4">📷 Park Dream Gallery</h2>

          {/* 🎵 Nature Audio Toggle */}
          <div className="text-center mb-4">
            <button
              className={`btn btn-sm btn-outline-light toggle-btn ${isAudioPlaying ? 'playing' : ''}`}
              onClick={toggleAudio}
            >
              {isAudioPlaying ? '🔊 Nature Sound: ON' : '🔈 Nature Sound: OFF'}
            </button>
          </div>

          <audio ref={audioRef} loop>
            <source src="/sounds/nature.mp3" type="audio/mpeg" />
          </audio>

          {/* 🖼️ Gallery Grid */}
          <div className="media-swiper">
            <div className="media-grid">
              {mediaList.map((item, idx) => (
                <div className="media-slide" key={item.id} onClick={() => setSelectedIndex(idx)}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.caption} className="gallery-image" />
                  ) : (
                    <video src={item.url} controls className="gallery-image" />
                  )}

                  {/* 📋 Caption Overlay */}
                  <div className="caption-overlay">
                    <p>{item.caption}</p>
                  </div>

                  {/* 💬 Emoji Reactions */}
                  <div className="emoji-reactions">
                    {['👍', '❤️', '😍', '🌿'].map((emoji) => (
                      <span
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(item.id, emoji);
                        }}
                      >
                        {emoji} {reactions[item.id]?.[emoji] || 0}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌱 Stats Section */}
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

        {/* 🖼️ Fullscreen Carousel */}
        {selectedIndex !== null && (
          <div className="media-popup" onClick={() => setSelectedIndex(null)}>
            <div className="popup-content animate-fade-in">
              <button
                className="popup-nav left"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + mediaList.length) % mediaList.length);
                }}
              >
                ◀
              </button>

              {currentMedia.type === 'image' ? (
                <img src={currentMedia.url} alt={currentMedia.caption} />
              ) : (
                <video src={currentMedia.url} controls />
              )}

              <button
                className="popup-nav right"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % mediaList.length);
                }}
              >
                ▶
              </button>

              <div className="popup-caption animate-slide-up">{currentMedia.caption}</div>
              <span className="popup-close">&times;</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
