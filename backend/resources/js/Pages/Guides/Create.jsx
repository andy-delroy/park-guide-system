import React from 'react';
// import { useForm } from '@inertiajs/inertia-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head, useForm } from "@inertiajs/react";

const Create = ({ auth }) => {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        years_of_experience: '',
        specializations: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/guides');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add New Guide
                </h2>
            }
        >
            <Head title="Add Guide" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.full_name && <div className="text-red-500 text-sm mt-1">{errors.full_name}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.phone_number && <div className="text-red-500 text-sm mt-1">{errors.phone_number}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Years of Experience</label>
                                    <input
                                        type="number"
                                        value={data.years_of_experience}
                                        onChange={(e) => setData('years_of_experience', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.years_of_experience && <div className="text-red-500 text-sm mt-1">{errors.years_of_experience}</div>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Specializations</label>
                                    <input
                                        type="text"
                                        value={data.specializations}
                                        onChange={(e) => setData('specializations', e.target.value)}
                                        className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                                    />
                                    {errors.specializations && <div className="text-red-500 text-sm mt-1">{errors.specializations}</div>}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded shadow hover:bg-indigo-700 transition"
                                    >
                                        Create Guide
                                    </button>
                                    <Link
                                        href="/guides"
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