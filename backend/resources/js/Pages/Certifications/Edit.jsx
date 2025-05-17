import React, { useEffect, useState } from 'react';
import { Link, usePage, useForm, Head } from "@inertiajs/react";
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import API_BASE_URL from '../../../../../mobile/api.config';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';

const Edit = ({ auth, certification }) => {
    const { data, setData, post, processing, errors } = useForm({
        guide_id: certification.guide_id || '',
        certificate_number: certification.certificate_number || '',
        certification_name: certification.certification_name || '',
        description: certification.description || '',
        certificate_file_url: certification.certificate_file_url || '',
        renewal_requirements: certification.renewal_requirements || '',
        validity_period_months: certification.validity_period_months || '',
        issue_date: certification.issue_date || '',
        expiry_date: certification.expiry_date || '',
        status: certification.status || 'active',
        base_url: API_BASE_URL,
        _method: 'PUT',
    });

    const [guides, setGuides] = useState([]);
    const [guideError, setGuideError] = useState(null);
    const [newCertificateFile, setNewCertificateFile] = useState(null)

    // Extract relative path for existing certificate
    const getRelativePath = (url) => {
        if (!url) return null;
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.pathname; // e.g., /certificates/filename.pdf
        } catch (error) {
            console.error('Invalid URL:', url, error);
            return null;
        }
    };

    const relativePath = getRelativePath(certification.certificate_file_url);
    const isImage = relativePath && /\.(jpg|jpeg|png)$/i.test(relativePath);
    const isPdf = relativePath && /\.pdf$/i.test(relativePath);

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
        const formData = new FormData();
        // Append all form fields to FormData
        Object.keys(data).forEach((key) => {
            if (key === 'certificate_file_url') {
                // If a new file is selected, append it; otherwise, append the original URL
                if (newCertificateFile) {
                    formData.append('certificate_file_url', newCertificateFile);
                } else if (data.certificate_file_url) {
                    formData.append('certificate_file_url', data.certificate_file_url);
                }
            } else if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]); // Append non-empty fields
            }
        });

        post(route('certification.update', certification.id), {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Certification "{certification.certification_name}"
                </h2>
            }
            showBackButton={true}
            backHref="/certification"
        >
            <Head title="Edit Certification" />

            <SectionCard>
                {guideError && (
                    <div className="text-red-500 text-sm mb-4">{guideError}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Current Certificate File</label>
                        {relativePath ? (
                            <div className="mb-2">
                                {isImage ? (
                                    <img
                                        src={relativePath}
                                        alt="Current Certificate"
                                        className="max-w-full h-auto rounded shadow"
                                        style={{ maxHeight: '200px' }}
                                    />
                                ) : isPdf ? (
                                    <embed
                                        src={relativePath}
                                        type="application/pdf"
                                        width="100%"
                                        height="200px"
                                        className="rounded shadow"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        <a
                                            href={relativePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline"
                                        >
                                            View Current File
                                        </a>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-2">No file uploaded.</p>
                        )}
                        <label className="block mb-1 text-sm font-medium text-gray-700">Upload New Certificate File (Optional)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => setData('certificate_file_url', e.target.files[0])}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.certificate_file_url && (
                            <div className="text-red-500 text-sm mt-1">{errors.certificate_file_url}</div>
                        )}
                    </div>
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
                                    {guide.full_name}
                                </option>
                            ))}
                        </select>
                        {errors.guide_id && <div className="text-red-500 text-sm mt-1">{errors.guide_id}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Certification Number</label>
                        <input
                            type="text"
                            value={data.certificate_number}
                            onChange={(e) => setData('certificate_number', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.certificate_number && <div className="text-red-500 text-sm mt-1">{errors.certificate_number}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={data.certification_name}
                            onChange={(e) => setData('certification_name', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.certification_name && <div className="text-red-500 text-sm mt-1">{errors.certification_name}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Validity months</label>
                        <input
                            type="number"
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

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Issue Date</label>
                        <input
                            type="date"
                            value={data.issue_date}
                            onChange={(e) => setData('issue_date', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.issue_date && <div className="text-red-500 text-sm mt-1">{errors.issue_date}</div>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="date"
                            value={data.expiry_date}
                            onChange={(e) => setData('expiry_date', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                        {errors.expiry_date && <div className="text-red-500 text-sm mt-1">{errors.expiry_date}</div>}
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
                        {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
                    </div>

                    <div className="flex space-x-2">
                        <Button type="update" disabled={processing} typeAttr="submit">
                            Update Certification
                        </Button>

                        <Link
                            href={route('certifications.index')}
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

export default Edit;
