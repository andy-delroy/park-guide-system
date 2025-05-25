import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia'; // Added for Inertia.delete
import { Link, usePage, Head } from '@inertiajs/react'; // Added Head
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Added for template
import SectionCard from '@/Components/SectionCard'; // Added for template
import Button from '@/Components/Button';
import ButtonThin from '@/Components/ButtonThin';

export default function ModuleIndex() {
  const { course, modules, quizzes, groups, auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [openDropdownId, setOpenDropdownId] = useState(null);
  // const [modulesState, setModules] = useState(modules || []);

  const [itemsState, setItemsState] = useState(() => {
    const taggedModules = modules.map(m => ({ ...m, type: 'module' }));
    const taggedQuizzes = quizzes.map(q => ({ ...q, type: 'quiz' }));
    return [...taggedModules, ...taggedQuizzes];
  });
  const [moduleGroups, setModuleGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [courseProgress, setCourseProgress] = useState(0);
  const [message, setMessage] = useState({ success: null, error: null }); // Added for messages
  const [localGroups, setLocalGroups] = useState(groups || []);


  const rebuildModuleGroups = (items) => {
    const ungroupedGroup = { id: 'ungrouped', name: 'Ungrouped', items: [] };

    let allGroups = Array.isArray(groups)
      ? groups.map(g => ({ id: g.id.toString(), name: g.name, items: [] }))
      : [];

    allGroups.push(ungroupedGroup);

    if (Array.isArray(groups) && groups.length > 0) {
      const customGroups = groups.map(g => ({ id: g.id.toString(), name: g.name, items: [] }));
      allGroups = [...customGroups, ...allGroups.filter(g => g.id === 'ungrouped')];
    }

    const groupedItems = allGroups.map(group => {
      const itemsInGroup = items.filter(item =>
        group.id === 'ungrouped' ? !item.group_id : item.group_id?.toString() === group.id
      );
      return { ...group, items: itemsInGroup };
    });

    const filteredGroups = groupedItems.filter(g =>
      g.id === 'ungrouped' || g.items.length > 0
    );

    setModuleGroups(filteredGroups);

    const initialExpanded = {};
    filteredGroups.forEach(g => {
      initialExpanded[g.id] = true;
    });
    setExpandedGroups(initialExpanded);
  };

  useEffect(() => {
    const ungroupedGroup = { id: 'ungrouped', name: 'Ungrouped', items: [] };

    let allGroups = Array.isArray(groups)
      ? localGroups.map(g => ({ id: g.id.toString(), name: g.name, items: [] }))
      : [];

    allGroups.push(ungroupedGroup);

    if (Array.isArray(localGroups) && localGroups.length > 0) {
      const customGroups = localGroups.map(g => ({ id: g.id.toString(), name: g.name, items: [] }));
      allGroups = [...customGroups, ...allGroups.filter(g => g.id === 'ungrouped')];
    }

    const groupedItems = allGroups.map(group => {
      const itemsInGroup = itemsState.filter(item =>
        group.id === 'ungrouped' ? !item.group_id : item.group_id?.toString() === group.id
      );
      return { ...group, items: itemsInGroup };
    });

    // const filteredGroups = groupedItems.filter(g =>
    //   g.id === 'ungrouped' || g.items.length > 0
    // );
    const filteredGroups = groupedItems;

    setModuleGroups(filteredGroups);

    const initialExpandedState = {};
    filteredGroups.forEach(g => {
      initialExpandedState[g.id] = true;
    });
    setExpandedGroups(initialExpandedState);

    calculateCourseProgress();
  }, [itemsState]);

  const calculateCourseProgress = () => {
    let completedCount = 0;
    let totalResources = 0;

    itemsState
      .filter(item => item.type === 'module')
      .forEach(module => {
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

    const progress = totalResources > 0
      ? Math.round((completedCount / totalResources) * 100)
      : 0;

    setCourseProgress(progress);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this empty group?")) return;

    try {
      await axios.delete(`/groups/${groupId}`);
      setModuleGroups(prev => prev.filter(g => g.id !== groupId));
      setItemsState(prev => prev.filter(i => i.group_id?.toString() !== groupId)); //remove assigned items
      setMessage({ success: 'Group deleted.', error: null });
    } catch (error) {
      console.error('Failed to delete group:', error);
      setMessage({ success: null, error: 'Failed to delete group.' });
    }
  };

    const onDragEnd = async (result) => {
    if (!result.destination || !isAdmin) return;

    const sourceGroupId = result.source.droppableId.replace('group-', '');
    const destGroupId = result.destination.droppableId.replace('group-', '');

    const sourceGroup = moduleGroups.find(g => g.id === sourceGroupId);
    const destGroup = moduleGroups.find(g => g.id === destGroupId);
    if (!sourceGroup || !destGroup) return;

    const movedItem = sourceGroup.items[result.source.index];
    if (!movedItem) return;

    const newGroups = [...moduleGroups];
    const sourceIndex = newGroups.findIndex(g => g.id === sourceGroupId);
    const destIndex = newGroups.findIndex(g => g.id === destGroupId);

    // Remove from source, insert into destination
    newGroups[sourceIndex].items.splice(result.source.index, 1);
    newGroups[destIndex].items.splice(result.destination.index, 0, {
      ...movedItem,
      group_id: destGroupId === 'ungrouped' ? null : destGroupId,
    });

    setModuleGroups(newGroups);
    // Update itemsState so useEffect can reflect new group state
    //update itemSGroup right here in this useEffect so the page dont gotta manual reload
    const updatedItems = itemsState.map(item => {
      if (item.id === movedItem.id && item.type === movedItem.type) {
        return { ...item, group_id: destGroupId === 'ungrouped' ? null : destGroupId };
      }
      return item;
    });
    setItemsState(updatedItems);

    try {
      // Update group assignment
      const url =
        movedItem.type === 'module'
          ? `/courses/${course.id}/modules/${movedItem.id}/group`
          : `/courses/${course.id}/quizzes/${movedItem.id}/group`;

      await axios.post(url, {
        group_id: destGroupId === 'ungrouped' ? null : destGroupId,
      });

      // Reordering logic (within same group)
      if (sourceGroupId === destGroupId) {
        const reordered = newGroups[destIndex].items.map((item, index) => ({
          id: item.id,
          position: index + 1,
          type: item.type,
        }));

        const modules = reordered.filter(i => i.type === 'module');
        const quizzes = reordered.filter(i => i.type === 'quiz');

        if (modules.length) {
          await axios.post(`/courses/${course.id}/modules/reorder`, { modules });
        }
        if (quizzes.length) {
          console.log("Reordering quizzes:", quizzes);
          await axios.post(`/courses/${course.id}/quizzes/reorder`, { quizzes });
        }
      }

      setItemsState(newGroups.flatMap(g => g.items));
      setMessage({ success: 'Content reordered successfully.', error: null });
    } catch (error) {
      console.error('Drag update failed:', error);
      setMessage({ success: null, error: 'Failed to update order or group.' });
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
        { id: newGroup.id.toString(), name: newGroup.name, items: [] },
      ]);
      setLocalGroups(prev => [...prev, newGroup]);
  
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
      'quiz': 'bg-green-100 text-green-800', // support lowercase fallback for safety
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors['Other'];
  };

  const getModuleProgress = (moduleId) => {
    const savedProgress = localStorage.getItem(`course_${course.id}_module_${moduleId}_progress`);
    if (!savedProgress) return 0;
    
    const completedResources = JSON.parse(savedProgress); 
    const module = itemsState.find(m => m.id === moduleId && m.type === 'module');
    
    if (!module || !module.resources || module.resources.length === 0) return 0;
    return Math.round((completedResources.length / module.resources.length) * 100);
  };

  const getGroupName = (groupId) => { // Added for group display
    if (!groupId) return 'Ungrouped';
    const group = localGroups.find((g) => g.id.toString() === groupId.toString());
    return group ? group.name : 'Ungrouped';
  };

  const handleDelete = (id, type = 'module') => {
    const label = type === 'quiz' ? 'quiz' : 'module';
    if (window.confirm(`Are you sure you want to delete this ${label}?`)) {
      const deleteUrl = type === 'quiz'
        ? `/quizzes/${id}`
        : `/courses/${course?.id}/modules/${id}`;

      Inertia.delete(deleteUrl, {
        onSuccess: () => {
          setModuleGroups(moduleGroups.map(g => ({
            ...g,
            items: g.items.filter(i => i.id !== id),
          })));
          setMessage({ success: `${label.charAt(0).toUpperCase() + label.slice(1)} deleted successfully.`, error: null });
        },
        onError: () => {
          setMessage({ success: null, error: `Failed to delete ${label}.` });
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
      showBackButton={true}
      backHref="/courses"
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
                >
                  <Button type="create">
                    + Create New Module
                  </Button>
                </Link>

                <Link href={route("quiz.create") + `?course_id=${course.id}`}>
                  <Button type="create">+ Create New Quiz</Button>
                </Link>
                {/* <Link
                  href={`/courses/${course?.id}/edit`}
                >
                  <Button type="edit">
                    Edit Course
                  </Button>
                </Link> */}
                {!showCreateGroup ? (
                  <Button type="create" onClick={() => setShowCreateGroup(true)}>
                    + Create New Group
                  </Button>

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
                    <Button
                      type="create"
                      onClick={createNewGroup}
                    >
                      Create
                    </Button>
                    <Button
                      type="cancel"
                      onClick={() => {
                        setShowCreateGroup(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          {moduleGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-t-lg border border-gray-200">
  <div className="flex items-center cursor-pointer" onClick={() => toggleGroup(group.id)}>
    <span className="mr-2">{expandedGroups[group.id] ? '▼' : '⯈'}</span>
    <h3 className="text-lg font-medium text-gray-900">
      {group.name}
      <span className="ml-2 text-sm text-gray-500">({group.items.length})</span>
    </h3>
  </div>

  {isAdmin && group.items.length === 0 && group.id !== 'ungrouped' && (
    <button
      onClick={() => handleDeleteGroup(group.id)}
      className="text-red-500 hover:text-red-700 text-sm"
      title="Delete group"
    >
      ❌
    </button>
  )}
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
                          {group.items.length > 0 ? (
                            group.items.map((item, index) => (
                              <Draggable
                                key={`${item.type}-${item.id}`}
                                draggableId={`${item.type}-${item.id}`}
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
                                        href={
                                          item.type === 'module'
                                            ? `/courses/${course.id}/modules/${item.id}`
                                            : `/quizzes/${item.id}/edit`
                                        }
                                        className={`text-indigo-600 hover:text-indigo-900 ${getModuleColor(
                                          item.material_type || item.type
                                        )}`}
                                      >
                                        {item.title}
                                      </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {item.type === 'module'
                                        ? item.material_type || 'N/A'
                                        : 'Quiz'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      {item.type === 'module' ? (
                                        <div className="flex items-center">
                                          <span className="mr-2">
                                            {getModuleProgress(item.id)}%
                                          </span>
                                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                            <div
                                              className="bg-blue-600 h-1.5 rounded-full"
                                              style={{
                                                width: `${getModuleProgress(item.id)}%`,
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="italic text-gray-400">N/A</span>
                                      )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-2">
                                      <Link
                                        href={
                                          item.type === 'module'
                                            ? `/courses/${course.id}/modules/${item.id}/edit`
                                            : `/quizzes/${item.id}/edit`
                                        }
                                      >
                                        <ButtonThin type="edit">Edit</ButtonThin>
                                      </Link>
                                      <ButtonThin
                                        type="delete"
                                        onClick={() => handleDelete(item.id, item.type)}
                                      >
                                        Delete
                                      </ButtonThin>
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
                                No content in this group. {isAdmin && 'Drag items here.'}
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


        {(!moduleGroups.length || (moduleGroups.length === 1 && moduleGroups[0].id === 'ungrouped' && moduleGroups[0].items.length === 0)) && (
      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-semibold text-gray-900">No content yet</h3>
        <p className="text-gray-600 mt-2">Add modules or quizzes to start building your course</p>
      </div>
      )}
      </SectionCard>
    </AuthenticatedLayout>
  );
}