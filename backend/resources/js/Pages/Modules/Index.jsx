import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import Sidebar from './Sidebar';

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

      console.log('Module order and group updated.');
    } catch (error) {
      console.error('Failed to update module order or group:', error);
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
    if (!newGroupName.trim()) return;
  
    try {
      const response = await axios.post(`/courses/${course.id}/groups`, {
        name: newGroupName,
      });
  
      const newGroup = response.data;
  
      setModuleGroups([
        ...moduleGroups,
        { id: newGroup.id.toString(), name: newGroup.name, modules: [] }, // FIXED: force string ID
      ]);
  
      setNewGroupName('');
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Failed to create group:', error);
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar course={course} activePage="modules" />

      <main className="flex-1 p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="mt-2 text-gray-600">{course?.description || 'No description available.'}</p>
          
          <div className="mt-4 flex items-center">
            <div className="mr-3 text-sm font-medium">Course Progress: {courseProgress}%</div>
            <div className="w-48 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${courseProgress}%` }}
              ></div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link 
                href={`/courses/${course?.id}/modules/create`} 
                className="inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
              >
                + Add Module
              </Link>
              <Link 
                href={`/courses/${course?.id}/edit`} 
                className="inline-flex px-4 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-md hover:bg-blue-50 transition"
              >
                Edit Course
              </Link>
              {!showCreateGroup ? (
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="inline-flex px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition"
                >
                  + Add Group
                </button>
              ) : (
                <div className="flex items-center gap-2">
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
                    className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          {moduleGroups.map((group) => (
            <section key={group.id} className="mb-6">
              <div className="flex items-center justify-between bg-white p-3 rounded-t-lg border border-gray-200 cursor-pointer"
                   onClick={() => toggleGroup(group.id)}>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">{expandedGroups[group.id] ? '▼' : '►'}</span>
                  {group.name}
                  <span className="ml-2 text-sm text-gray-500">({group.modules.length})</span>
                </h2>
              </div>
              
              {expandedGroups[group.id] && (
                <Droppable droppableId={`group-${group.id}`}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="space-y-2 p-3 bg-gray-50 rounded-b-lg border border-t-0 border-gray-200"
                    >
                      {group.modules.map((mod, index) => {
                        const progressPercent = getModuleProgress(mod.id);
                        return (
                          <Draggable 
                            key={mod.id} 
                            draggableId={`module-${mod.id}`} 
                            index={index} 
                            isDragDisabled={!isAdmin}
                          >
                            {(provided) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps} 
                                className="bg-white border border-gray-200 rounded-lg shadow-sm"
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <Link
                                      href={`/courses/${course.id}/modules/${mod.id}`}
                                      className={`flex-1 font-medium ${getModuleColor(mod.material_type)}`}
                                    >
                                      {mod.title}
                                    </Link>
                                    {isAdmin && (
                                      <div className="relative">
                                        <button
                                          className="text-gray-500 hover:text-gray-700"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleDropdown(mod.id);
                                          }}
                                          aria-label="Module actions"
                                        >
                                          ⋮
                                        </button>
                                        {openDropdownId === mod.id && (
                                          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50 border border-gray-200">
                                            <Link
                                              href={`/courses/${course?.id}/modules/${mod.id}/edit`}
                                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                              Edit
                                            </Link>
                                            <button
                                              onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this module?')) {
                                                  axios.delete(`/courses/${course?.id}/modules/${mod.id}`)
                                                    .then(() => {
                                                      // Update local state
                                                      const updatedGroups = moduleGroups.map(g => ({
                                                        ...g,
                                                        modules: g.modules.filter(m => m.id !== mod.id)
                                                      }));
                                                      setModuleGroups(updatedGroups);
                                                    })
                                                    .catch(error => {
                                                      console.error('Failed to delete module:', error);
                                                      alert('Failed to delete module.');
                                                    });
                                                }
                                              }}
                                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center mt-2">
                                    <span className="text-xs text-gray-500 mr-2">{progressPercent}% complete</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ width: `${progressPercent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      
                      {group.modules.length === 0 && (
                        <div className="p-4 text-center text-gray-500 italic text-sm">
                          No modules in this group. {isAdmin && 'Drag modules here.'}
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              )}
            </section>
          ))}
        </DragDropContext>

        {(!moduleGroups.length || (moduleGroups.length === 1 && moduleGroups[0].id === 'ungrouped' && moduleGroups[0].modules.length === 0)) && (
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900">No modules yet</h3>
            <p className="text-gray-600 mt-2">Add modules to start building your course</p>
            {isAdmin && (
              <Link href={`/courses/${course?.id}/modules/create`} className="mt-4 inline-flex px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition">Add Module</Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}