import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia'; // Added for Inertia.delete
import { Link, usePage, Head } from '@inertiajs/react'; // Added Head
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Added for template
import SectionCard from '@/Components/SectionCard'; // Added for template

export default function ModuleIndex() {
  const { course, modules, groups, auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [modulesState, setModules] = useState(modules || []);
  const [moduleGroups, setModuleGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [courseProgress, setCourseProgress] = useState(0);
  const [message, setMessage] = useState({ success: null, error: null }); // Added for messages

  useEffect(() => {
    const ungroupedGroup = { id: 'ungrouped', name: 'Ungrouped', modules: [] };

    let allGroups = Array.isArray(groups)
      ? groups.map(g => ({ id: g.id.toString(), name: g.name, modules: [] }))
      : [];

    allGroups.push(ungroupedGroup);

    if (Array.isArray(groups) && groups.length > 0) {
      const customGroups = groups.map(g => ({ id: g.id.toString(), name: g.name, modules: [] }));
      allGroups = [...customGroups, ...allGroups.filter(g => g.id === 'ungrouped')];
    }

    const groupedModules = allGroups.map(group => {
      const modulesInGroup = modulesState.filter(m => 
        group.id === 'ungrouped' ? !m.group_id : m.group_id?.toString() === group.id
      );
      return { ...group, modules: modulesInGroup };
    });

    const filteredGroups = groupedModules.filter(g => 
      g.id === 'ungrouped' || g.modules.length > 0
    );

    setModuleGroups(filteredGroups);

    const initialExpandedState = {};
    filteredGroups.forEach(g => {
      initialExpandedState[g.id] = true;
    });
    setExpandedGroups(initialExpandedState);

    calculateCourseProgress();
  }, [modulesState]);

  const calculateCourseProgress = () => {
    let completedCount = 0;
    let totalResources = 0;

    modulesState.forEach(module => {
      if (module.resources) {
        module.resources.forEach(resource => {
          totalResources++;
          const moduleProgress = localStorage.getItem(`course_${course.id}_module_${module.id}_progress`);
          if (moduleProgress) {
            const completedResources = JSON.parse(moduleProgress);
            if (completedResources.includes(resource.id)) {
              completedCount++;
            }
          }
        });
      }
    });

    const progress = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;
    setCourseProgress(progress);
  };

  const onDragEnd = async (result) => {
    if (!result.destination || !isAdmin) return;

    const sourceGroupId = result.source.droppableId.replace('group-', '');
    const destGroupId = result.destination.droppableId.replace('group-', '');

    const sourceGroup = moduleGroups.find(g => g.id === sourceGroupId);
    const destGroup = moduleGroups.find(g => g.id === destGroupId);

    if (!sourceGroup || !destGroup) return;

    const moduleIndex = result.source.index;
    const movedModule = sourceGroup.modules[moduleIndex];

    if (!movedModule) return;

    const newModuleGroups = [...moduleGroups];

    const sourceGroupIndex = newModuleGroups.findIndex(g => g.id === sourceGroupId);
    newModuleGroups[sourceGroupIndex].modules.splice(moduleIndex, 1);

    const destGroupIndex = newModuleGroups.findIndex(g => g.id === destGroupId);
    newModuleGroups[destGroupIndex].modules.splice(result.destination.index, 0, {
      ...movedModule,
      group_id: destGroupId === 'ungrouped' ? null : destGroupId
    });

    setModuleGroups(newModuleGroups);

    try {
      await axios.post(`/courses/${course.id}/modules/${movedModule.id}/group`, {
        group_id: destGroupId === 'ungrouped' ? null : destGroupId
      });

      setModules(prev =>
        prev.map(m =>
          m.id === movedModule.id
            ? { ...m, group_id: destGroupId === 'ungrouped' ? null : destGroupId }
            : m
        )
      );

      if (sourceGroupId === destGroupId) {
        const reorderedModules = newModuleGroups[destGroupIndex].modules.map((m, index) => ({
          id: m.id,
          position: index + 1
        }));

        await axios.post(`/courses/${course.id}/modules/reorder`, {
          modules: reorderedModules
        });

        setModules(newModuleGroups.flatMap(g => g.modules));
      }

      setMessage({ success: 'Module order and group updated.', error: null }); // Added
    } catch (error) {
      console.error('Failed to update module order or group:', error);
      setMessage({ success: null, error: 'Failed to update module order or group.' }); // Added
    }
  };

  const toggleDropdown = (moduleId) => {
    setOpenDropdownId(openDropdownId === moduleId ? null : moduleId);
  };
  
  const toggleGroup = (groupId) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId]
    });
  };
  
  const createNewGroup = async () => {
    if (!newGroupName.trim()) {
      setMessage({ success: null, error: 'Group name cannot be empty.' }); // Added
      return;
    }
  
    try {
      const response = await axios.post(`/courses/${course.id}/groups`, {
        name: newGroupName,
      });
  
      const newGroup = response.data;
  
      setModuleGroups([
        ...moduleGroups,
        { id: newGroup.id.toString(), name: newGroup.name, modules: [] },
      ]);
  
      setNewGroupName('');
      setShowCreateGroup(false);
      setMessage({ success: 'Group created successfully.', error: null }); // Added
    } catch (error) {
      console.error('Failed to create group:', error);
      setMessage({ success: null, error: 'Failed to create group.' }); // Added
    }
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

  const getModuleProgress = (moduleId) => {
    const savedProgress = localStorage.getItem(`course_${course.id}_module_${moduleId}_progress`);
    if (!savedProgress) return 0;
    
    const completedResources = JSON.parse(savedProgress);
    const module = modulesState.find(m => m.id === moduleId);
    
    if (!module || !module.resources || module.resources.length === 0) return 0;
    return Math.round((completedResources.length / module.resources.length) * 100);
  };

  const getGroupName = (groupId) => { // Added for group display
    if (!groupId) return 'Ungrouped';
    const group = groups.find((g) => g.id.toString() === groupId.toString());
    return group ? group.name : 'Ungrouped';
  };

  const handleDelete = (moduleId) => { // Added for Inertia-based deletion
    if (window.confirm('Are you sure you want to delete this module?')) {
      Inertia.delete(`/courses/${course?.id}/modules/${moduleId}`, {
        onSuccess: () => {
          setModuleGroups(moduleGroups.map(g => ({
            ...g,
            modules: g.modules.filter(m => m.id !== moduleId)
          })));
          setMessage({ success: 'Module deleted successfully.', error: null });
        },
        onError: () => {
          setMessage({ success: null, error: 'Failed to delete module.' });
        },
      });
    }
  };

  return (
    <AuthenticatedLayout
      user={user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Module Management
        </h2>
      }
    >
      <Head title="Module Management" />

      <SectionCard>
        {message.success && (
          <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">
            {message.success}
          </div>
        )}
        {message.error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {message.error}
          </div>
        )}

        <div className="mb-4 flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Modules for {course?.title}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Course Progress: {courseProgress}%</span>
              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${courseProgress}%` }}
                ></div>
              </div>
            </div>
            {isAdmin && (
              <div className="flex space-x-2">
                <Link
                  href={`/courses/${course?.id}/modules/create`}
                  className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                  + Add New Module
                </Link>
                <Link
                  href={`/courses/${course?.id}/edit`}
                  className="inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                  Edit Course
                </Link>
                {!showCreateGroup ? (
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="inline-block rounded bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-700"
                  >
                    + Add New Group
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      autoFocus
                    />
                    <button
                      onClick={createNewGroup}
                      className="inline-block rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowCreateGroup(false)}
                      className="inline-block rounded bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {moduleGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div
                className="flex items-center justify-between bg-gray-50 p-3 rounded-t-lg border border-gray-200 cursor-pointer"
                onClick={() => toggleGroup(group.id)}
              >
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">{expandedGroups[group.id] ? '▼' : '⯈'}</span>
                  {group.name}
                  <span className="ml-2 text-sm text-gray-500">({group.modules.length})</span>
                </h3>
              </div>

              {expandedGroups[group.id] && (
                <Droppable droppableId={`group-${group.id}`}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="overflow-x-auto"
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Material Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {group.modules.length > 0 ? (
                            group.modules.map((mod, index) => (
                              <Draggable
                                key={mod.id}
                                draggableId={`module-${mod.id}`}
                                index={index}
                                isDragDisabled={!isAdmin}
                              >
                                {(provided) => (
                                  <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                      <Link
                                        href={`/courses/${course.id}/modules/${mod.id}`}
                                        className={`text-indigo-600 hover:text-indigo-900 ${getModuleColor(mod.material_type)}`}
                                      >
                                        {mod.title}
                                      </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {mod.material_type || 'N/A'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <span className="mr-2">{getModuleProgress(mod.id)}%</span>
                                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                          <div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            style={{ width: `${getModuleProgress(mod.id)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                      <Link
                                        href={`/courses/${course.id}/modules/${mod.id}/edit`}
                                        className="text-indigo-600 hover:text-indigo-900"
                                      >
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => handleDelete(mod.id)}
                                        className="ml-4 text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-6 py-4 text-center text-sm text-gray-500"
                              >
                                No modules in this group. {isAdmin && 'Drag modules here.'}
                              </td>
                            </tr>
                          )}
                          {provided.placeholder}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          ))}
        </DragDropContext>

        {(!moduleGroups.length || (moduleGroups.length === 1 && moduleGroups[0].id === 'ungrouped' && moduleGroups[0].modules.length === 0)) && (
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900">No modules yet</h3>
            <p className="text-gray-600 mt-2">Add modules to start building your course</p>
            {isAdmin && (
              <Link
                href={`/courses/${course?.id}/modules/create`}
                className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
              >
                Add Module
              </Link>
            )}
          </div>
        )}
      </SectionCard>
    </AuthenticatedLayout>
  );
}