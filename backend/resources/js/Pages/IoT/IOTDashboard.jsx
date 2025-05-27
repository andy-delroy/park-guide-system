import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';

import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns'; // For date handling

// chatjs needs to be registered?
ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, zoomPlugin);

export default function IOTDashboard({ auth, recentImages, sensorData }) {
  // const { auth } = usePage().props;
  const [message, setMessage] = useState({ success: null, error: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const chartRef = useRef(null);

  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;

//   const chartData = {
//         labels: sensorData.map(d => d.recorded_at),
//         datasets: [
//             {
//                 label: 'Temperature (°C)',
//                 data: sensorData.map(d => d.temperature),
//                 borderColor: '#ff4500',
//                 backgroundColor: 'rgba(255, 69, 0, 0.2)',
//                 fill: false,
//             },
//             {
//                 label: 'Humidity (%)',
//                 data: sensorData.map(d => d.humidity),
//                 borderColor: '#1e90ff',
//                 backgroundColor: 'rgba(30, 144, 255, 0.2)',
//                 fill: false,
//             },
//             {
//               label: 'Soil Moisture (%)',
//               data: sensorData.map(d => d.soil),
//               borderColor: '#228b22', // Forest green
//               backgroundColor: 'rgba(34, 139, 34, 0.2)',
//               fill: false,
//           },
//           {
//               label: 'Rain (%)',
//               data: sensorData.map(d => d.rain),
//               borderColor: '#00ced1', // Dark turquoise
//               backgroundColor: 'rgba(0, 206, 209, 0.2)',
//               fill: false,
//           },
//           {
//               label: 'Distance (cm)',
//               data: sensorData.map(d => d.distance),
//               borderColor: '#ff69b4', // Hot pink (because why not?)
//               backgroundColor: 'rgba(255, 105, 180, 0.2)',
//               fill: false,
//           },
//         ],
//     };

    const [chartData, setChartData] = useState({
        labels: sensorData.map(d => d.recorded_at),
        datasets: [
            {
            label: 'Temperature (°C)',
            data: sensorData.map(d => d.temperature),
            borderColor: '#ff4500',
            backgroundColor: 'rgba(255, 69, 0, 0.2)',
            fill: false,
            },
            // ... rest of datasets
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
        ]
        });
    //update new sensor data on channel event sensor-data-updated
    useEffect(() => {
        const fetchSensorData = async () => {
        try {
        const res = await fetch('/iot-dashboard/data'); // this should be your new API route
        const data = await res.json();
        console.log('Fetched sensor data:', data);

        const labels = data.map(d => d.recorded_at);
        const datasets = [
            {
            label: 'Temperature (°C)',
            data: data.map(d => d.temperature),
            borderColor: '#ff4500',
            backgroundColor: 'rgba(255, 69, 0, 0.2)',
            fill: false,
            },
            {
            label: 'Humidity (%)',
            data: data.map(d => d.humidity),
            borderColor: '#1e90ff',
            backgroundColor: 'rgba(30, 144, 255, 0.2)',
            fill: false,
            },
            {
            label: 'Soil Moisture (%)',
            data: data.map(d => d.soil),
            borderColor: '#228b22',
            backgroundColor: 'rgba(34, 139, 34, 0.2)',
            fill: false,
            },
            {
            label: 'Rain (%)',
            data: data.map(d => d.rain),
            borderColor: '#00ced1',
            backgroundColor: 'rgba(0, 206, 209, 0.2)',
            fill: false,
            },
            {
            label: 'Distance (cm)',
            data: data.map(d => d.distance),
            borderColor: '#ff69b4',
            backgroundColor: 'rgba(255, 105, 180, 0.2)',
            fill: false,
            },
        ];
        setLastUpdated(new Date().toLocaleTimeString());
        setChartData({ labels, datasets });
        } catch (err) {
        console.error('Polling error:', err);
        }
        console.log('Fetched sensor data every 3 secs ');
        
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);

    return () => clearInterval(interval);
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
            tooltip: {
                callbacks: {
                title: (items) => {
                    return new Date(items[0].parsed.x).toLocaleTimeString();
                }
                }
            },
            legend: {
                display: true,
            },
            zoom: {
                pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'ctrl'  // pan only when holding Ctrl (optional)
                },
                zoom: {
                wheel: {
                    enabled: true
                },
                pinch: {
                    enabled: true
                },
                mode: 'x'
                }
            }
        },
    };

    const envDatasets = chartData.datasets.filter(
        d => d.label !== 'Distance (cm)'
        );

        const distanceDataset = chartData.datasets.find(
        d => d.label === 'Distance (cm)'
        );

        const envData = {
        labels: chartData.labels,
        datasets: envDatasets
        };

        const distanceData = {
        labels: chartData.labels,
        datasets: distanceDataset ? [distanceDataset] : []
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
                            <div className="mt-4 max-w-4xl mx-auto">
                                <h2 className="text-lg font-bold mb-2">Environmental readings</h2>
                                {lastUpdated && (
                                    <p className="text-sm text-gray-500 mb-2">
                                        Last updated at <span className="font-medium">{lastUpdated}</span>
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />
                                    </p>
                                    )}
                                <Line ref={chartRef} data={envData  } options={chartOptions} />
                                <button
                                onClick={() => chartRef.current?.resetZoom()}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                Reset Zoom
                                </button>
                            </div>
                            <div className="mt-4 max-w-4xl mx-auto">
                                <h2 className="text-lg font-bold mb-2">Intruder Distance (cm)</h2>
                                {lastUpdated && (
                                    <p className="text-sm text-gray-500 mb-2">
                                        Last updated at <span className="font-medium">{lastUpdated}</span>
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />
                                    </p>
                                    )}
                                <Line ref={chartRef} data={distanceData} options={chartOptions} />
                                <button
                                onClick={() => chartRef.current?.resetZoom()}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                Reset Zoom
                                </button>
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
