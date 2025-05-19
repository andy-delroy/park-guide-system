import SectionCard from "@/Components/SectionCard";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import Button from "@/Components/Button";
import DataGridTable from '@/Components/DataGridTable';

export default function MyTrainings({ auth, trainings }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Trainings
                </h2>
            }
            showBackButton={true}
            backHref={route("trainings.index")}
        >
            <Head title="My Trainings" />

            <SectionCard>
                {/* Download Schedule Button */}
                <div className="flex justify-end mb-4">
                    <a
                        href={route("my-trainings.download")}
                    >
                        <Button type="detail">
                            Download Schedule (ICS)
                        </Button>
                    </a>
                </div>

                {/* Training Table */}
                <DataGridTable
                    rows={trainings.data.map((training) => ({
                        id: training.id,
                        title: training.title,
                        start_date: training.start_date,
                        end_date: training.end_date,
                        location: training.location,
                    }))}
                    columns={[
                        { field: 'title', headerName: 'Name of Training', flex: 1 },
                        { field: 'start_date', headerName: 'Start Date', flex: 1 },
                        { field: 'end_date', headerName: 'End Date', flex: 1 },
                        { field: 'location', headerName: 'Location', flex: 1 },
                    ]}
                />

            </SectionCard>
        </AuthenticatedLayout>
    );
}
