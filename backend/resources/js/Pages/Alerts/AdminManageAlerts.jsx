import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import axios from 'axios';

export default function AdminManageAlerts({ alerts }) {
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(() => {
    return localStorage.getItem('alertSent') === 'true';
  });

  const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
    id: null, // Added for editing
    message: '',
    type: 'info',
    park_id: null,
    expiry: null,
    roles: [],
  });

  useEffect(() => {
    localStorage.setItem('alertSent', alertSent.toString());
  }, [alertSent]);

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
      if (alertSent) {
        console.log('Alert already sent, skipping weather fetch.');
        return;
      }

      setWeatherLoading(true);
      try {
        console.log('Fetching weather from Google Weather API...');
        const lat = 1.5534;
        const lng = 110.3595;
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_ACTUAL_GOOGLE_API_KEY';

        const response = await axios.get('https://weather.googleapis.com/v1/currentConditions:lookup', {
          params: {
            key: apiKey,
            'location.latitude': lat,
            'location.longitude': lng,
          },
        });

        const data = response.data;
        console.log('Google Weather API response:', data);

        if (data.error) {
          throw new Error(data.error.message);
        }

        const temperature = data.temperature?.degrees ?? data.currentConditions?.temperature ?? data.temperature ?? 0;
        const description = data.weatherCondition?.description?.text ?? data.currentConditions?.condition ?? 'Unknown';
        const humidity = data.relativeHumidity ?? data.currentConditions?.humidity ?? 0;

        console.log('Parsed weather:', { temperature, description, humidity });

        setWeather({ temperature, description, humidity });
        setWeatherError(null);

        if (checkWeatherConditions(temperature, description) && !alertSent) {
          console.log('Sending automated alert for temperature or rain:', { temperature, description });
          setData({
            message: `Alert: Temperature is too high or it's raining! ${temperature}°C | Condition: ${description}`,
            type: 'emergency',
            park_id: null,
            expiry: null,
            roles: ['park_guide', 'visitor'],
          });
          post('/alerts', {
            preserveScroll: true,
            onSuccess: () => {
              console.log('Automated alert sent successfully');
              setAlertSent(true);
              reset();
            },
            onError: (errors) => {
              console.error('Failed to send automated alert:', errors);
            },
          });
        } else if (!checkWeatherConditions(temperature, description) && alertSent) {
          console.log('Weather conditions no longer trigger, resetting alertSent.');
          setAlertSent(false);
        }
      } catch (err) {
        console.error('Google Weather API error:', err);
        setWeatherError(`Failed to fetch weather data: ${err.message}`);
        const fallbackWeather = {
          temperature: 30.2,
          description: 'Cloudy',
          humidity: 74,
        };
        console.log('Using fallback weather:', fallbackWeather);
        setWeather(fallbackWeather);
        setWeatherError('Using fallback data due to API failure.');

        if (checkWeatherConditions(fallbackWeather.temperature, fallbackWeather.description) && !alertSent) {
          console.log('Sending automated alert with fallback data:', fallbackWeather);
          setData({
            message: `Alert: Temperature is too high or it's raining! ${fallbackWeather.temperature}°C | Condition: ${fallbackWeather.description}`,
            type: 'emergency',
            park_id: null,
            expiry: null,
            roles: ['park_guide', 'visitor'],
          });
          post('/alerts', {
            preserveScroll: true,
            onSuccess: () => {
              console.log('Automated alert sent successfully with fallback');
              setAlertSent(true);
              reset();
            },
            onError: (errors) => {
              console.error('Failed to send automated alert with fallback:', errors);
            },
          });
        }
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    const intervalId = setInterval(fetchWeather, 900000);

    return () => clearInterval(intervalId);
  }, [post, setData, reset, alertSent]);

  const submitAlert = (e) => {
    e.preventDefault();
    console.log('Submitting alert:', data);
    post('/alerts', {
      preserveScroll: true,
      onSuccess: () => {
        console.log(data.id ? 'Alert updated successfully' : 'Alert created successfully');
        reset();
      },
      onError: (errors) => {
        console.error('Failed to submit alert:', errors);
        if (errors.__status === 404) {
          alert('Alert not found. It may have been deleted.');
        }
      },
    });
  };

  const selectAlertForEdit = (alert) => {
    console.log('Selecting alert for edit:', alert);
    setData({
      id: alert.id,
      message: alert.message,
      type: alert.type,
      park_id: alert.park_id,
      expiry: alert.expiry,
      roles: alert.roles || [],
    });
  };

  const deleteAlert = (id) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      console.log('Deleting alert ID:', id);
      destroy(`/admin/alerts/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          console.log('Alert deleted successfully');
        },
        onError: (errors) => {
          console.error('Failed to delete alert:', errors);
          if (errors.__status === 405) {
            alert('Method not allowed. Please check the route configuration.');
          } else if (errors.__status === 404) {
            alert('Alert not found. It may have been deleted.');
          }
        },
      });
    }
  };

  const resetAlertSent = () => {
    setAlertSent(false);
    localStorage.setItem('alertSent', 'false');
    console.log('Alert sent status reset.');
  };

  const clearForm = () => {
    reset();
    console.log('Form cleared');
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Manage Park Alerts</h2>}
    >
      <Head title="Manage Alerts" />

      <div className="p-6 space-y-8 max-w-4xl mx-auto">
        {/* Weather Section */}
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Current Weather in Kuching</h3>
          {weatherLoading && <p className="text-gray-600">Loading weather data...</p>}
          {weatherError && <p className="text-red-600">{weatherError}</p>}
          {weather && !weatherLoading && (
            <div className="text-gray-700">
              <p>Temperature: {weather.temperature}°C</p>
              <p>Condition: {weather.description}</p>
              <p>Humidity: {weather.humidity}%</p>
              {alertSent && <p className="text-green-600">Alert sent for current conditions.</p>}
              <button
                onClick={resetAlertSent}
                className="mt-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Reset Alert Status (Testing)
              </button>
            </div>
          )}
        </div>

        {/* Create/Update Alert Form */}
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">{data.id ? 'Update Alert' : 'Create & Broadcast Alert'}</h3>
          <form onSubmit={submitAlert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Enter alert message"
                value={data.message}
                onChange={(e) => setData('message', e.target.value)}
                required
              />
              {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={data.type}
                onChange={(e) => setData('type', e.target.value)}
                className="w-full border px-2 py-2 rounded focus:outline-none focus:ring focus:ring-indigo-200"
              >
                <option value="info">Info</option>
                <option value="emergency">Emergency</option>
              </select>
              {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry (Optional)</label>
              <input
                type="datetime-local"
                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                value={data.expiry ? dayjs(data.expiry).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(e) => setData('expiry', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
              {errors.expiry && <p className="text-red-600 text-sm mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Park ID (Optional)</label>
              <input
                type="number"
                className="w-full border px-2 py-1 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                value={data.park_id || ''}
                onChange={(e) => setData('park_id', e.target.value ? parseInt(e.target.value) : null)}
              />
              {errors.park_id && <p className="text-red-600 text-sm mt-1">{errors.park_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roles (Optional)</label>
              <div className="flex gap-4">
                {['park_guide', 'visitor'].map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.roles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...data.roles, role]
                          : data.roles.filter((r) => r !== role);
                        setData('roles', newRoles);
                      }}
                    />
                    <span className="ml-2 capitalize">{role.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              {errors.roles && <p className="text-red-600 text-sm mt-1">{errors.roles}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {data.id ? 'Update Alert' : 'Send Alert'}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="text-gray-600 underline hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">Existing Alerts</h3>
          {alerts.length === 0 ? (
            <div className="text-gray-500 text-center">No alerts found.</div>
          ) : (
            alerts.map((alert) => {
              const isExpired = alert.expiry && dayjs(alert.expiry).isBefore(dayjs());

              return (
                <div key={alert.id} className="border p-4 rounded shadow-sm bg-white">
                  <div className="mb-2 text-sm text-gray-500">
                    Type: <span className="font-semibold">{alert.type}</span>
                    {' | '}
                    Expires: {alert.expiry ? dayjs(alert.expiry).format('YYYY-MM-DD HH:mm') : 'N/A'}
                    {isExpired && <span className="text-red-500"> (expired)</span>}
                  </div>
                  <p className="text-gray-800">{alert.message}</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => selectAlertForEdit(alert)}
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Select for Edit
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-sm text-red-600 underline hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}