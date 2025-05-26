import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react"; // Import usePage for flash messages
import { Inertia } from "@inertiajs/inertia";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";

export default function MentorMenteeIndex({ auth, guides = [], discussions = [], assignment }) {
    const pageProps = usePage().props; // Access flash messages
    const flash = pageProps.flash || {};
    const [selectedMentor, setSelectedMentor] = useState("");
    const [selectedMentee, setSelectedMentee] = useState("");
    const [assignProcessing, setAssignProcessing] = useState(false);
    const [success, setSuccess] = useState(flash.success || ""); // Use flash messages
    const [error, setError] = useState(flash.error || "");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState({});
    const userId = assignment ? (assignment.mentee_id === pageProps.auth.user.id ? assignment.mentee_id : assignment.mentor_id) : null;
    const isMentee = assignment && assignment.mentee_id === pageProps.auth.user.id;
    const isMentor = assignment && assignment.mentor_id === pageProps.auth.user.id;

    const handleAssign = (e) => {
        e.preventDefault();
        setAssignProcessing(true);
        setSuccess("");
        setError("");

        Inertia.post(
            "/mentor-mentee/assign",
            {
                mentor_id: selectedMentor,
                mentee_id: selectedMentee,
            },
            {
                onSuccess: () => {
                    setSuccess("Mentor assigned successfully!");
                    setSelectedMentor("");
                    setSelectedMentee("");
                    setAssignProcessing(false);
                },
                onError: (errors) => {
                    setError(
                        errors.mentee_id ||
                        errors.mentor_id ||
                        errors.error ||
                        "Failed to assign mentor."
                    );
                    setAssignProcessing(false);
                },
                preserveState: true, // Preserve form state on error
            }
        );
    };

    const handleAnswer = (discussionId, answer) => {
        Inertia.post(
            `/mentor-mentee/answer/${discussionId}`,
            { answer },
            {
                onSuccess: () => setAnswers((prev) => ({ ...prev, [discussionId]: "" })),
            }
        );
    };

    return (
        <AuthenticatedLayout user={pageProps.auth.user} header={<h2>Mentor-Mentee Assignment</h2>}>
            <Head title="Mentor-Mentee Assignment" />
            <SectionCard>
                {auth.user.role.role_name === "admin" && (
                    <form onSubmit={handleAssign} className="flex flex-col gap-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium mb-1">Mentor:</label>
                            <select
                                className="border rounded p-2 w-full"
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                required
                            >
                                <option value="">Select Mentor</option>
                                {guides.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mentee:</label>
                            <select
                                className="border rounded p-2 w-full"
                                value={selectedMentee}
                                onChange={(e) => setSelectedMentee(e.target.value)}
                                required
                            >
                                <option value="">Select Mentee</option>
                                {guides.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button typeAttr="submit" variant="create" className="...">
                            Assign
                        </Button>
                        {success && <div className="text-green-600">{success}</div>}
                        {error && <div className="text-red-600">{error}</div>}
                    </form>
                )}
                {isMentee && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            Inertia.post("/mentor-mentee/question", { message: question }, {
                                onSuccess: () => setQuestion(""),
                            });
                        }}
                        className="flex gap-2 mb-8"
                    >
                        <input
                            type="text"
                            className="border rounded p-2 flex-1"
                            placeholder="Type your question to your mentor"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            required
                        />
                        <Button typeAttr="submit" variant="create">Send</Button>
                    </form>
                )}

                {/* If user is a mentor, show questions and answer input */}
                {isMentor && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-2">Questions from your mentees:</h3>
                        {discussions.length === 0 && <div>No questions yet.</div>}
                        <ul>
                            {discussions.map(d => (
                                <li key={d.id} className="mb-4 border-b pb-2">
                                    <div className="font-semibold">{d.mentee?.full_name || "Mentee"}:</div>
                                    <div className="mb-2">{d.message}</div>
                                    {d.answer ? (
                                        <div className="text-green-700">Your answer: {d.answer}</div>
                                    ) : (
                                        <form
                                            onSubmit={e => {
                                                e.preventDefault();
                                                handleAnswer(d.id, answers[d.id] || "");
                                            }}
                                            className="flex gap-2 items-center"
                                        >
                                            <input
                                                type="text"
                                                className="border rounded p-1 flex-1"
                                                placeholder="Type your answer"
                                                value={answers[d.id] || ""}
                                                onChange={e => setAnswers(a => ({ ...a, [d.id]: e.target.value }))}
                                                required
                                            />
                                            <Button typeAttr="submit" variant="create">Answer</Button>
                                        </form>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}