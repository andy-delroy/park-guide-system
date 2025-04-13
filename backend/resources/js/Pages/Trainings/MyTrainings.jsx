import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function MyTrainings({ auth, trainings }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Trainings
                </h2>
            }
        >
            <Head title="My Trainings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                                    <tr>
                                        <th className="px-3 py-2">Title</th>
                                        <th className="px-3 py-2">Start Date</th>
                                        <th className="px-3 py-2">End Date</th>
                                        <th className="px-3 py-2">Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainings.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
                                                You are not enrolled in any trainings.
                                            </td>
                                        </tr>
                                    ) : (
                                        trainings.data.map((training) => (
                                            <tr key={training.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-3 py-3">{training.title}</td>
                                                <td className="px-3 py-3">{training.start_date}</td>
                                                <td className="px-3 py-3">{training.end_date}</td>
                                                <td className="px-3 py-3">{training.location}</td>
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
