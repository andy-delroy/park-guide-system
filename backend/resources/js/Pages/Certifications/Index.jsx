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

    const certificateOnly = certifications.filter(cert => cert.type === 'certificate');

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

    const getRelativePath = (url) => {
        if (!url) return null;
        try {
            const parsedUrl = new URL(url);
            let path = parsedUrl.pathname;

            // Remove leading `/storage` if it exists to avoid duplication
            if (path.startsWith('/storage')) {
                path = path.replace(/^\/storage/, '');
            }

            return '/storage' + path;
        } catch (error) {
            // url might already be relative
            let path = url.startsWith('/') ? url : '/' + url;

            if (path.startsWith('/storage')) {
                path = path.replace(/^\/storage/, '');
            }

            return '/storage' + path;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {isAdmin ? "Certification Management" : "My Certifications"}
                </h2>
            }
        >
            <Head title={isAdmin ? "Certification Management" : "My Certifications"} />

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
                        Certifications
                        </h3>
                    )}
                    {auth.user.role.role_name === 'admin' && (
                        <Link href="/certification/create?type=certificate">
                            <Button>+ Create New Certificate</Button>
                        </Link>
                    )}
                </div>

                {isAdmin && (
                    <DataGridTable
                        rows={certificateOnly.map((cert) => ({
                            id: cert.id,
                            certification_name: cert.certification_name,
                            issued_to: cert.guide.full_name,
                            issued_by: cert.issuer.full_name,
                            issue_date: cert.issue_date,
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
                        {certificateOnly.map((cert) => {
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