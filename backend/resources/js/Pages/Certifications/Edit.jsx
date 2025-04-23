import React from 'react';
import { Link, usePage, Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const Edit = ({ auth, certification }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        Number: certification.certificate_number || '',
        name: certification.certification_name || '',
        description: certification.description || '',
        //issued_by: certification.issued_by,
        issue_date: certification.issue_date,
        expiry_date: certification.expiry_date || '',
        status: certification.status,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/certification/${certification.id}`);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Certification "{certification.certification_name}"
                </h2>
            }
        >
            <Head title="Edit Certification" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Certificaition Number</label>
                                    <input
                                        type="text"
                                        value={data.certification_number}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.certification_number && <div className="text-red-500 text-sm mt-1">{errors.certification_number}</div>}
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={data.certification_name}
                                        onChange={(e) => setData('name', e.target.value)}
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
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded shadow hover:bg-indigo-700 transition"
                                    >
                                        Update Certification
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

export default Edit;