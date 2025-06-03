import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SystemPrompt, UserInstruction, ApiConfig, PromptVersion } from '../types/prompt';

interface SidebarProps {
  versions: PromptVersion[];
  selectedVersion: PromptVersion | null;
  onSelectVersion: (version: PromptVersion) => void;
  onSelectProject: (projectId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  versions,
  selectedVersion,
  onSelectVersion,
  onSelectProject,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto p-4">
        {isExpanded && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Version History</h2>
            
            {/* Version List */}
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.version} className="space-y-2">
                  <div
                    className={`p-2 rounded cursor-pointer ${
                      selectedVersion?.version === version.version
                        ? 'bg-indigo-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectVersion(version)}
                  >
                    <div className="font-medium">{version.model}</div>
                    <div className="text-sm text-gray-500">v{version.version}</div>
                  </div>

                  {/* Project List */}
                  {selectedVersion?.version === version.version && (
                    <div className="ml-4 space-y-2">
                      {version.projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-2 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => onSelectProject(project.id)}
                        >
                          <div className="text-sm">{project.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Version Button */}
            <button
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                // TODO: Implement new version creation
                console.log('Create new version');
              }}
            >
              Add New Version
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 