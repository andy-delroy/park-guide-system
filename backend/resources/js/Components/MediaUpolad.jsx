import React, { useState } from 'react';
import axios from 'axios';

const MediaUpload = () => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [parkId, setParkId] = useState('');
  const [type, setType] = useState('image'); // image or video
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !caption || !parkId) return alert('All fields are required.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('type', type);
    formData.append('park_id', parkId);

    try {
      const res = await axios.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Media uploaded!');
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Media</h2>
      <input type="file" onChange={handleFileChange} accept="image/*,video/*" />
      {preview && <div><strong>Preview:</strong><br /><img src={preview} alt="preview" width="200" /></div>}
      <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
      <input type="text" value={parkId} onChange={(e) => setParkId(e.target.value)} placeholder="Park ID" />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      <button type="submit">Upload</button>
    </form>
  );
};

export default MediaUpload;
