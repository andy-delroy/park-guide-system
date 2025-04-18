import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { Inertia } from "@inertiajs/inertia";

export default function Index({ auth, trainings }) {
    const handleEnroll = async (trainingId) => {
        try {
            const response = await axios.post(
                `/api/trainings/${trainingId}/enroll`,
                {},
                { responseType: 'blob' } //To download .ics file
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                        <div className="flex justify-end mb-4 space-x-2">
                            {auth.user?.role?.role_name === "guide" && (
                                <a
                                href={route("my-trainings")}
                                className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded shadow hover:bg-indigo-700 transition"
                                >
                                View My Trainings
                                </a>
                            )}

                            {auth.user?.role?.role_name === "admin" && (
                                <a
                                href={route("trainings.create")}
                                className="inline-block px-4 py-2 bg-green-600 text-white font-semibold text-sm rounded shadow hover:bg-green-700 transition"
                                >
                                Add Training
                                </a>
                            )}
                            </div>

                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 darK:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                                    <tr className="text-nowrap">
                                        <th className="px-3 py-2">ID</th>
                                        <th className="px-3 py-2">Name of Training</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="px-3 py-2">Start Date</th>
                                        <th className="px-3 py-2">End Date</th>
                                        <th className="px-3 py-2">Location</th>
                                        <th className="px-3 py-2">Capacity</th>
                                        <th className="px-3 py-2">Enrolment</th>
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
                                            <td className="px-3 py-3">
                                                {auth.user?.role?.role_name !== "admin" && (
                                                    training.is_enrolled ? (
                                                    <span className="text-gray-600 font-bold">Already Enrolled</span>
                                                    ) : (
                                                    <button
                                                        className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                        onClick={() => handleEnroll(training.id)}
                                                    >
                                                        Enroll
                                                    </button>
                                                    )
                                                )}
                                                </td>
                                          </tr>   
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
