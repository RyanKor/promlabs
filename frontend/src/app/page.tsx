'use client';

import { useState } from 'react';
import { SystemPrompt, UserInstruction, ApiConfig, PromptVersion } from '../types/prompt';
import SystemPromptPanel from '../components/SystemPromptPanel';
import UserInstructionPanel from '../components/UserInstructionPanel';
import PreviewPanel from '../components/PreviewPanel';
import Sidebar from '../components/Sidebar';
import ApiConfigPanel from '../components/ApiConfigPanel';

export default function Home() {
  const [systemPrompt, setSystemPrompt] = useState<SystemPrompt>({
    role: { type: '', description: '' },
    tone: { type: '', intensity: 0.5 },
    context: { content: '' }
  });

  const [userInstruction, setUserInstruction] = useState<UserInstruction>({
    generalInstruction: '',
    structuredOutput: {
      format: '',
      fields: {},
      validationRules: {}
    }
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    type: 'http',
    endpoint: '',
    model: 'gpt-4o'
  });

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

  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleGeneratePrompt = async () => {
    // TODO: Implement prompt generation logic
    console.log('Generating prompt with:', { systemPrompt, userInstruction, apiConfig });
  };

  const handleVersionSelect = (version: PromptVersion) => {
    setSelectedVersion(version);
    setSelectedProject('');
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        versions={versions}
        selectedVersion={selectedVersion}
        onSelectVersion={handleVersionSelect}
        onSelectProject={handleProjectSelect}
      />

      {/* Main Content */}
      <div className="ml-80 transition-all duration-300">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">PromLabs</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ApiConfigPanel
                config={apiConfig}
                onChange={setApiConfig}
              />
              
              <SystemPromptPanel
                prompt={systemPrompt}
                onChange={setSystemPrompt}
              />
              
              <UserInstructionPanel
                instruction={userInstruction}
                onChange={setUserInstruction}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <PreviewPanel
                systemPrompt={systemPrompt}
                userInstruction={userInstruction}
                onGenerate={handleGeneratePrompt}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
