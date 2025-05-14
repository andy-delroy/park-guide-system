import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import SectionCard from "@/Components/SectionCard";

export default function Take({ auth, quiz }) {
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(quiz.time_duration * 60);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status

    const handleAnswerChange = (questionId, value) => {
        if (isTimeUp || isSubmitted) return;
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    // Function to calculate correct answers
    const calculateCorrectAnswers = () => {
        let correctAnswers = 0;

        quiz.questions.forEach((question) => {
            const correctAnswer = question.correct_answer?.toLowerCase();
            const userAnswer = answers[question.id];

            if (question.question_type === "Multiple Answer MCQ") {
                if (
                    Array.isArray(userAnswer) &&
                    Array.isArray(correctAnswer) &&
                    JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())
                ) {
                    correctAnswers++;
                }
            } else {
                if (userAnswer?.toLowerCase() === correctAnswer) {
                    correctAnswers++;
                }
            }
        });

        return correctAnswers;
    };

    const handleSubmit = async (reason = "manual") => {
        if (isSubmitted || isTimeUp) return; // Prevent duplicate submissions
        setIsSubmitted(true);

        // Calculate the number of correct answers
        const correctAnswers = calculateCorrectAnswers();

        // Prepare submission data
        const submissionData = {
            total_score: correctAnswers,
            time_taken: quiz.time_duration * 60 - timeLeft,
        };

        try {
            const response = await axios.post(`/quiz/${quiz.id}/submit`, submissionData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setResult(
                `You got ${correctAnswers} out of ${quiz.questions.length} correct. Submission saved (${
                    reason === "manual" ? "manual submission" : "auto-submitted due to " + reason
                })!`
            );

            // Redirect to the quiz index page after a short delay to show result
            setTimeout(() => {
                window.location.href = route("quiz.index");
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            setResult(
                `You got ${correctAnswers} out of ${quiz.questions.length} correct. Failed to submit quiz: ${errorMsg}`
            );
        }
    };

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !isTimeUp && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            setIsTimeUp(true);
            handleSubmit("time up");
        }
    }, [timeLeft, isTimeUp, isSubmitted]);

    // Handle page leave or tab switch
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!isSubmitted && !isTimeUp) {
                event.preventDefault();
                event.returnValue = "Your quiz will be auto-submitted if you leave the page.";
                handleSubmit("page leave");
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden" && !isSubmitted && !isTimeUp) {
                handleSubmit("tab switch or minimize");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [answers, isSubmitted, isTimeUp]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Take Quiz: {quiz.title}
                </h2>
            }
        >
            <Head title={`Take Quiz: ${quiz.title}`} />
            <SectionCard>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {quiz.description}
                </h3>
                <div className="mb-4 text-red-500 font-bold">
                    Time Left: {formatTime(timeLeft)}
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit("manual");
                    }}
                >
                    <ul className="space-y-4">
                        {quiz.questions.map((question, index) => (
                            <li key={index} className="border p-4 rounded-md">
                                <p className="font-medium text-gray-800">
                                    {index + 1}. {question.question}
                                </p>
                                {question.question_type === "MCQ" ||
                                question.question_type === "Multiple Answer MCQ" ? (
                                    question.options && question.options.length > 0 ? (
                                        <ul className="mt-2 space-y-2">
                                            {question.options.map((option, idx) => {
                                                const optionText = typeof option === "string" ? option : option.text;
                                                return (
                                                    <li key={idx} className="flex items-center">
                                                        <input
                                                            type={
                                                                question.question_type === "Multiple Answer MCQ"
                                                                    ? "checkbox"
                                                                    : "radio"
                                                            }
                                                            name={`question_${question.id}`}
                                                            value={optionText}
                                                            onChange={(e) => {
                                                                if (isTimeUp || isSubmitted) return;
                                                                if (question.question_type === "Multiple Answer MCQ") {
                                                                    const selectedOptions = answers[question.id] || [];
                                                                    if (e.target.checked) {
                                                                        setAnswers((prev) => ({
                                                                            ...prev,
                                                                            [question.id]: [...selectedOptions, optionText],
                                                                        }));
                                                                    } else {
                                                                        setAnswers((prev) => ({
                                                                            ...prev,
                                                                            [question.id]: selectedOptions.filter(
                                                                                (o) => o !== optionText
                                                                            ),
                                                                        }));
                                                                    }
                                                                } else {
                                                                    handleAnswerChange(question.id, e.target.value);
                                                                }
                                                            }}
                                                            className="mr-2"
                                                            disabled={isTimeUp || isSubmitted}
                                                        />
                                                        <label>{optionText}</label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-red-500">No options available for this question.</p>
                                    )
                                ) : question.question_type === "True/False" ? (
                                    <div className="mt-2">
                                        <ul className="space-y-2">
                                            <li className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`question_${question.id}`}
                                                    value="True"
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="mr-2"
                                                    disabled={isTimeUp || isSubmitted}
                                                />
                                                <label>True</label>
                                            </li>
                                            <li className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`question_${question.id}`}
                                                    value="False"
                                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                                    className="mr-2"
                                                    disabled={isTimeUp || isSubmitted}
                                                />
                                                <label>False</label>
                                            </li>
                                        </ul>
                                    </div>
                                ) : question.question_type === "Fill in the Blank" ? (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Enter your answer"
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            disabled={isTimeUp || isSubmitted}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        Unsupported question type: {question.question_type}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                            disabled={isTimeUp || isSubmitted}
                        >
                            Submit Quiz
                        </button>
                    </div>
                </form>
                {result && (
                    <div className="mt-6 p-4 bg-green-100 text-green-800 rounded">
                        {result}
                    </div>
                )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}