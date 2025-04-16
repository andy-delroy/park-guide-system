import React, { useState } from 'react';
import axios from 'axios';

const CertificationUploadForm = () => {
  const [formData, setFormData] = useState({
    type: '',
    expiry_date: '',
    certificate_file_url: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await axios.post('/api/guide-certifications', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Certification uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to upload certification.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Type:</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Expiry Date:</label>
        <input
          type="date"
          name="expiry_date"
          value={formData.expiry_date}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Certificate File URL:</label>
        <input
          type="url"
          name="certificate_file_url"
          value={formData.certificate_file_url}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Upload Certification</button>
    </form>
  );
};

export default CertificationUploadForm;