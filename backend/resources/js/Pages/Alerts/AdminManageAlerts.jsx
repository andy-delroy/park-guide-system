import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import axios from 'axios';

export default function AdminManageAlerts({ auth, alerts }) {
  const user = auth.user;

  const hasAccess = user.role_name === 'admin' || user.role_name === 'superadmin';

  if (!hasAccess) {
    return (
      <AuthenticatedLayout user={user}>
        <Head title="Access Denied" />
        <div className="p-6 max-w-2xl mx-auto text-center text-red-600 font-semibold text-lg border border-red-300 bg-red-50 rounded">
          Access Denied: You do not have permission to view this page.
        </div>
      </AuthenticatedLayout>
    );
  }

  const [editingId, setEditingId] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const { data, setData, post, put, processing, reset } = useForm({
    message: '',
    type: 'info',
    park_id: null,
    expiry: null,
    roles: [], // Added for automated alert consistency
  });

  const checkWeatherConditions = (temperature, condition) => {
    if (temperature > 25) {
      console.log(`Temperature exceeds 25°C: ${temperature}°C - Alert should be triggered`);
      return true;
    } else if (condition.toLowerCase().includes('rain')) {
      console.log(`Rain detected - Alert should be triggered`);
      return true;
    } else {
      console.log(`Temperature is ${temperature}°C and no rain detected - No alert`);
      return false;
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        console.log('Fetching weather from /weather...');
        const response = await axios.get('/weather');
        const data = response.data;
        console.log('Weather API response:', data);

        if (data.error) {
          throw new Error(data.error);
        }

        const temperature = data.temperature?.degrees ?? data.currentConditions?.temperature ?? data.temperature ?? 0;
        const description = data.weatherCondition?.description?.text ?? data.currentConditions?.condition ?? 'Unknown';
        const humidity = data.relativeHumidity ?? data.currentConditions?.humidity ?? 0;

        console.log('Parsed weather:', { temperature, description, humidity });

        setWeather({
          temperature,
          description,
          humidity,
        });
        setWeatherError(null);

        if (checkWeatherConditions(temperature, description) && !alertSent) {
          console.log('Sending automated alert for temperature or rain');
          // Set form data for automated alert, mimicking manual submission
          setData({
            message: `Alert: Temperature is too high or it's raining! ${temperature}°C | Condition: ${description}`,
            type: 'emergency',
            park_id: null,
            expiry: null,
            roles: ['park_guide', 'visitor'],
          });
          // Trigger submitNew logic
          post('/alerts', {
            preserveScroll: true,
            onSuccess: (response) => {
              console.log('Automated alert sent successfully:', response);
              setAlertSent(true);
              reset();
            },
            onError: (errors) => {
              console.error('Failed to send automated alert:', errors);
            },
          });
        }
      } catch (err) {
        console.error('Weather API error:', err);
        setWeatherError('Failed to fetch weather data.');
      } finally {
        setWeatherLoading(false);
      }
    };

    // Fetch the weather initially when the component mounts
    fetchWeather();

    // Set interval to fetch weather every 15 minutes (900,000 milliseconds)
    const intervalId = setInterval(fetchWeather, 900000);

    // Cleanup interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [post, setData, reset]); // Dependencies include setData and reset for form updates

  const startEdit = (alert) => {
    setEditingId(alert.id);
    setData('message', alert.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const submitEdit = (e) => {
    e.preventDefault();
    put(`/admin/alerts/${editingId}`, {
      preserveScroll: true,
      onSuccess: () => cancelEdit(),
    });
  };

  const submitNew = (e) => {
    e?.preventDefault(); // Handle both manual and automated calls
    post('/alerts', {
      preserveScroll: true,
      onSuccess: (response) => {
        console.log('Manual alert sent successfully:', response);
        reset();
      },
      onError: (errors) => {
        console.error('Failed to send manual alert:', errors);
      },
    });
  };

  const cancelAlert = (id) => {
    put(`/admin/alerts/${id}`, {
      expiry: dayjs().toISOString(),
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Manage Park Alerts</h2>}
    >
      <Head title="Manage Alerts" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Current Weather in Kuching</h3>
          {weatherLoading && <p className="text-gray-600">Loading weather data...</p>}
          {weatherError && <p className="text-red-600">{weatherError}</p>}
          {weather && !weatherLoading && !weatherError && (
            <div className="text-gray-700">
              <p>Temperature: {weather.temperature}°C</p>
              <p>Condition: {weather.description}</p>
              <p>Humidity: {weather.humidity}%</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Create & Broadcast Alert</h3>
          <form onSubmit={submitNew} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 border px-3 py-2 rounded"
              placeholder="Enter alert message"
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              required
            />
            <select
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="border px-2 py-2 rounded"
            >
              <option value="info">Info</option>
              <option value="emergency">Emergency</option>
            </select>
            <button
              type="submit"
              disabled={processing}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Send Alert
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-gray-500">No alerts found.</div>
          ) : (
            alerts.map((alert) => {
              const isExpired = alert.expiry && dayjs(alert.expiry).isBefore(dayjs());

              return (
                <div key={alert.id} className="border p-4 rounded shadow-sm bg-white">
                  <div className="mb-2 text-sm text-gray-500">
                    Type: <span className="font-semibold">{alert.type}</span>
                    {' | '}
                    Expires: {alert.expiry ?? 'N/A'}{' '}
                    {isExpired && <span className="text-red-500">(expired)</span>}
                  </div>

                  {editingId === alert.id ? (
                    <form onSubmit={submitEdit} className="space-y-2">
                      <textarea
                        className="w-full border px-2 py-1 rounded"
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        required
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          disabled={processing}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-600 underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-gray-800">{alert.message}</p>
                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => startEdit(alert)}
                          className="text-sm text-blue-600 underline"
                        >
                          Edit
                        </button>
                        {!isExpired && (
                          <button
                            onClick={() => cancelAlert(alert.id)}
                            className="text-sm text-red-600 underline"
                          >
                            Cancel Alert
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
