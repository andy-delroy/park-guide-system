import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";

export default function Details({ auth, certification }) {
    const getRelativePath = (url) => {
        if (!url) return null;
        try {
            const parsedUrl = new URL(url);
            let path = parsedUrl.pathname;

            // Ensure the path starts with /storage
            if (!path.startsWith('/storage')) {
                path = '/storage' + (path.startsWith('/') ? path : '/' + path);
            }
            return path;
        } catch (error) {
            console.error('Invalid URL:', url, error);
            return null;
        }
    };

    const relativePath = getRelativePath(certification.certificate_file_url);
    const isImage = relativePath && /\.(jpg|jpeg|png)$/i.test(relativePath);
    const isPdf = relativePath && /\.pdf$/i.test(relativePath);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    License Details
                </h2>
            }
            showBackButton={true}
            backHref="/certification?type=license"
        >
            <Head title="License Details" />

            <SectionCard>
                {/* File Preview */}
                {relativePath ? (
                    <div className="mb-6">
                        {isImage ? (
                            <img
                                src={relativePath}
                                alt="License"
                                className="max-w-full h-auto rounded shadow border"
                                style={{ maxHeight: '400px' }}
                            />
                        ) : isPdf ? (
                            <embed
                                src={relativePath}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                                className="rounded shadow border"
                            />
                        ) : (
                            <p className="text-sm text-gray-500">
                                Unsupported file format.{" "}
                                <a
                                    href={relativePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                >
                                    Download file
                                </a>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">License</h3>
                        <div className="w-full h-[400px] bg-gray-100 border border-dashed border-gray-300 rounded shadow flex items-center justify-center">
                            <p className="text-sm text-gray-500">No license file uploaded.</p>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="space-y-6">
                    {/* Guide Info */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-1 mb-3">Guide Info</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem label="Guide ID" value={certification.guide?.identification_number || 'Unknown'} />
                            <DetailItem label="Guide Name" value={certification.guide?.full_name || 'Unknown'} />
                            <DetailItem label="Phone Number" value={certification.guide?.phone_number || 'N/A'} />
                        </div>
                    </div>

                    {/* License Info */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-1 mb-3">License</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem label="License Name" value={certification.certification_name} />
                            <DetailItem label="License Number" value={certification.certificate_number} />
                            <DetailItem label="Description" value={certification.description || "No description provided."} />
                            <DetailItem label="Issued By" value={certification.issuer?.full_name || 'N/A'} />
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-1 mb-3">Dates</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailItem label="Issue Date" value={certification.issue_date} />
                            <DetailItem label="Expiry Date" value={certification.expiry_date || 'N/A'} />
                        </div>
                    </div>
                </div>
            </SectionCard>
        </AuthenticatedLayout>
    );
}

// Reusable detail display component
function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}:</p>
            <p className="text-sm text-gray-900">{value}</p>
        </div>
    );
}
