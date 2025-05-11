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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                        Quizzes
                                </h3>
                                {/* Show Create Button for Admins Only */}
                                {isAdmin && (
                                    <Link
                                        href={route("quiz.create")}
                                        className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                                    >
                                        Create New Quiz
                                    </Link>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                            {/* Table to Display Quizzes */}
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Time Duration (mins)
                                            </th>
                                            {isGuide && (
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Total Score
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {quizzes.length > 0 ?
                                            quizzes.map((quiz) => (
                                            <tr key={quiz.id}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {quiz.title}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {quiz.description}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {quiz.time_duration}
                                                </td>
                                                {isGuide && (
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {quiz.guide_score !== null ? quiz.guide_score : "N/A"}
                                                    </td>
                                                )}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    <div className="flex items-center space-x-4">
                                                    {/* Show Edit and Delete Buttons for Admins Only */}
                                                    {isAdmin && (
                                                        <>
                                                            <Link
                                                                href={route("quiz.edit", quiz.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Link
                                                                as="button"
                                                                method="delete"
                                                                href={route("quiz.destroy", quiz.id)}
                                                                className="ml-4 text-red-600 hover:text-red-900"
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
                                                    {isGuide && quiz.guide_score === null && (
                                                        <Link
                                                            href={route("quiz.take", quiz.id)} // Replace with the actual route for taking the quiz
                                                            className="text-green-600 hover:text-indigo-900"
                                                        >
                                                            Go to Quiz
                                                        </Link>
                                                    )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                                >
                                                    No quizzes found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}