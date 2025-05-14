import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

export default function Take({ auth, quiz }) {
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(quiz.time_duration * 60);
    const [isTimeUp, setIsTimeUp] = useState(false);

    const handleAnswerChange = (questionId, value) => {
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

    const handleSubmit = () => {
        // Calculate the number of correct answers
        const correctAnswers = calculateCorrectAnswers();

        // Prepare submission data
        const submissionData = {
            total_score: correctAnswers,
            time_taken: quiz.time_duration * 60 - timeLeft,
        };

        // Send the total score to the backend using axios
        axios
            .post(`/quiz/${quiz.id}/submit`, submissionData, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                console.log("Quiz submitted successfully:", response.data);
                setResult(`You got ${correctAnswers} out of ${quiz.questions.length} correct. Submission saved!`);

                // Redirect to the quiz index page
                window.location.href = route("quiz.index");
            })
            .catch((error) => {
                console.error("Error submitting quiz:", error.message, error.response?.data, error.response?.status);
                const errorMsg = error.response?.data?.error || error.message;
                setResult(`You got ${correctAnswers} out of ${quiz.questions.length} correct. Failed to submit quiz: ${errorMsg}`);
            });
    };

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !isTimeUp) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsTimeUp(true);
            handleSubmit();
        }
    }, [timeLeft, isTimeUp]);

    // Restrict user from leaving the page
    useEffect(() => {
        // Handle when the user tries to close or refresh the tab
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
            handleSubmit();
        };

        // Handle when the user switches tabs or minimizes the browser
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                console.log("User switched tabs or minimized the browser. Submitting the quiz...");
                handleSubmit();
            }
        };

        // Add event listeners
        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup event listeners when the component unmounts
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [answers]); // Add answers as a dependency to ensure latest answers are used

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
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">
                                {quiz.description}
                            </h3>
                            <div className="mb-4 text-red-500 font-bold">
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                                                                            if (isTimeUp) return;
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
                                                                        disabled={isTimeUp}
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
                                                                onChange={(e) => {
                                                                    if (isTimeUp) return;
                                                                    handleAnswerChange(question.id, e.target.value);
                                                                }}
                                                                className="mr-2"
                                                                disabled={isTimeUp}
                                                            />
                                                            <label>True</label>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`question_${question.id}`}
                                                                value="False"
                                                                onChange={(e) => {
                                                                    if (isTimeUp) return;
                                                                    handleAnswerChange(question.id, e.target.value);
                                                                }}
                                                                className="mr-2"
                                                                disabled={isTimeUp}
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
                                                        onChange={(e) => {
                                                            if (isTimeUp) return;
                                                            handleAnswerChange(question.id, e.target.value);
                                                        }}
                                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        disabled={isTimeUp}
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
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        disabled={isTimeUp}
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}