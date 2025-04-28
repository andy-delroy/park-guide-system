import React, { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import '../../../css/Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [parkId, setParkId] = useState('');
  const [type, setType] = useState('image');
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    if (selected?.type.startsWith('video/')) setType('video');
    else setType('image');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('caption', caption);
    formData.append('type', type);
    formData.append('park_id', parkId);

    Inertia.post('/api/media/upload', formData, {
      onSuccess: () => {
        setToast('✅ Media uploaded successfully!');
        setFile(null);
        setPreview(null);
        setTitle('');
        setCaption('');
        setParkId('');
        setType('image');
        setTimeout(() => setToast(''), 3000);
      },
    });
  };

  return (
    <div className="video-wrapper">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/videos/AdobeStock_368350463.mov" type="video/quicktime" />
      </video>

      <div className="overlay">
        <div className="upload-scroll-wrapper container py-5">
          {toast && <div className="alert alert-success text-center">{toast}</div>}

          <h2 className="text-white text-center mb-4">📤 Upload Park Media</h2>

          <form onSubmit={handleSubmit} className="bg-dark text-white p-4 rounded shadow-lg mb-5">
            <div className="mb-3">
              <label className="form-label">Choose File</label>
              <input type="file" className="form-control" onChange={handleFileChange} required />
            </div>

            {preview && (
              <div className="mb-3 text-center">
                {type === 'image' ? (
                  <img src={preview} alt="preview" className="img-fluid rounded shadow-sm" />
                ) : (
                  <video src={preview} controls className="w-100 rounded shadow-sm" />
                )}
              </div>
            )}

            <input
              type="text"
              placeholder="Title (e.g. 'Sunset Over Pine Ridge')"
              className="form-control mb-3 text-dark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Write a detailed caption or story behind the media..."
              className="form-control mb-3 text-dark"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            ></textarea>

            <input
              type="number"
              placeholder="Park ID"
              className="form-control mb-3 text-dark"
              value={parkId}
              onChange={(e) => setParkId(e.target.value)}
              required
            />

            <select
              className="form-select mb-3 text-dark"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            <button type="submit" className="btn btn-success w-100">
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
