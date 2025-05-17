import React from 'react';
// import { Link } from '@inertiajs/inertia-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage, Head } from "@inertiajs/react";
import SectionCard from '@/Components/SectionCard';

const Show = ({ auth, guide }) => {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Guide Details
                </h2>
            }
            showBackButton={true}
            backHref="/guides"
        >
            <Head title="Guide Details" />

            <SectionCard>
                <div className="bg-white p-4 rounded shadow">
                    <p className="mb-2"><strong>Full Name:</strong> {guide.full_name}</p>
                    <p className="mb-2"><strong>Username:</strong> {guide.username}</p>
                    <p className="mb-2"><strong>Email:</strong> {guide.email}</p>
                    <p className="mb-2"><strong>Phone Number:</strong> {guide.phone_number}</p>
                    <p className="mb-2"><strong>Years of Experience:</strong> {guide.years_of_experience}</p>
                    <p className="mb-2"><strong>Specializations:</strong> {guide.specializations}</p>
                </div>
            </SectionCard>
        </AuthenticatedLayout>
    );
};

export default Show;