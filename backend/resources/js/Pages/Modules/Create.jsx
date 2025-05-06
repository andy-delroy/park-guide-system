import React, { useState } from 'react';
import { Link, useForm, usePage, router  } from '@inertiajs/react';

export default function ModuleCreate() {
  const { course, module, groups } = usePage().props;
  const isEditing = !!module?.id;

  // Initialize resources from module data or empty array
  const initialResources = module?.resources || [];
  const [resources, setResources] = useState(
    initialResources.map((res, index) => ({
      index,
      title: res.title || '',
      type: res.type || 'link',
      url: res.url || '',
      file: null,
    }))
  );

  const { data, setData, post, put, errors, processing } = useForm({
    title: module?.title || '',
    description: module?.description || '',
    material_type: module?.material_type || 'Other',
    resources: resources,
  });

  const addResource = () => {
    const newIndex = resources.length;
    setResources([...resources, { index: newIndex, title: '', type: 'link', url: '', file: null }]);
    setData('resources', [...resources, { index: newIndex, title: '', type: 'link', url: '', file: null }]);
  };

  const removeResource = (index) => {
    const updatedResources = resources.filter((res) => res.index !== index);
    setResources(updatedResources);
    setData('resources', updatedResources);
  };

  const updateResource = (index, field, value) => {
    const updatedResources = resources.map((res) =>
      res.index === index ? { ...res, [field]: value } : res
    );
    setResources(updatedResources);
    setData('resources', updatedResources);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('material_type', data.material_type);
    //formData.append('group_id', data.group_id);
  
    resources.forEach((res, i) => {
      formData.append(`resources[${i}][title]`, res.title);
      formData.append(`resources[${i}][type]`, res.type);
      if (res.type === 'link') {
        formData.append(`resources[${i}][url]`, res.url || '');
      } else if (res.type === 'file' && res.file) {
        formData.append(`resources[${i}][file]`, res.file);
      }
    });
  
    const url = isEditing
    ? `/courses/${course.id}/modules/${module.id}`
    : `/courses/${course.id}/modules`;

  router.post(url, formData, {
    forceFormData: true,
    onError: (err) => console.error('Validation Errors', err),
    onSuccess: () => console.log('Saved successfully!'),
  });
};

  const groupList = Array.isArray(groups) && groups.length > 0 ? groups : [];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-800 text-white p-6 flex-shrink-0">
        <h2 className="text-xl font-bold mb-8">{course?.title || 'Course'}</h2>
        <nav className="space-y-2">
          <Link href="/courses"className="block px-4 py-2 text-sm bg-blue-900 rounded-md">All Courses</Link>
          <Link
            href={`/courses/${course?.id || '#'}/modules`}
            className="block px-4 py-2 text-sm bg-blue-900 rounded-md"
          >
            Modules
          </Link>
          <Link
            href={`/courses/${course?.id || '#'}/grades`}
            className="block px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition"
          >
            Grades
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Module' : 'Create Module'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? `Editing module for ${course?.title || 'course'}` : `Add a new module to ${course?.title || 'course'}`}
          </p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Module Title
              </label>
              <input
                id="title"
                type="text"
                value={data.name}
                onChange={(e) => setData('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows="4"
              />
              {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="material_type" className="block text-sm font-medium text-gray-700">
                Material Type
              </label>
              <select
                id="material_type"
                value={data.material_type}
                onChange={(e) => setData('material_type', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Video">Video</option>
                <option value="Document">Document</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Reading">Reading</option>
                <option value="Interactive">Interactive</option>
                <option value="Other">Other</option>
              </select>
              {errors.material_type && <p className="mt-2 text-sm text-red-600">{errors.material_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Resources</label>
              <div className="mt-2 space-y-4">
                {resources.map((resource) => (
                  <div key={resource.index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Resource {resource.index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeResource(resource.index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor={`resource-title-${resource.index}`} className="block text-sm font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          id={`resource-title-${resource.index}`}
                          type="text"
                          value={resource.title}
                          onChange={(e) => updateResource(resource.index, 'title', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                        {errors[`resources.${resource.index}.title`] && (
                          <p className="mt-2 text-sm text-red-600">{errors[`resources.${resource.index}.title`]}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`resource-type-${resource.index}`} className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          id={`resource-type-${resource.index}`}
                          value={resource.type}
                          onChange={(e) => updateResource(resource.index, 'type', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="link">Video/Link</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      {resource.type === 'link' ? (
                        <div>
                          <label htmlFor={`resource-url-${resource.index}`} className="block text-sm font-medium text-gray-700">
                            URL
                          </label>
                          <input
                            id={`resource-url-${resource.index}`}
                            type="url"
                            value={resource.url}
                            onChange={(e) => updateResource(resource.index, 'url', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                          {errors[`resources.${resource.index}.url`] && (
                            <p className="mt-2 text-sm text-red-600">{errors[`resources.${resource.index}.url`]}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label htmlFor={`resource-file-${resource.index}`} className="block text-sm font-medium text-gray-700">
                            File
                          </label>
                          <input
                            id={`resource-file-${resource.index}`}
                            type="file"
                            accept=".pdf,.doc,.docx,.mp4"
                            onChange={(e) => updateResource(resource.index, 'file', e.target.files[0])}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {resource.url && (
                            <p className="mt-2 text-sm text-gray-500">Current file: {resource.url}</p>
                          )}
                          {errors[`resources.${resource.index}.file`] && (
                            <p className="mt-2 text-sm text-red-600">{errors[`resources.${resource.index}.file`]}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResource}
                  className="mt-2 inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
                >
                  Add Resource
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/courses/${course?.id || '#'}/modules`}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isEditing ? 'Update Module' : 'Create Module'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}