import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CertificationTimeline = ({ isAdmin }) => {
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = isAdmin
          ? '/api/guide-certifications'
          : '/api/my-certifications';
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertifications(response.data);
      } catch (error) {
        console.error(error);
        alert('Failed to fetch certifications.');
      }
    };

    fetchCertifications();
  }, [isAdmin]);

  return (
    <div>
      <h2>Certification Timeline</h2>
      <ul>
        {certifications.map((cert) => (
          <li key={cert.id}>
            <strong>Type:</strong> {cert.type} <br />
            <strong>Expiry Date:</strong> {cert.expiry_date} <br />
            <strong>Certificate File:</strong>{' '}
            <a href={cert.certificate_file_url} target="_blank" rel="noopener noreferrer">
              View File
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationTimeline;