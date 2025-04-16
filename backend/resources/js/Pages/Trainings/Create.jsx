import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ auth }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    capacity: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("trainings.store"));
  };

  return (
    <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Training</h2>}>
      <Head title="Create Training" />
      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-6 shadow-sm sm:rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Title</label>
                <input type="text" className="form-input w-full" value={data.title} onChange={e => setData("title", e.target.value)} />
                {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
              </div>

              <div>
                <label className="block font-medium">Description</label>
                <textarea className="form-input w-full" value={data.description} onChange={e => setData("description", e.target.value)} />
              </div>

              <div>
                <label className="block font-medium">Start Date</label>
                <input type="datetime-local" className="form-input w-full" value={data.start_date} onChange={e => setData("start_date", e.target.value)} />
              </div>

              <div>
                <label className="block font-medium">End Date</label>
                <input type="datetime-local" className="form-input w-full" value={data.end_date} onChange={e => setData("end_date", e.target.value)} />
              </div>

              <div>
                <label className="block font-medium">Location</label>
                <input type="text" className="form-input w-full" value={data.location} onChange={e => setData("location", e.target.value)} />
              </div>

              <div>
                <label className="block font-medium">Capacity</label>
                <input type="number" className="form-input w-full" value={data.capacity} onChange={e => setData("capacity", e.target.value)} />
              </div>

              <div>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
