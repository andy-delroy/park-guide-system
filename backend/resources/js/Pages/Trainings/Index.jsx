import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SectionCard from "@/Components/SectionCard";
import Button from "@/Components/Button";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { Inertia } from "@inertiajs/inertia";
import DataGridTable from "@/Components/DataGridTable";
import ButtonThin from "@/Components/ButtonThin";

export default function Index({ auth, trainings }) {
    const handleEnroll = async (trainingId) => {
        try {
            const response = await axios.post(
                `/trainings/${trainingId}/enroll`,
                {},
                { responseType: 'blob' }
            );
    
            const blob = new Blob([response.data], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'training.ics');
            document.body.appendChild(link);
            link.click();
            link.remove();
    
            alert("Enrollment successful! ICS file downloaded.");
            Inertia.visit(route("my-trainings"));
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Training is full.");
            } else if (error.response && error.response.status === 409) {
                alert("Already enrolled.");
            } else {
                alert("Something went wrong.");
            }
        }
    };

    const handleUnenroll = async (trainingId) => {
        try {
            await axios.delete(`/trainings/${trainingId}/unenroll`);
            alert("Enrollment cancelled successfully!");
            Inertia.visit(route("my-trainings"));
        } catch (error) {
            alert("Something went wrong while cancelling enrollment.");
        }
    };
    
    const handleDelete = async (trainingId) => {
        if (!confirm("Are you sure you want to delete this training?")) return;
    
        try {
            await axios.delete(`/trainings/${trainingId}`);
            alert("Training deleted successfully.");
            Inertia.reload({ only: ['trainings'] }); // reload only the training data
        } catch (error) {
            alert("Something went wrong while deleting the training.");
        }
    };
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Training Management
                </h2>
            }
        >
            <Head title="Training Management" />

            <SectionCard> 
                <div className="mb-4 flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                            Trainings
                    </h3>

                    {auth.user?.role?.role_name === "guide" && (
                        <Link href={route("my-trainings")}>
                            <Button type="detail">View My Trainings</Button>
                        </Link>
                    )}

                    {auth.user?.role?.role_name === "admin" && (
                        <Link href={route("trainings.create")}>
                            <Button>+ Create New Training</Button>
                        </Link>
                    )}
                </div>

                <DataGridTable
                    columns={[
                        { field: "id", headerName: "ID", width: 70 },
                        { field: "title", headerName: "Name of Training", flex: 1 },
                        { field: "description", headerName: "Description", flex: 1 },
                        { field: "start_date", headerName: "Start Date", width: 130 },
                        { field: "end_date", headerName: "End Date", width: 130 },
                        { field: "location", headerName: "Location", width: 130 },
                        { field: "capacity", headerName: "Capacity", width: 100 },
                        ...(auth.user?.role?.role_name === "guide"
                            ? [{
                                field: "enrollment",
                                headerName: "Enrollment",
                                width: 200,
                                sortable: false,
                                renderCell: (params) => (
                                    params.row.is_enrolled ? (
                                        <ButtonThin type="delete" onClick={() => handleUnenroll(params.row.id)}>
                                            Cancel Enrollment
                                        </ButtonThin>
                                    ) : (
                                        <ButtonThin type="success" onClick={() => handleEnroll(params.row.id)}>
                                            Enroll
                                        </ButtonThin>
                                    )
                                )
                            }]
                            : []),
                        ...(auth.user?.role?.role_name === "admin"
                            ? [{
                                field: "actions",
                                headerName: "Actions",
                                width: 200,
                                sortable: false,
                                renderCell: (params) => (
                                    <div className="flex space-x-2">
                                        <Link href={route("trainings.edit", params.row.id)}>
                                            <ButtonThin type="edit">
                                                Edit
                                            </ButtonThin>
                                        </Link>
                                        <ButtonThin type="delete" onClick={() => handleDelete(params.row.id)}>
                                            Delete
                                        </ButtonThin>
                                    </div>
                                )
                            }]
                            : []),
                    ]}
                    rows={trainings.data}
                    checkboxSelection={false}
                />

            </SectionCard> 
        </AuthenticatedLayout>
    );
}
