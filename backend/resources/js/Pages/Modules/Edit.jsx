import React, { useState } from 'react';
import { Link, useForm, usePage, router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SectionCard from '@/Components/SectionCard';
import Button from '@/Components/Button';
import ButtonThin from '@/Components/ButtonThin';

export default function ModuleEdit() {
  const { course, module, auth } = usePage().props;
  const isAdmin = ['admin', 'superadmin'].includes(auth?.user?.role_name);

  // Initialize resources from module data or empty array
  const initialResources = module?.resources || [];
  const [resources, setResources] = useState(
    initialResources.map((res, index) => ({
      id: res.id || null, // Include resource ID
      index,
      title: res.title || '',
      type: res.type || 'link',
      url: res.url || '',
      file: null,
    }))
  );

  const { data, setData, errors, processing } = useForm({
    title: module?.title || '',
    description: module?.description || '',
    material_type: module?.material_type || 'Other',
    resources: resources,
  });

  const addResource = () => {
    const newIndex = resources.length;
    const newResource = { id: null, index: newIndex, title: '', type: 'link', url: '', file: null };
    setResources([...resources, newResource]);
    setData('resources', [...resources, newResource]);
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
    formData.append('description', data.description || '');
    formData.append('material_type', data.material_type);
  
    resources.forEach((res, i) => {
      if (!res.title && !res.url && !res.file) return;
      formData.append(`resources[${i}][id]`, res.id || '');
      formData.append(`resources[${i}][title]`, res.title || '');
      formData.append(`resources[${i}][type]`, res.type);
      if (res.type === 'link') {
        formData.append(`resources[${i}][url]`, res.url || '');
      } else if (res.type === 'file') {
        if (res.file) {
          formData.append(`resources[${i}][file]`, res.file);
        }
        if (res.url) {
          formData.append(`resources[${i}][url]`, res.url);
        }
      }
    });
  
    console.log(`Updating Module #${module.id}`);
    console.log('Updated fields:', data);
  
    router.post(`/courses/${course.id}/modules/${module.id}`, formData, {
      method: 'post', // PUT may be blocked by some setups; use override
      headers: { 'X-HTTP-Method-Override': 'PUT' },
      forceFormData: true,
      preserveState: false,
      onError: (err) => {
        console.error('Validation or server errors:', err);
      },
      onSuccess: () => {
        console.log('Module updated successfully!');
        router.visit(`/courses/${course.id}/modules`);
      },
      onFinish: () => {
        console.log('Request completed.');
      },
    });
  };
  

  const renderVideoPreview = (url, title) => {
    const platform = url?.includes('youtube.com') || url?.includes('youtu.be') ? 'youtube'
                   : url?.includes('vimeo.com') ? 'vimeo'
                   : 'generic';
    let embedUrl = url;
    if (platform === 'youtube') {
      const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } else if (platform === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }

    if (!embedUrl) {
      return <div className="p-3 bg-red-100 text-red-700 text-sm text-center rounded">Invalid video URL</div>;
    }

    return (
      <div className="relative aspect-video mt-2 border border-gray-200 rounded overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title={title}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <AuthenticatedLayout
        user={auth?.user}
        header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Access Denied</h2>}
        showBackButton={true}
        backHref={`/courses/${course.id}/modules`}
      >
        <Head title="Access Denied" />
        <SectionCard>
          <div className="bg-white p-8 rounded shadow max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">Only admins can edit modules.</p>
            <Link
              href={`/courses/${course.id}/modules`}
            >
              <Button type="cancel">Back to Modules</Button>
            </Link>
          </div>
        </SectionCard>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Module</h2>}
      showBackButton={true}
      backHref={`/courses/${course.id}/modules`}
    >
      <Head title="Edit Module" />

      <SectionCard>
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {Object.values(errors)[0]}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Editing module for {course?.title || 'course'}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Module Title
              </label>
              <input
                id="title"
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      <ButtonThin
                        type="detail"
                        onClick={() => removeResource(resource.index)}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </ButtonThin>
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                          {resource.url && renderVideoPreview(resource.url, resource.title)}
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
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                <Button
                  type="create"
                  onClick={addResource}
                >
                  Add Resource
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/courses/${course?.id}/modules`}
              >
                <Button type="cancel">
                  Cancel
                </Button>
              </Link>
              <Button
                type="update"
                typeAttr="submit"
                disabled={processing}
              >
                {processing ? 'Updating...' : 'Update Module'}
              </Button>
            </div>
          </form>
        </div>
      </SectionCard>
    </AuthenticatedLayout>
  );
}