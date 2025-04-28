import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../css/ManageMedia.css';

export default function ManageMedia() {
  const [mediaList, setMediaList] = useState([]);
  const [toast, setToast] = useState('');

  const fetchMedia = async () => {
    try {
      const res = await axios.get('/api/media');
      setMediaList(res.data.data);
    } catch (error) {
      console.error('Fetch media failed', error);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpdate = async (id, newTitle, newCaption) => {
    try {
      await axios.patch(`/api/media/${id}`, {
        title: newTitle,
        caption: newCaption,
      });
      setToast('✅ Media updated!');
      fetchMedia();
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this media?')) {
      try {
        await axios.delete(`/api/media/${id}`);
        setToast('🗑️ Deleted!');
        fetchMedia();
        setTimeout(() => setToast(''), 3000);
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  return (
    <div className="manage-wrapper container py-5">
      {toast && <div className="alert alert-success text-center">{toast}</div>}
      <h2 className="text-center text-white mb-5">🛠 Manage Park Media</h2>
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
  );
}

function MediaCard({ item, onUpdate, onDelete }) {
  const [title, setTitle] = useState(item.title);
  const [caption, setCaption] = useState(item.caption);

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card bg-dark text-white shadow">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.caption} className="card-img-top" />
        ) : (
          <video src={item.url} controls className="card-img-top" />
        )}
        <div className="card-body">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control mb-2 text-dark"
            placeholder="Edit title..."
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="form-control mb-2 text-dark"
            placeholder="Edit caption..."
          />
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm w-50"
              onClick={() => onUpdate(item.id, title, caption)}
            >
              Update
            </button>
            <button
              className="btn btn-danger btn-sm w-50"
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
