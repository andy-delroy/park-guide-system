import SectionCard from "@/Components/SectionCard";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        capacity: 10,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("trainings.store"));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Add New Training</h2>}>
            <Head title="Add Training" />
            <SectionCard>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block">Name of Training</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block">Start Date</label>
                        <input
                            type="datetime-local"
                            value={data.start_date}
                            onChange={(e) => setData("start_date", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                    </div>

                    <div>
                        <label className="block">End Date</label>
                        <input
                            type="datetime-local"
                            value={data.end_date}
                            onChange={(e) => setData("end_date", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                    </div>

                    <div>
                        <label className="block">Location</label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => setData("location", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                    </div>

                    <div>
                        <label className="block">Capacity</label>
                        <input
                            type="number"
                            value={data.capacity}
                            onChange={(e) => setData("capacity", e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Save Training
                    </button>
                </form>
            </SectionCard>
        </AuthenticatedLayout>
    );
}
