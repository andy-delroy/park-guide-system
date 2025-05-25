import React from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";

export default function Create({ auth }) {
    const { course_id } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        time_duration: "",
        total_score: "",
        course_id: course_id || null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(data); // 👀 Confirm course_id is here

        // Send the POST request to create the quiz
        post(route("quiz.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create New Quiz
                </h2>
            }
            showBackButton={true}
            backHref={route("quiz.index")}
        >
            <Head title="Create Quiz" />
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
                        <input type="hidden" name="course_id" value={data.course_id} />
                        {errors.time_duration && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.time_duration}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Button type="create" disabled={processing} typeAttr="submit">
                            Create Quiz
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </AuthenticatedLayout>
    );
}