import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head, useForm } from '@inertiajs/react';
import axios from 'axios';

const Create = ({ auth }) => {
    const { data, setData, post, processing, errors } = useForm({
        guide_id: '',
        certificate_number: '',
        certification_name: '',
        description: '',
        certificate_file_url: '',
        requirements_description: '',
        validity_period_months: '',
        renewal_requirements: '',
        // issued_by: '',
        issue_date: '',
        expiry_date: '',
        status: 'active',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/certification');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add New Certification
                </h2>
            }
        >
            <Head title="Add Certification" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
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
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Certification Number</label>
                                    <input
                                        type="text"
                                        value={data.certificate_number}
                                        onChange={(e) => setData('certificate_number', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.certificate_number && (
                                        <div className="text-red-500 text-sm mt-1">{errors.certificate_number}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={data.certification_name}
                                        onChange={(e) => setData('certification_name', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.certification_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.certification_name}</div>
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
                                    <label className="block mb-1 text-sm font-medium text-gray-700">URL</label>
                                    <textarea
                                        value={data.certificate_file_url}
                                        onChange={(e) => setData('certificate_file_url', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.certificate_file_url && <div className="text-red-500 text-sm mt-1">{errors.certificate_file_url}</div>}
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Requirements Description</label>
                                    <textarea
                                        value={data.requirements_description}
                                        onChange={(e) => setData('requirements_description', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.requirements_description && <div className="text-red-500 text-sm mt-1">{errors.requirements_description}</div>}
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Validity months</label>
                                    <textarea
                                        value={data.validity_period_months}
                                        onChange={(e) => setData('validity_period_months', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.validity_period_months && <div className="text-red-500 text-sm mt-1">{errors.validity_period_months}</div>}
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

                                {/* <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Issued By</label>
                                    <input
                                        type="text"
                                        value={data.issued_by}
                                        onChange={(e) => setData('issued_by', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.issued_by && <div className="text-red-500 text-sm mt-1">{errors.issued_by}</div>}
                                </div> */}

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
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded shadow hover:bg-indigo-700 transition"
                                    >
                                        Create Certification
                                    </button>
                                    <Link
                                        href="/certification"
                                        className="inline-block px-4 py-2 bg-gray-500 text-white font-semibold text-sm rounded shadow hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;