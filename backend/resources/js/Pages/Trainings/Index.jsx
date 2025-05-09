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
    

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
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

                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="sticky top-0 z-10 shadow text-xs text-gray-700 uppercase bg-gray-50 darK:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                        <tr className="text-nowrap">
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Name of Training</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2">Start Date</th>
                            <th className="px-3 py-2">End Date</th>
                            <th className="px-3 py-2">Location</th>
                            <th className="px-3 py-2">Capacity</th>
                            {auth.user?.role?.role_name === "guide" && (
                                <th className="px-3 py-2">Enrolment</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {trainings.data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    No trainings found.
                                </td>
                            </tr>
                        ) : (
                            trainings.data.map((training) => (
                                <tr key={training.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-3 py-3">{training.id}</td>
                                <td className="px-3 py-3">{training.title}</td>
                                <td className="px-3 py-3">{training.description}</td>
                                <td className="px-3 py-3">{training.start_date}</td>
                                <td className="px-3 py-3">{training.end_date}</td>
                                <td className="px-3 py-3">{training.location}</td>
                                <td className="px-3 py-3">{training.capacity}</td>
                                {auth.user?.role?.role_name === "guide" && (
                                    <td className="px-3 py-3">
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
                                </tr>   
                            ))
                        )}
                    </tbody>
                </table>
            </SectionCard> 
        </AuthenticatedLayout>
    );
}
