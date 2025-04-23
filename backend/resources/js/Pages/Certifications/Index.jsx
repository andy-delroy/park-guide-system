import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index({ auth, certifications }) {
    const { props } = usePage();
    const [message, setMessage] = useState({ success: null, error: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this certification?")) {
            Inertia.delete(`/certification/${id}`, {
                onSuccess: () => {
                    setMessage({
                        success: "Certification deleted successfully.",
                        error: null,
                    });
                },
                onError: (errors) => {
                    setMessage({
                        success: null,
                        error: "Failed to delete certification. Please try again.",
                    });
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Certification Management
                </h2>
            }
        >
            <Head title="Certification Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {message.success && (
                        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">
                            {message.success}
                        </div>
                    )}
                    {message.error && (
                        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
                            {message.error}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Certifications
                                </h3>
                                <Link
                                    href="/certification/create"
                                    className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                                >
                                    Add New Certification
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Issued By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Issue Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {certifications.data.length > 0 ? (
                                            certifications.data.map((certification) => (
                                                <tr key={certification.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {certification.certification_name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {certification.issued_by}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {certification.issue_date}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        <Link
                                                            href={`/certification/${certification.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(certification.id)
                                                            }
                                                            className="ml-4 text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                                >
                                                    No certifications found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}