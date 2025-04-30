import React from "react";
import { Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Details({ auth, certification }) {
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
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Certification Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Guide ID:</p>
                                    <p className="text-sm text-gray-900">{certification.guide_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Program ID:</p>
                                    <p className="text-sm text-gray-900">{certification.program_id || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Certification Name:</p>
                                    <p className="text-sm text-gray-900">{certification.certification_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Description:</p>
                                    <p className="text-sm text-gray-900">{certification.description || "No description provided."}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Issue Date:</p>
                                    <p className="text-sm text-gray-900">{certification.issue_date}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Expiry Date:</p>
                                    <p className="text-sm text-gray-900">{certification.expiry_date || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Certificate Number:</p>
                                    <p className="text-sm text-gray-900">{certification.certificate_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Issued By:</p>
                                    <p className="text-sm text-gray-900">{certification.issuer.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Renewal Count:</p>
                                    <p className="text-sm text-gray-900">{certification.renewal_count}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status:</p>
                                    <p className="text-sm text-gray-900">{certification.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Certificate File URL:</p>
                                    <p className="text-sm text-gray-900">
                                        {certification.certificate_file_url ? (
                                            <a
                                                href={certification.certificate_file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline"
                                            >
                                                View Certificate
                                            </a>
                                        ) : (
                                            "No file uploaded."
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Verification Code:</p>
                                    <p className="text-sm text-gray-900">{certification.verification_code || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Requirements Description:</p>
                                    <p className="text-sm text-gray-900">{certification.requirements_description || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Validity Period (Months):</p>
                                    <p className="text-sm text-gray-900">{certification.validity_period_months || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Renewal Requirements:</p>
                                    <p className="text-sm text-gray-900">{certification.renewal_requirements || "N/A"}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Link
                                    href={route('certifications.index')}
                                    className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
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
}