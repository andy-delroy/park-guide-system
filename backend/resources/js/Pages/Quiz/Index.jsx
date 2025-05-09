import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index({ auth, quizzes }) {
    const isAdmin = auth.user.role_name === "admin"; // Check if the user is an admin
    const isGuide = auth.user.role_name === "guide"; // Check if the user is a guide
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Quiz Management
                </h2>
            }
        >
            <Head title="Quiz Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* Show Create Button for Admins Only */}
                            {isAdmin && (
                                <Link
                                    href={route("quiz.create")}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Create New Quiz
                                </Link>
                            )}

                            {/* Table to Display Quizzes */}
                            <table className="min-w-full divide-y divide-gray-200 mt-4">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time Duration (mins)
                                        </th>
                                        {isGuide && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Score
                                        </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {quizzes.map((quiz) => (
                                        <tr key={quiz.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {quiz.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {quiz.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {quiz.time_duration}
                                            </td>
                                            {isGuide && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {quiz.total_score}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center space-x-4">
                                                {/* Show Edit and Delete Buttons for Admins Only */}
                                                {isAdmin && (
                                                    <>
                                                        <Link
                                                            href={route("quiz.edit", quiz.id)}
                                                            className="text-blue-500 hover:underline mr-4"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            as="button"
                                                            method="delete"
                                                            href={route("quiz.destroy", quiz.id)}
                                                            className="text-red-500 hover:underline"
                                                            onClick={(e) => {
                                                                if (!confirm("Are you sure you want to delete this quiz?")) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Link>
                                                    </>
                                                )}
                                                {/* Show Go to Quiz Button for Guides Only */}
                                                {isGuide && (
                                                    <Link
                                                        href={route("quiz.take", quiz.id)} // Replace with the actual route for taking the quiz
                                                        className="text-green-500 hover:underline ml-4"
                                                    >
                                                        Go to Quiz
                                                    </Link>
                                                )}
                                                </div>
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
    );
}