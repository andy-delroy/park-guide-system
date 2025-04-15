import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MediaGallery = () => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    axios.get('/api/media')
      .then(res => setMedia(res.data.data)) // assuming API returns { data: [...] }
      .catch(err => console.error('Failed to load media:', err));
  }, []);

  return (
    <div>
      <h2>Park Media Gallery</h2>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {media.map(item => (
          <div key={item.id}>
            {item.type === 'image' ? (
              <img src={item.url} alt={item.caption} width="200" />
            ) : (
              <video controls width="200">
                <source src={item.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <p>{item.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
