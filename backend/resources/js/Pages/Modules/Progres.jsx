import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import Sidebar from './Sidebar';

export default function Progress() {
  const { course, auth, students } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role_name === 'admin' || user?.role_name === 'superadmin' || false;
  const [moduleProgress, setModuleProgress] = useState({});
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Fetch modules and progress data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get all modules for this course
        const modulesResponse = await axios.get(`/api/courses/${course.id}/modules`);
        setModules(modulesResponse.data);
        
        if (isAdmin) {
          // If admin, get progress for all students
          if (selectedStudent) {
            const progressResponse = await axios.get(`/api/courses/${course.id}/progress/${selectedStudent}`);
            setUserProgress(progressResponse.data.progress || {});
            setOverallProgress(progressResponse.data.overallProgress || 0);
          }
        } else {
          // Get current user's progress
          const progressResponse = await axios.get(`/api/courses/${course.id}/progress`);
          setUserProgress(progressResponse.data.progress || {});
          setOverallProgress(progressResponse.data.overallProgress || 0);
          
          // Calculate module completion from localStorage
          const calculatedProgress = {};
          modulesResponse.data.forEach(module => {
            const savedProgress = localStorage.getItem(`course_${course.id}_module_${module.id}_progress`);
            if (savedProgress) {
              const completedResources = JSON.parse(savedProgress);
              const totalResources = module.resources?.length || 0;
              calculatedProgress[module.id] = totalResources > 0 
                ? Math.round((completedResources.length / totalResources) * 100) 
                : 0;
            } else {
              calculatedProgress[module.id] = 0;
            }
          });
          setModuleProgress(calculatedProgress);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [course.id, isAdmin, selectedStudent]);

  // Group modules by their groups
  const groupedModules = () => {
    const groups = {};
    
    modules.forEach(module => {
      const groupName = module.group?.name || 'Ungrouped';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(module);
    });
    
    return groups;
  };

  // Calculate the overall progress for a group
  const calculateGroupProgress = (modules) => {
    if (!modules || modules.length === 0) return 0;
    
    let totalProgress = 0;
    let moduleCount = 0;
    
    modules.forEach(module => {
      if (isAdmin && selectedStudent) {
        // For admin viewing a student's progress
        if (userProgress[module.id] !== undefined) {
          totalProgress += userProgress[module.id];
          moduleCount++;
        }
      } else {
        // For student or admin not viewing a specific student
        const progress = moduleProgress[module.id] || 0;
        totalProgress += progress;
        moduleCount++;
      }
    });
    
    return moduleCount > 0 ? Math.round(totalProgress / moduleCount) : 0;
  };

  // Check if a module has been completed (100%)
  const isModuleCompleted = (moduleId) => {
    if (isAdmin && selectedStudent) {
      return userProgress[moduleId] === 100;
    }
    return moduleProgress[moduleId] === 100;
  };

  // Export progress data (for admins)
  const exportProgressData = async () => {
    try {
      const response = await axios.get(`/api/courses/${course.id}/progress/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.title}-progress.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting progress data:', error);
      alert('Failed to export progress data.');
    }
  };

  const renderProgressBar = (percentage) => (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600">{percentage}%</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar course={course} activePage="progress" />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Progress</h1>
        
        {isAdmin && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Student Progress</h2>
                <p className="text-sm text-gray-600">View individual student progress</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a student</option>
                  {students?.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={exportProgressData}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition"
                >
                  Export CSV
                </button>
              </div>
            </div>
            
            {selectedStudent && (
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Overall Progress: {overallProgress}%</h3>
                {renderProgressBar(overallProgress)}
              </div>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Overall Progress</h2>
              {renderProgressBar(isAdmin && selectedStudent ? overallProgress : overallProgress)}
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedModules()).map(([groupName, groupModules]) => (
                <div key={groupName} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{groupName}</h2>
                    <div className="w-1/3">
                      {renderProgressBar(calculateGroupProgress(groupModules))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {groupModules.map(module => (
                      <div 
                        key={module.id} 
                        className={`p-3 rounded-md border ${
                          isModuleCompleted(module.id) 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {isModuleCompleted(module.id) && (
                              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                            <h3 className="font-medium">{module.title}</h3>
                          </div>
                          <div className="w-1/3">
                            {renderProgressBar(
                              isAdmin && selectedStudent 
                                ? userProgress[module.id] || 0 
                                : moduleProgress[module.id] || 0
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}