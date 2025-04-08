import React, { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import './Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [parkId, setParkId] = useState('');
  const [type, setType] = useState('image');
  const [preview, setPreview] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [toast, setToast] = useState('');

  const fetchMedia = () => {
    axios.get('/api/media').then((res) => setMediaList(res.data.data));
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('type', type);
    formData.append('park_id', parkId);

    Inertia.post('/api/media', formData, {
      onSuccess: () => {
        setToast('✅ Media uploaded successfully!');
        setFile(null);
        setPreview(null);
        setCaption('');
        setParkId('');
        setType('image');
        fetchMedia();
        setTimeout(() => setToast(''), 3000);
      },
    });
  };

  const handleUpdate = (id, newCaption, newFile) => {
    const formData = new FormData();
    if (newCaption) formData.append('caption', newCaption);
    if (newFile) formData.append('file', newFile);

    axios
      .post(`/api/media/${id}?_method=PATCH`, formData)
      .then(() => {
        setToast('✅ Media updated!');
        fetchMedia();
        setTimeout(() => setToast(''), 3000);
      })
      .catch(() => alert('❌ Update failed'));
  };

  const handleDelete = (id) => {
    if (confirm('Delete this media?')) {
      axios.delete(`/api/media/${id}`).then(() => {
        setToast('🗑️ Deleted!');
        fetchMedia();
        setTimeout(() => setToast(''), 3000);
      });
    }
  };

  return (
    <div className="video-wrapper">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/AdobeStock_368350463.mov" type="video/mp4" />
      </video>

      <div className="overlay">
        <div className="upload-scroll-wrapper container py-5">
          {toast && (
            <div className="alert alert-success text-center">{toast}</div>
          )}

          <h2 className="text-white text-center mb-4">📤 Upload Park Media</h2>

          <form onSubmit={handleSubmit} className="bg-dark text-white p-4 rounded shadow-lg mb-5">
            <div className="mb-3">
              <label className="form-label">Choose File</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
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
              placeholder="Caption"
              className="form-control mb-3 text-dark"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <input
              type="number"
              placeholder="Park ID"
              className="form-control mb-3 text-dark"
              value={parkId}
              onChange={(e) => setParkId(e.target.value)}
            />

            <select
              className="form-select mb-3 text-dark"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            <button type="submit" className="btn btn-success w-100">Upload</button>
          </form>

          <div id="media-list" className="bg-dark text-white p-4 rounded shadow">
            <h4 className="mb-4">🖼 Manage Recent Media</h4>

            <div className="row">
              {mediaList.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ item, onUpdate, onDelete }) {
  const [caption, setCaption] = useState(item.caption);
  const [newFile, setNewFile] = useState(null);

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card bg-secondary shadow-sm h-100">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.caption} className="card-img-top" />
        ) : (
          <video src={item.url} controls className="card-img-top" />
        )}
        <div className="card-body">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="form-control mb-2"
          />
          <input
            type="file"
            onChange={(e) => setNewFile(e.target.files[0])}
            className="form-control mb-3"
          />
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={() => onUpdate(item.id, caption, newFile)}
            >
              Update
            </button>
            <button
              className="btn btn-danger btn-sm w-100"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
