import React, { useState } from 'react';
import axios from 'axios';

const ReminderSettings = () => {
  const [daysBefore, setDaysBefore] = useState(7);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/reminder-settings',
        { days_before: daysBefore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Reminder settings updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to update reminder settings.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Send Reminder Before (Days):</label>
        <input
          type="number"
          value={daysBefore}
          onChange={(e) => setDaysBefore(e.target.value)}
          min="1"
        />
      </div>
      <button type="submit">Update Reminder Settings</button>
    </form>
  );
};

export default ReminderSettings;