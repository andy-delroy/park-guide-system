import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Index({auth, trainings})
{
    return (
        <AuthenticatedLayout
        user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
           <Head title="Trainings"></Head> 

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100"> 
                            {/* <pre>{JSON.stringify(trainings, undefined, 2)}</pre>  */}

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
                                    </tr>

                                </thead>
                                <tbody>
                                    {trainings.data.map((training) => (
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <th className="px-3 py-3">
                                                {training.id}
                                            </th>
                                            <td className="px-3 py-3">
                                                {training.title}
                                            </td>
                                            <td className="px-3 py-3">
                                                {training.description}
                                            </td>
                                            <td className="px-3 py-3">
                                                {training.start_date}
                                            </td>
                                            <td className="px-3 py-3">
                                                {training.end_date}
                                            </td>
                                            <td className="px-3 py-3">
                                                {training.location}
                                            </td>
                                            <td className="px-3 py-3">
                                                {training.capacity}
                                            </td>
                                        </tr>
                                    ))}
                                   
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}