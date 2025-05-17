import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import DataGridTable from "@/Components/DataGridTable";
import Button from "@/Components/Button";
import ButtonThin from "@/Components/ButtonThin";

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
            <SectionCard>
                <div className="mb-4 flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                            Quizzes
                    </h3>
                    {/* Show Create Button for Admins Only */}
                    {isAdmin && (
                        <Link href={route("quiz.create")}>
                            <Button>+ Create New Quiz</Button>
                        </Link>
                    )}
                </div>

                {quizzes.length > 0 ? (
                    <DataGridTable
                        rows={quizzes.map((quiz) => ({
                        id: quiz.id,
                        title: quiz.title,
                        description: quiz.description,
                        time_duration: quiz.time_duration,
                        guide_score: quiz.guide_score,
                        }))}
                        columns={[
                        { field: "title", headerName: "Title", flex: 1, minWidth: 150 },
                        { field: "description", headerName: "Description", flex: 2, minWidth: 250 },
                        { field: "time_duration", headerName: "Time Duration (mins)", flex: 0.7, minWidth: 130, type: "number" },
                        ...(isGuide
                            ? [{
                                field: "guide_score",
                                headerName: "Total Score",
                                flex: 0.7,
                                minWidth: 110,
                                renderCell: (params) => (params.value !== null ? params.value : "N/A"),
                                sortable: false,
                                filterable: false,
                            }]
                            : []),
                        {
                            field: "actions",
                            headerName: "Actions",
                            flex: 1,
                            minWidth: 180,
                            sortable: false,
                            filterable: false,
                            renderCell: (params) => {
                            const quiz = params.row;
                            return (
                                <div className="flex items-center space-x-2">
                                {isAdmin && (
                                    <>
                                    <Link
                                        href={route("quiz.edit", quiz.id)}
                                    >
                                        <ButtonThin type="edit">
                                            Edit
                                        </ButtonThin>
                                    </Link>
                                    <Link
                                        as="button"
                                        method="delete"
                                        href={route("quiz.destroy", quiz.id)}
                                        onClick={(e) => {
                                        if (!confirm("Are you sure you want to delete this quiz?")) {
                                            e.preventDefault();
                                        }
                                        }}
                                    >
                                        <ButtonThin type="delete">
                                            Delete
                                        </ButtonThin>
                                    </Link>
                                    </>
                                )}
                                {isGuide && quiz.guide_score === null && (
                                    <Link
                                    href={route("quiz.take", quiz.id)}
                                    >
                                        <ButtonThin type="success">
                                            Take Quiz
                                        </ButtonThin>
                                    </Link>
                                )}
                                </div>
                            );
                            },
                        },
                        ]}
                        checkboxSelection={false}
                        onRowClick={(params) => {
                        // Optional: handle row click if needed
                        }}
                    />
                    ) : (
                    <div className="text-center text-gray-500 py-4">No quizzes found.</div>
                    )}
            </SectionCard>
        </AuthenticatedLayout>
    );
}