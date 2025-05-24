import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns'; // For date handling

// chatjs needs to be registered?
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

export default function IOTDashboard({ auth, recentImages, sensorData }) {
  // const { auth } = usePage().props;
  const [message, setMessage] = useState({ success: null, error: null });

  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

  const chartData = {
        labels: sensorData.map(d => d.recorded_at),
        datasets: [
            {
                label: 'Temperature (°C)',
                data: sensorData.map(d => d.temperature),
                borderColor: '#ff4500',
                backgroundColor: 'rgba(255, 69, 0, 0.2)',
                fill: false,
            },
            {
                label: 'Humidity (%)',
                data: sensorData.map(d => d.humidity),
                borderColor: '#1e90ff',
                backgroundColor: 'rgba(30, 144, 255, 0.2)',
                fill: false,
            },
            {
              label: 'Soil Moisture (%)',
              data: sensorData.map(d => d.soil),
              borderColor: '#228b22', // Forest green
              backgroundColor: 'rgba(34, 139, 34, 0.2)',
              fill: false,
          },
          {
              label: 'Rain (%)',
              data: sensorData.map(d => d.rain),
              borderColor: '#00ced1', // Dark turquoise
              backgroundColor: 'rgba(0, 206, 209, 0.2)',
              fill: false,
          },
          {
              label: 'Distance (cm)',
              data: sensorData.map(d => d.distance),
              borderColor: '#ff69b4', // Hot pink (because why not?)
              backgroundColor: 'rgba(255, 105, 180, 0.2)',
              fill: false,
          },
        ],
    };

    //update new sensor data on channel event sensor-data-updated
    useEffect(() => {
        console.log('Connecting to sensor-data channel');
        window.Echo.channel('sensor-data')
            .listen('.sensor-data-updated', (e) => {
                console.log('Received sensor-data-updated event', e);
                setChartData((prev) => {
                    const newLabels = [...prev.labels, e.sensorData.recorded_at].slice(-50);
                    return {
                        labels: newLabels,
                        datasets: prev.datasets.map((dataset) => {
                            const key = dataset.label.toLowerCase().split(' ')[0];
                            return {
                                ...dataset,
                                data: [...dataset.data, e.sensorData[key]].slice(-50),
                            };
                        }),
                    };
                });
            });
            
        return () => {
            console.log('Leaving sensor-data channel');
            window.Echo.leaveChannel('sensor-data');
        }
    }, []);

    const chartOptions = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                },
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };

  return (
    <AuthenticatedLayout
      user={user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">IoT Dashboard</h2>}
    >
      <Head title="IoT Dashboard" />

      <SectionCard>
        {message.success && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{message.success}</div>
        )}
        {message.error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{message.error}</div>
        )}

        {/* 📍 Add your dashboard content below */}
        <div className="text-gray-700">
          <p>Welcome to the IoT Das hboard. Customize this section with charts, tables, or sensor data.</p>
          <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium">Recent Captures</h3>
                            <div className="grid grid-cols-5 gap-4 mt-4">
                                {recentImages.map(image => (
                                    <div key={image.filename} className="text-center">
                                        <img src={image.url} alt={image.filename} className="w-full h-32 object-cover" />
                                        <p className="text-sm mt-2">{image.filename}</p>
                                    </div>
                                ))}
                            </div>
                            <h3 className="text-lg font-medium mt-8">Sensor Data</h3>
                            <div className="mt-4">
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}
