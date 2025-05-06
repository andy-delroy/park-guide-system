import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

export default function ModuleIndex() {
  const { course, modules, groups, auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [modulesState, setModules] = useState(modules || []);
  const [originalModules, setOriginalModules] = useState(modules || []); // Store original order before drag

  const onDragEnd = async (result) => {
    if (!result.destination || !isAdmin) return;
  
    const reordered = Array.from(modulesState);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
  
    setModules(reordered);
  
    // Auto-save without prompt
    try {
      const payload = reordered.map((m, index) => ({
        id: m.id,
        position: index + 1,
      }));
  
      await axios.post(`/courses/${course.id}/modules/reorder`, { modules: payload });
  
      console.log('Module order updated.');
    } catch (error) {
      console.error('Failed to update module order:', error);
    }
  };

  const toggleDropdown = (moduleId) => {
    setOpenDropdownId(openDropdownId === moduleId ? null : moduleId);
  };

  const renderVideoPreview = (url, title) => {
    const platform = url?.includes('youtube.com') || url?.includes('youtu.be') ? 'youtube' :
                     url?.includes('vimeo.com') ? 'vimeo' : 'generic';
    let embedUrl = url;
    if (platform === 'youtube') {
      const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } else if (platform === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }
    if (!embedUrl) {
      return <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">Invalid video URL</div>;
    }
    return (
      <div className="relative aspect-video overflow-hidden rounded-md border border-gray-200 mt-2">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={title}
        />
      </div>
    );
  };

  const groupList = Array.isArray(groups) && groups.length > 0 ? groups : [{ id: 'ungrouped', name: 'Modules' }];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-800 text-white p-6 flex-shrink-0">
        <h2 className="text-xl font-bold mb-8">{course?.title || 'Course'}</h2>
        <nav className="space-y-2">
          <Link href="/courses" className="block px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition">ALL Courses</Link>
          <Link href={`/courses/${course?.id}/modules`} className="block px-4 py-2 text-sm bg-blue-900 rounded-md">Modules</Link>
          <Link href={`/courses/${course?.id}/grades`} className="block px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition">Grades</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="mt-2 text-gray-600">{course?.description || 'No description available.'}</p>
          {isAdmin && (
            <div className="mt-4 flex space-x-4">
              <Link href={`/courses/${course?.id}/modules/create`} className="inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition">+ Add Module</Link>
              <Link href={`/courses/${course?.id}/edit`} className="inline-flex px-4 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-md hover:bg-blue-50 transition">Edit Course</Link>
            </div>
          )}
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          {groupList.map((group) => (
            <section key={group.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{group.name}</h2>
              <Droppable droppableId={`group-${group.id}`}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {(modulesState || []).filter(m => m.group_id === group.id || (group.id === 'ungrouped' && !m.group_id)).map((mod, index) => {
                      const moduleResources = Array.isArray(mod.resources) ? mod.resources : [];
                      const isDropdownOpen = openDropdownId === mod.id;

                      return (
                        <Draggable key={mod.id} draggableId={`module-${mod.id}`} index={index} isDragDisabled={!isAdmin}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white border border-gray-200 rounded-lg">
                              <Link
                                href={`/courses/${course.id}/modules/${mod.id}`}
                                className={`block p-4 flex items-center gap-3 no-underline rounded ${getModuleColor(mod.material_type)} text-black`}
                              >
                                <span className="flex-1 text-black font-semibold">{mod.title}</span>
                                <span className="text-white text-sm">{'>'}</span>
                              </Link>

                              {isAdmin && (
                                <div className="relative px-4 pb-2">
                                  <button
                                    className="text-gray-500 text-lg hover:scale-110 transition"
                                    onClick={() => toggleDropdown(mod.id)}
                                    aria-label="Module actions"
                                  >
                                    ⋮
                                    </button>
                                  {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md z-50">
                                      <Link
                                        href={`/courses/${course?.id}/modules/${mod.id}/edit`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => console.log('Navigating to edit:', `/courses/${course?.id}/modules/${mod.id}/edit`)}
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to delete this module?')) {
                                            axios.delete(`/courses/${course?.id}/modules/${mod.id}`, {
                                              headers: {
                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                                              },
                                            })
                                              .then(() => {
                                                setModules(modulesState.filter(m => m.id !== mod.id));
                                                console.log('Module deleted successfully:', mod.id);
                                              })
                                              .catch(error => {
                                                console.error('Failed to delete module:', error);
                                                alert('Failed to delete module.');
                                              });
                                          }
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          ))}
        </DragDropContext>

        {(!Array.isArray(modules) || modules.length === 0) && (
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
            <div className="text-4xl mb-4 text-blue-600"></div>
            <h3 className="text-lg font-semibold text-gray-900">modules here yet :O</h3>
            <p className="text-gray-600 mt-2">Add modules to start building your course :D</p>
            {isAdmin && (
              <Link href={`/courses/${course?.id}/modules/create`} className="mt-4 inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition">Add Module</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const getModuleColor = (type) => {
  const colors = {
    'Video': 'bg-blue-100 text-blue-800',
    'Document': 'bg-gray-100 text-gray-800',
    'Quiz': 'bg-green-100 text-green-800',
    'Assignment': 'bg-yellow-100 text-yellow-800',
    'Reading': 'bg-purple-100 text-purple-800',
    'Interactive': 'bg-pink-100 text-pink-800',
    'Other': 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors['Other'];
};