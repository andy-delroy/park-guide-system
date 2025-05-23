import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import DataGridTable from "@/Components/DataGridTable";
import Button from "@/Components/Button";
import ButtonThin from "@/Components/ButtonThin";

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

    const handleRenew = (id) => {
        if (confirm("Are you sure you want to renew this certification?")) {
            Inertia.post(`/certification/${id}/renew`, {}, {
                onSuccess: () => {
                    setMessage({
                        success: "Certification renewed successfully.",
                        error: null,
                    });
                },
                onError: () => {
                    setMessage({
                        success: null,
                        error: "Failed to renew certification. Please try again.",
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
                        Certifications
                    </h3>
                    {auth.user.role.role_name === 'admin' && (
                        <Link href="/certification/create">
                            <Button>+ Create New Certification</Button>
                        </Link>
                    )}
                </div>

                <DataGridTable
                    rows={certifications.data.map((cert) => ({
                        id: cert.id,
                        certification_name: cert.certification_name,
                        issued_to: cert.guide.full_name,
                        issued_by: cert.issuer.full_name,
                        issue_date: cert.issue_date,
                        validity_period_months: cert.validity_period_months,
                    }))}
                    columns={[
                        {
                            field: "certification_name",
                            headerName: "Name",
                            flex: 2,
                            renderCell: ({ row }) => (
                                <Link
                                    href={`/certification/${row.id}/details`}
                                >
                                    <ButtonThin type="detail">
                                        {row.certification_name}
                                    </ButtonThin>
                                </Link>
                            ),
                        },
                        { field: "issued_to", headerName: "Issued To", flex: 1 },
                        { field: "issued_by", headerName: "Issued By", flex: 1 },
                        { field: "issue_date", headerName: "Issue Date", flex: 1 },
                        {
                            field: "actions",
                            headerName: "Actions",
                            flex: 0.7,
                            sortable: false,
                            filterable: false,
                            renderCell: ({ row }) => (
                                <div className="flex space-x-2">
                                    {auth.user.role.role_name === "admin" && (
                                        <>
                                            <Link
                                                href={`/certification/${row.id}/edit`}
                                            >
                                                <ButtonThin type="edit">
                                                    Edit
                                                </ButtonThin>
                                            </Link>
                                            <Link
                                                href={`/certification/${row.id}`}
                                                method="delete"
                                                as="button"
                                                onClick={(e) => {
                                                    if (!confirm("Are you sure you want to delete this item?")) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <ButtonThin type="delete">
                                                    Delete
                                                </ButtonThin>
                                            </Link>
                                            {(row.validity_period_months == 0 || row.validity_period_months == 1) && (
                                                <button
                                                    onClick={() => handleRenew(row.id)}
                                                    className="ml-4 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 transition"
                                                >
                                                    Renew
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />

            </SectionCard>
        </AuthenticatedLayout>
    );
}