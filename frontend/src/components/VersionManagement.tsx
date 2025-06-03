import React, { useState } from 'react';
import { PromptVersion, Project } from '../types/prompt';

interface VersionManagementProps {
  onSelectVersion?: (version: PromptVersion) => void;
}

const VersionManagement: React.FC<VersionManagementProps> = ({ onSelectVersion }) => {
  const [versions, setVersions] = useState<PromptVersion[]>([
    {
      version: '1.0.0',
      model: 'gpt-4o',
      createdAt: new Date(),
      projects: [
        {
          id: '1',
          name: 'Project A',
          promptHistory: [],
          usageStatistics: {
            totalPrompts: 0,
            lastUsed: new Date(),
            successRate: 0
          }
        }
      ]
    }
  ]);

  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
    setSelectedProject('');
    const selectedVersionData = versions.find(v => v.version === version);
    if (selectedVersionData && onSelectVersion) {
      onSelectVersion(selectedVersionData);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Version Management</h2>
      
      <div className="space-y-6">
        {/* Version Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Model Version</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedVersion}
            onChange={(e) => handleVersionSelect(e.target.value)}
          >
            <option value="">Select a version</option>
            {versions.map((version) => (
              <option key={version.version} value={version.version}>
                {version.model} - v{version.version}
              </option>
            ))}
          </select>
        </div>

        {/* Project Selection */}
        {selectedVersion && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={selectedProject}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              <option value="">Select a project</option>
              {versions
                .find(v => v.version === selectedVersion)
                ?.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Project Statistics */}
        {selectedProject && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3">Project Statistics</h3>
            {(() => {
              const project = versions
                .find(v => v.version === selectedVersion)
                ?.projects.find(p => p.id === selectedProject);
              
              if (!project) return null;

              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Prompts:</span>
                    <span className="font-medium">{project.usageStatistics.totalPrompts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Used:</span>
                    <span className="font-medium">
                      {project.usageStatistics.lastUsed.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium">
                      {(project.usageStatistics.successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Add New Version Button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => {
              // TODO: Implement new version creation
              console.log('Create new version');
            }}
          >
            Add New Version
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionManagement; 