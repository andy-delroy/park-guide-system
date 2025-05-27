import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { useEffect } from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";

export default function MentorMenteeIndex({ auth, guides = [], discussions = [], assignment }) {
    const pageProps = usePage().props;
    const flash = pageProps.flash || {};
    const { url } = usePage();
    const params = new URLSearchParams(window.location.search);
    const initialMentorId = params.get("assign_mentor_id") || "";
    const [selectedMentor, setSelectedMentor] = useState(initialMentorId);
    // const [selectedMentor, setSelectedMentor] = useState("");
    const [selectedMentee, setSelectedMentee] = useState("");
    const [assignProcessing, setAssignProcessing] = useState(false);
    const [success, setSuccess] = useState(flash.success || "");
    const [error, setError] = useState(flash.error || "");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState({});
    const userId = assignment ? (assignment.mentee_id === pageProps.auth.user.id ? assignment.mentee_id : assignment.mentor_id) : null;
    const isMentee = assignment && assignment.mentee_id === pageProps.auth.user.id;
    const isMentor = assignment && assignment.mentor_id === pageProps.auth.user.id;

    useEffect(() => {
        if (
            initialMentorId &&
            guides.some(g => String(g.id) === String(initialMentorId))
        ) {
            setSelectedMentor(String(initialMentorId));
        }
    }, [guides, initialMentorId]);

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
                    // Inertia.visit("/guides"); // <-- redirect to guides after assign
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
                preserveState: true,
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
                {/* Admin Assignment Form */}
                {auth.user.role.role_name === "admin" && (
                    <form onSubmit={handleAssign} className="flex flex-col gap-6 mb-10 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-xl font-semibold mb-2 text-[--forest-green]">Assign Mentor & Mentee</h3>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Mentor:</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={selectedMentor}
                                    onChange={(e) => setSelectedMentor(e.target.value)}
                                    required
                                    disabled={!!initialMentorId} // disables if pre-selected
                                >
                                    <option value="">Select Mentor</option>
                                    {guides.map((g) => (
                                        <option key={g.id} value={String(g.id)}>
                                            {g.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Mentee:</label>
                                <select
                                    className="border rounded p-2 w-full"
                                    value={selectedMentee}
                                    onChange={(e) => setSelectedMentee(e.target.value)}
                                    required
                                >
                                    <option value="">Select Mentee</option>
                                    {guides.map((g) => (
                                        <option key={g.id} value={String(g.id)}>
                                        {g.full_name}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button typeAttr="submit" variant="create" className="w-32" disabled={assignProcessing}>
                                {assignProcessing ? "Assigning..." : "Assign"}
                            </Button>
                            <Link href="/guides" className="w-32">
                                <Button typeAttr="button" variant="secondary" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                )}

                {/* Mentee Question Form */}
                {isMentee && (
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            Inertia.post("/mentor-mentee/question", { message: question }, {
                                onSuccess: () => setQuestion(""),
                            });
                        }}
                        className="flex gap-2 mb-8 bg-white p-4 rounded-lg shadow border border-gray-100"
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

                {/* Questions & Answers Section */}
                {(auth.user.role.role_name !== "admin" && (isMentor || isMentee)) && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4 text-[--forest-green]">Questions & Answers</h3>
                        {discussions.length === 0 && (
                            <div className="text-gray-500 text-center py-8">No questions yet.</div>
                        )}
                        <ul className="space-y-6">
                            {discussions.map(d => (
                                <li key={d.id} className="bg-gray-50 rounded-lg p-4 shadow border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-[--forest-green]">{d.mentee?.full_name || "Mentee"}:</span>
                                        <span className="text-gray-700">{d.message}</span>
                                    </div>
                                    {d.answer ? (
                                        <div className="ml-4 mt-2 p-2 bg-green-50 border-l-4 border-green-400 rounded text-green-800">
                                            <span className="font-semibold">Mentor Answer:</span> {d.answer}
                                        </div>
                                    ) : isMentor ? (
                                        <form
                                            onSubmit={e => {
                                                e.preventDefault();
                                                handleAnswer(d.id, answers[d.id] || "");
                                            }}
                                            className="flex gap-2 items-center mt-2 ml-4"
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
                                    ) : (
                                        <div className="ml-4 text-gray-400 italic">No answer yet.</div>
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