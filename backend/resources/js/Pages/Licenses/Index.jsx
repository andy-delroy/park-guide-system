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
    const isAdmin = auth.user.role.role_name === 'admin';
    const isGuide = auth.user.role.role_name === 'guide';

    const licenseOnly = certifications.filter(cert => cert.type === 'license');

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this license?")) {
            Inertia.delete(`/certification/${id}`, {
                onSuccess: () => {
                    setMessage({
                        success: "License deleted successfully.",
                        error: null,
                    });
                },
                onError: (errors) => {
                    setMessage({
                        success: null,
                        error: "Failed to delete license. Please try again.",
                    });
                },
            });
        }
    };

    const handleRenew = (id) => {
        if (confirm("Are you sure you want to renew this license?")) {
            Inertia.post(`/certification/${id}/renew`, {}, {
                onSuccess: () => {
                    setMessage({
                        success: "License renewed successfully.",
                        error: null,
                    });
                },
                onError: () => {
                    setMessage({
                        success: null,
                        error: "Failed to renew license. Please try again.",
                    });
                },
            });
        }
    };

    const getRelativePath = (url) => {
        if (!url) return null;
        try {
            const parsedUrl = new URL(url);
            return '/storage' + parsedUrl.pathname; // add /storage in front
        } catch (error) {
            // url might be relative already
            return url.startsWith('/') ? '/storage' + url : '/storage/' + url;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isAdmin ? "License Management" : "My Licenses"}
                </h2>
            }
        >
            <Head title={isAdmin ? "License Management" : "My Licenses"} />

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
                    {isAdmin && (
                        <h3 className="text-lg font-medium text-gray-900">
                        Licenses
                        </h3>
                    )}
                    {auth.user.role.role_name === 'admin' && (
                        <Link href="/certification/create?type=license">
                            <Button>+ Create New License</Button>
                        </Link>
                    )}
                </div>

                {isAdmin && (
                    <DataGridTable
                        rows={licenseOnly.map((cert) => ({
                            id: cert.id,
                            certification_name: cert.certification_name,
                            issued_to: cert.guide.full_name,
                            issued_by: cert.issuer.full_name,
                            issue_date: cert.issue_date,
                            expiry_date: cert.expiry_date,
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
                            { field: "expiry_date", headerName: "Expiry Date", flex: 1 },
                            {
                                field: "actions",
                                headerName: "Actions",
                                flex: 1,
                                sortable: false,
                                filterable: false,
                                renderCell: ({ row }) => (
                                    <div className="flex space-x-2">
                                        {auth.user.role.role_name === "admin" && (
                                            <>
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
                                                {row.expiry_date && (() => {
                                                    const expiry = new Date(row.expiry_date);
                                                    const now = new Date();
                                                    const daysToExpiry = (expiry - now) / (1000 * 60 * 60 * 24); // difference in days

                                                    return daysToExpiry <= 30 && daysToExpiry >= 0;
                                                })() && (
                                                    <ButtonThin
                                                        type="success"
                                                        onClick={() => handleRenew(row.id)}
                                                    >
                                                        Renew
                                                    </ButtonThin>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}

                {isGuide && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {licenseOnly.map((cert) => {
                            const relativePath = getRelativePath(cert.certificate_file_url);
                            const isImage = relativePath && /\.(jpg|jpeg|png)$/i.test(relativePath);

                            return (
                            <SectionCard key={cert.id}>
                                {/* Certificate preview */}
                                {isImage && (
                                    <Link href={`/certification/${cert.id}/details`}>
                                        <a>
                                            <img
                                                src={relativePath}
                                                alt={`${cert.certification_name} certificate`}
                                                className="mt-3 max-h-80 w-full object-contain rounded border cursor-pointer"
                                            />
                                        </a>
                                    </Link>
                                )}
                            </SectionCard>
                            );
                        })}
                        </div>
                    )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}