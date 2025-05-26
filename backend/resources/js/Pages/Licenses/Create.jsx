import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { API_BASE_URL } from '../../../../../mobile/api.config';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';

const Create = ({ auth }) => {
    const { data, setData, post, processing, errors } = useForm({
        guide_id: '',
        park_name: '',
        description: '',
        renewal_requirements: '',
        issue_date: '',
        expiry_date: '',
        status: 'active',
        base_url: API_BASE_URL,
        type: 'license',
    });

    const [guides, setGuides] = useState([]);
    const [guideError, setGuideError] = useState(null);

    // Fetch guides when the component mounts
    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const response = await axios.get('/guides', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                // Handle paginated or flat response
                const guideData = response.data.data || response.data || [];
                if (!Array.isArray(guideData)) {
                    console.warn('Guide data is not an array:', guideData);
                    setGuides([]);
                } else {
                    setGuides(guideData);
                }
            } catch (error) {
                console.error('Error fetching guides:', error.response?.data || error.message);
                setGuideError(error.response?.data?.message || 'Failed to fetch guides.');
            }
        };

        fetchGuides();
    }, []);

    // Set default issue_date to today
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        setData('issue_date', formattedDate);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/certification');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add New License
                </h2>
            }
            showBackButton={true}
            backHref="/certification?type=license"
        >
            <Head title="Add License" />

            <SectionCard>
                {guideError && (
                    <div className="text-red-500 text-sm mb-4">{guideError}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Guide</label>
                        <select
                            value={data.guide_id}
                            onChange={(e) => setData('guide_id', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        >
                            <option value="">Select a Guide</option>
                            {guides.map((guide) => (
                                <option key={guide.id} value={guide.id}>
                                    {guide.full_name || 'Unnamed Guide'}
                                </option>
                            ))}
                        </select>
                        {errors.guide_id && (
                            <div className="text-red-500 text-sm mt-1">{errors.guide_id}</div>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Park Name</label>
                        <input
                            type="text"
                            value={data.park_name}
                            onChange={(e) => setData('park_name', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.park_name && (
                            <div className="text-red-500 text-sm mt-1">{errors.park_name}</div>
                        )}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.description && (
                            <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Requirements for renewal</label>
                        <textarea
                            value={data.renewal_requirements}
                            onChange={(e) => setData('renewal_requirements', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.renewal_requirements && <div className="text-red-500 text-sm mt-1">{errors.renewal_requirements}</div>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Issue Date</label>
                        <input
                            type="date"
                            value={data.issue_date}
                            onChange={(e) => setData('issue_date', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.issue_date && (
                            <div className="text-red-500 text-sm mt-1">{errors.issue_date}</div>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="date"
                            value={data.expiry_date}
                            onChange={(e) => setData('expiry_date', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.expiry_date && (
                            <div className="text-red-500 text-sm mt-1">{errors.expiry_date}</div>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {errors.status && (
                            <div className="text-red-500 text-sm mt-1">{errors.status}</div>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button type="create" typeAttr="submit" disabled={processing}>
                            Create License
                        </Button>
                        <Link
                            href="/certification?type=license"
                        >
                            <Button type="cancel">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </SectionCard>
        </AuthenticatedLayout>
    );
};

export default Create;