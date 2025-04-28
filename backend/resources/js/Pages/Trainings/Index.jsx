import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { Inertia } from "@inertiajs/inertia";

export default function Index({ auth, trainings }) {
    const handleEnroll = async (trainingId) => {
        try {
            const response = await axios.post(`/api/trainings/${trainingId}/enroll`);
            alert(response.data.message);
            // Optionally refresh the page or data
            Inertia.visit(route("my-trainings"));
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("You are not authorized to enroll.");
            } else if (error.response && error.response.status === 409) {
                alert("You are already enrolled in this training.");
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
                        <div className="flex justify-end mb-4">
                                    <a
                                        href={route("my-trainings")}
                                        className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded shadow hover:bg-indigo-700 transition"
                                    >
                                        View My Trainings
                                    </a>
                                </div>
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 darK:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                                    <tr className="text-nowrap">
                                        <th className="px-3 py-2">ID</th>
                                        <th className="px-3 py-2">Title</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="px-3 py-2">Start Date</th>
                                        <th className="px-3 py-2">End Date</th>
                                        <th className="px-3 py-2">Location</th>
                                        <th className="px-3 py-2">Capacity</th>
                                        <th className="px-3 py-2">Action</th>
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
                                                    <button
                                                        className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                        onClick={() => handleEnroll(training.id)}
                                                    >
                                                        Enroll
                                                    </button>
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
