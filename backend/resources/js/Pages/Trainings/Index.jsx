import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { Inertia } from "@inertiajs/inertia";

export default function Index({ auth, trainings }) {
    const handleEnroll = async (trainingId) => {
        try {
            const response = await axios.post(
                `/trainings/${trainingId}/enroll`,
                {},
                { responseType: 'blob' }
            );
    
            const blob = new Blob([response.data], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'training.ics');
            document.body.appendChild(link);
            link.click();
            link.remove();
    
            alert("Enrollment successful! ICS file downloaded.");
            Inertia.visit(route("my-trainings"));
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Training is full.");
            } else if (error.response && error.response.status === 409) {
                alert("Already enrolled.");
            } else {
                alert("Something went wrong.");
            }
        }
    };

    const handleUnenroll = async (trainingId) => {
        try {
            await axios.delete(`/trainings/${trainingId}/unenroll`);
            alert("Enrollment cancelled successfully!");
            Inertia.visit(route("my-trainings"));
        } catch (error) {
            alert("Something went wrong while cancelling enrollment.");
        }
    };
    
    const handleDelete = async (trainingId) => {
        if (!confirm("Are you sure you want to delete this training?")) return;
    
        try {
            await axios.delete(`/trainings/${trainingId}`);
            alert("Training deleted successfully.");
            Inertia.reload({ only: ['trainings'] }); // reload only the training data
        } catch (error) {
            alert("Something went wrong while deleting the training.");
        }
    };
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Trainings
                </h2>
            }
        >
            <Head title="Trainings" />

            <SectionCard> 
                <div className="flex justify-end mb-4 space-x-2">
                    {auth.user?.role?.role_name === "guide" && (
                        <Link href={route("my-trainings")}>
                            <Button type="info">View My Trainings</Button>
                        </Link>
                    )}

                    {auth.user?.role?.role_name === "admin" && (
                        <Link href={route("trainings.create")}>
                            <Button>Add Training</Button>
                        </Link>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name of Training</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">End Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Capacity</th>
                                {auth.user?.role?.role_name === "guide" && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enrolment</th>
                                )}
                                {auth.user?.role?.role_name === "admin" && (
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {trainings.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No trainings found.
                                    </td>
                                </tr>
                            ) : (
                                trainings.data.map((training) => (
                                    <tr key={training.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.id}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.description}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.start_date}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.end_date}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.location}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{training.capacity}</td>
                                        {auth.user?.role?.role_name === "guide" && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {training.is_enrolled ? (
                                                    <Button type="danger" onClick={() => handleUnenroll(training.id)}>
                                                        Cancel Enrollment
                                                    </Button>
                                                ) : (
                                                    <Button type="success" onClick={() => handleEnroll(training.id)}>
                                                        Enroll
                                                    </Button>
                                                )}
                                            </td>
                                        )}
                                        {auth.user?.role?.role_name === "admin" && (
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 flex space-x-2">
                                                <Link href={route("trainings.edit", training.id)}>
                                                    <Button type="success">Edit</Button>
                                                </Link>
                                                <Button type="danger" onClick={() => handleDelete(training.id)}>
                                                    Delete
                                                </Button>
                                            </td>                                
                                        )}
                                    </tr>   
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard> 
        </AuthenticatedLayout>
    );
}
