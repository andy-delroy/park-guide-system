import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";

export default function Index({ guides }) {
    const { props } = usePage();
    const [message, setMessage] = useState({ success: null, error: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this guide?")) {
            Inertia.delete(`/guides/${id}`, {
                onSuccess: () => {
                    setMessage({
                        success: "Guide deleted successfully.",
                        error: null,
                    });
                },
                onError: (errors) => {
                    setMessage({
                        success: null,
                        error: "Failed to delete guide. Please try again.",
                    });
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={props.auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Guide Management
                </h2>
            }
        >
            <Head title="Guide Management" />

            <SectionCard>
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
                    
                <div className="mb-4 flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        Guides
                    </h3>
                    <Link
                        href="/guides/create"
                        className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    >
                        + Add New Guide
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Full Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {guides.length > 0 ? (
                                guides.map((guide) => (
                                    <tr key={guide.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {guide.full_name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {guide.email}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {guide.role_name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            <Link
                                                href={`/guides/${guide.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        guide.id,
                                                    )
                                                }
                                                className="ml-4 text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                            <Link
                                                href={`/guides/${guide.id}`}
                                                className="ml-2 text-indigo-600 hover:text-indigo-900"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No guides found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </AuthenticatedLayout>
    );
}