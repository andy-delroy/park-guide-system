import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";

export default function AddQuestion({ auth, quiz }) {
    const { data, setData, post, processing, errors } = useForm({
        question: "",
        question_type: "MCQ", // Default question type
        options: [],
        correct_answer: "",
    });

    const handleAddOption = () => {
        setData("options", [...data.options, ""]);
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...data.options];
        updatedOptions[index] = value;
        setData("options", updatedOptions);
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = [...data.options];
        updatedOptions.splice(index, 1);
        setData("options", updatedOptions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Send the POST request to store the question
        post(route("quizzes.questions.store", quiz.id), {
            onSuccess: () => {
                // Redirect back to the Edit Quiz page
                window.location.href = route("quiz.edit", quiz.id);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Question to Quiz: {quiz.title}
                </h2>
            }
        >
            <Head title="Add Question" />
            <SectionCard>
                <form onSubmit={handleSubmit}>
                    {/* Question Text */}
                    <div className="mb-4">
                        <label
                            htmlFor="question"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Question
                        </label>
                        <textarea
                            id="question"
                            value={data.question}
                            onChange={(e) => setData("question", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        ></textarea>
                        {errors.question && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.question}
                            </div>
                        )}
                    </div>

                    {/* Question Type */}
                    <div className="mb-4">
                        <label
                            htmlFor="question_type"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Question Type
                        </label>
                        <select
                            id="question_type"
                            value={data.question_type}
                            onChange={(e) => setData("question_type", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="MCQ">MCQ</option>
                            <option value="True/False">True/False</option>
                            <option value="Fill in the Blank">Fill in the Blank</option>
                            <option value="Multiple Answer MCQ">Multiple Answer MCQ</option>
                        </select>
                        {errors.question_type && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.question_type}
                            </div>
                        )}
                    </div>

                    {/* Options (for MCQ and Multiple Answer MCQ) */}
                    {(data.question_type === "MCQ" ||
                        data.question_type === "Multiple Answer MCQ") && (
                        <div className="mb-4">
                            <label
                                htmlFor="options"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Options
                            </label>
                            {data.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) =>
                                            handleOptionChange(index, e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Add Option
                            </button>
                        </div>
                    )}

                    {/* Correct Answer */}
                    <div className="mb-4">
                        <label
                            htmlFor="correct_answer"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Correct Answer
                        </label>
                        <input
                            type="text"
                            id="correct_answer"
                            value={data.correct_answer}
                            onChange={(e) => setData("correct_answer", e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.correct_answer && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.correct_answer}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            disabled={processing}
                        >
                            Add Question
                        </button>
                    </div>
                </form>
            </SectionCard>
        </AuthenticatedLayout>
    );
}