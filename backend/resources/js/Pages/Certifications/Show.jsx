import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head } from "@inertiajs/react";

const Show = ({ auth, certification }) => {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Certification Details
                </h2>
            }
        >
            <Head title="Certification Details" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="bg-white p-4 rounded shadow">
                                <p className="mb-2"><strong>Name:</strong> {certification.name}</p>
                                <p className="mb-2"><strong>Description:</strong> {certification.description}</p>
                                <p className="mb-2"><strong>Issued By:</strong> {certification.issued_by}</p>
                                <p className="mb-2"><strong>Issue Date:</strong> {certification.issue_date}</p>
                                <p className="mb-2"><strong>Expiry Date:</strong> {certification.expiry_date || 'N/A'}</p>
                                <p className="mb-2"><strong>Status:</strong> {certification.status}</p>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href="/certification"
                                    className="inline-block px-4 py-2 bg-gray-500 text-white font-semibold text-sm rounded shadow hover:bg-gray-600 transition"
                                >
                                    Back to Certifications
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Show;