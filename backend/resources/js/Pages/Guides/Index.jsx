import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import DataGridTable from "@/Components/DataGridTable";
import Button from "@/Components/Button";
import ButtonThin from "@/Components/ButtonThin";

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
                    <Link href="/guides/create">
                        <Button>+ Create New Guide</Button>
                    </Link>
                </div>

                <DataGridTable
                    rows={guides.map((guide) => ({
                        id: guide.id,
                        full_name: guide.full_name,
                        email: guide.email,
                        role: guide.role_name,
                    }))}
                    columns={[
                        {
                            field: 'full_name',
                            headerName: 'Full Name',
                            flex: 1,
                            renderCell: (params) => (
                                <Link
                                    href={`/guides/${params.row.id}`}
                                >
                                    <ButtonThin type="detail">
                                        {params.row.full_name}
                                    </ButtonThin>
                                </Link>
                            ),
                        },
                        { field: 'email', headerName: 'Email', flex: 1 },
                        { field: 'role', headerName: 'Role', flex: 1 },
                        {
                            field: 'actions',
                            headerName: 'Actions',
                            flex: 0.7,
                            sortable: false,
                            filterable: false,
                            renderCell: (params) => (
                                <div className="space-x-2">
                                    <Link
                                        href={`/guides/${params.row.id}/edit`}
                                    >
                                        <ButtonThin type="edit">
                                            Edit
                                        </ButtonThin>
                                    </Link>
                                    <Link
                                        href={`/guides/${params.row.id}`}
                                        method="delete"
                                        as="button"
                                        onClick={(e) => {
                                            if (!confirm("Are you sure you want to delete this guide?")) {
                                                e.preventDefault(); // Cancel delete if not confirmed
                                            }
                                        }}
                                    >
                                        <ButtonThin type="delete">
                                            Delete
                                        </ButtonThin>
                                    </Link>
                                </div>
                            ),
                        },
                    ]}
                />
            </SectionCard>
        </AuthenticatedLayout>
    );
}