import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import dayjs from 'dayjs';

export default function SendAlert({ auth }) {
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [lastCondition, setLastCondition] = useState(null);
  const [isAutomatedActive, setIsAutomatedActive] = useState(() => {
    return localStorage.getItem('isAutomatedActive') === 'true';
  });

  const { data, setData, post, processing, errors, reset } = useForm({
    message: '',
    type: 'info',
    park_id: null,
    expiry: null,
  });

  useEffect(() => {
    console.log('Auth user:', auth.user);
    localStorage.setItem('isAutomatedActive', isAutomatedActive.toString());
  }, [isAutomatedActive]);

  const checkWeatherConditions = (temperature, description) => {
    if (temperature > 25) {
      console.log(`Temperature exceeds 25°C: ${temperature}°C`);
      return { trigger: true, message: `Temperature is too hot: ${temperature}°C`, condition: 'hot' };
    } else if (description.toLowerCase().includes('rain')) {
      console.log(`Rain detected`);
      return { trigger: true, message: 'It is raining', condition: 'rain' };
    } else {
      console.log(`Temperature is ${temperature}°C and no rain detected - No alert`);
      return { trigger: false, message: '', condition: 'none' };
    }
  };

  useEffect(() => {
    if (!isAutomatedActive) {
      console.log('Automated alert system deactivated, skipping weather fetch.');
      return;
    }

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        console.log('Fetching weather from OpenWeatherMap...');
        const lat = 1.5534;
        const lng = 110.3595;

          throw new Error('Invalid OpenWeather API key');
        }

        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat,
            lon: lng,
            appid: apiKey,
            units: 'metric',
          },
        });

        const data = response.data;
        console.log('Weather API response:', JSON.stringify(data, null, 2));

        const description = data.weather[0].description;
        const humidity = data.main.humidity;

        console.log('Parsed weather:', { temperature, description, humidity });

        setWeather({ temperature, description, humidity });
        setWeatherError(null);

        const { trigger, message, condition } = checkWeatherConditions(temperature, description);
        if (trigger && !alertSent) {
          console.log('Sending automated alert:', { message, temperature, description });
          setData({
            message,
            type: 'emergency',
            park_id: null,
            expiry: dayjs().add(2, 'hour').toISOString(),
          });
          post('/alerts', {
            preserveScroll: true,
            onSuccess: () => {
              console.log('Automated alert sent.');
              setAlertSent(true);
              setLastCondition(condition);
              reset();
            },
            onError: (errors) => {
              console.error('Failed to send automated alert:', errors);
            },
          });
        }
      } catch (err) {
        console.error('Weather API error:', err.message);
        setWeatherError(`Failed to fetch weather data: ${err.message}`);
        const fallbackWeather = {
          temperature: 28.0,
          description: 'Cloudy',
          humidity: 74,
        };
        console.log('Using fallback:', JSON.stringify(fallbackWeather, null, 2));
        setWeather(fallbackWeather);

        const { trigger, message, condition } = checkWeatherConditions(fallbackWeather.temperature, fallbackWeather.description);
        if (trigger && !alertSent) {
          console.log('Sending automated alert with fallback:', { message, ...fallbackWeather });
          setData({
            message,
            type: 'emergency',
            park_id: null,
            expiry: dayjs().add(2, 'hour').toISOString(),
          });
          post('/alerts', {
            preserveScroll: true,
            onSuccess: () => {
              console.log('Automated alert sent with fallback');
              setAlertSent(true);
              setLastCondition(condition);
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
  }, [isAutomatedActive]);

  const submitAlert = (e) => {
    e.preventDefault();
    console.log('Submitting manual alert:', data);
    post('/alerts', {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Manual alert sent successfully');
        reset();
      },
      onError: (errors) => {
        console.error('Failed to send manual alert:', errors);
      },
    });
  };

  const clearForm = () => {
    reset();
    console.log('Form cleared');
  };

  const toggleAutomation = () => {
    setIsAutomatedActive(!isAutomatedActive);
    setAlertSent(false);
    setLastCondition(null);
    localStorage.setItem('isAutomatedActive', (!isAutomatedActive).toString());
    console.log(`Automated alert system ${!isAutomatedActive ? 'activated' : 'deactivated'}`);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl font-semibold text-gray-800">Send Park Alert</h2>}
    >
      <Head title="Send Alert" />

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
              {alertSent && isAutomatedActive && <p className="text-green-600">Alert sent for current conditions.</p>}
            </div>
          )}
          <button
            onClick={toggleAutomation}
            className={`mt-2 px-4 py-2 rounded text-white ${isAutomatedActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isAutomatedActive ? 'Deactivate Automated Alerts' : 'Activate Automated Alerts'}
          </button>
        </div>

        {/* Send Alert Form */}
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Send Alert</h3>
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
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={processing}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Send Alert
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
      </div>
    </AuthenticatedLayout>
  );
}