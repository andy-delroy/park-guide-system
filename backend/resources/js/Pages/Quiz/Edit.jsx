import React from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";

export default function Edit({ auth, quiz, existingQuestions }) {
    const { data, setData, put, processing, errors } = useForm({
        title: quiz.title || "",
        description: quiz.description || "",
        time_duration: quiz.time_duration || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("quiz.update", quiz.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Quiz
                </h2>
            }
            showBackButton={true}
            backHref={route("quiz.index")}
        >
            <Head title="Edit Quiz" />
            <SectionCard>
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.title && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.title}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        ></textarea>
                        {errors.description && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    {/* Time Duration */}
                    <div className="mb-4">
                        <label
                            htmlFor="time_duration"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Time Duration (in minutes)
                        </label>
                        <input
                            type="number"
                            id="time_duration"
                            value={data.time_duration}
                            onChange={(e) => setData("time_duration", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.time_duration && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.time_duration}
                            </div>
                        )}
                    </div>

                    {/* Questions Table */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Questions</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Question
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Correct Answer
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {existingQuestions.map((question, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {question.question}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {question.question_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {question.correct_answer}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                                    
                    {/* Submit Button */}
                    <div className="flex gap-4 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link
                            href={route("quizzes.questions.create", quiz.id)}
                        >
                            <Button type="create">
                                Add Questions
                            </Button>
                        </Link>
                        <Button
                            type="update"
                            disabled={processing}
                            typeAttr="submit"
                        >
                            {processing ? "Updating..." : "Update Quiz"}
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </AuthenticatedLayout>
    );
}