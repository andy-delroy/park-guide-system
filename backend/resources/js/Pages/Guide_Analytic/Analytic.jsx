import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

export default function GuideAnalytics({ auth }) {
    const [selectedGuide, setSelectedGuide] = useState('');
    const [selectedGuideName, setSelectedGuideName] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [data, setData] = useState({});
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        axios.get('/api/guides').then(res => setGuides(res.data));
    }, []);

    useEffect(() => {
        if (selectedGuide) {
            fetchChartData();
        }
    }, [selectedGuide, filterDate]);

    const fetchChartData = async () => {
        try {
            const response = await axios.get('/analytics/data', {
                params: {
                    guide_id: selectedGuide,
                    date: filterDate,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const renderChart = (type) => {
        let chartData = data[type] || [];
        if (!chartData.length) return <p className="text-gray-400">No data available</p>;

        if (type === 'Daily Active Guides') {
            const end = filterDate ? new Date(filterDate) : new Date();
            const paddedData = [];

            for (let i = 6; i >= 0; i--) {
                const d = new Date(end);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const match = chartData.find(item => {
                    if (!item.date) return false;
                    const normalized = typeof item.date === 'string'
                        ? item.date.slice(0, 10)
                        : new Date(item.date).toISOString().split('T')[0];
                    return normalized === dateStr;
                });

                paddedData.push({
                    date: dateStr,
                    is_active: match ? 1 : 0,
                });
            }

            chartData = paddedData;
            console.log('📊 Padded Active Chart Data:', chartData);
        }

        switch (type) {
            case 'Daily Active Guides':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <XAxis dataKey="date" />
                            <YAxis ticks={[0, 1]} domain={[0, 1]} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(value) => value === 1 ? 'Active' : 'Inactive'} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="is_active"
                                stroke="#2e7d32"
                                fill="#81c784"
                                name="Active Status"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'Quiz Scores':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="quiz" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Line type="monotone" dataKey="average_score" stroke="#2e7d32" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'Module Completion Rate':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="module" />
                            <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(val) => `${val}%`} />
                            <Legend />
                            <Bar dataKey="completion_rate" fill="#2e7d32" name="Completion %" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'Ratings':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="date" />
                            <YAxis domain={[1, 5]} allowDecimals={false} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="rating"
                                stroke="#2e7d32"
                                strokeWidth={2}
                                name="Rating (1–5)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Guide Performance Analytics</h2>}>
            <Head title="Guide Performance Analytics" />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="space-x-2">
                        <select
                            value={selectedGuide}
                            onChange={(e) => {
                                setSelectedGuide(e.target.value);
                                const selected = guides.find(g => g.id == e.target.value);
                                setSelectedGuideName(selected?.full_name || selected?.username || '');
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value="">Select Guide</option>
                            {guides.map((guide) => (
                                <option key={guide.id} value={guide.id}>
                                    {guide.full_name || guide.username}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>

                {selectedGuide && (
                    <p className="text-sm text-gray-500 mb-4">
                        Viewing metrics for: <strong>{selectedGuideName}</strong>
                    </p>
                )}

                {['Daily Active Guides', 'Quiz Scores', 'Module Completion Rate', 'Ratings'].map((section) => (
                    <div key={section} className="mb-10">
                        <h3 className="text-lg font-semibold text-[--forest-green] mb-2">{section}</h3>
                        <div className="bg-white shadow rounded p-4">
                            {renderChart(section)}
                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
