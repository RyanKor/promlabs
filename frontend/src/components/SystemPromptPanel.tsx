import React from 'react';
import { SystemPrompt } from '../types/prompt';

interface SystemPromptPanelProps {
  prompt: SystemPrompt;
  onChange: (prompt: SystemPrompt) => void;
}

const SystemPromptPanel: React.FC<SystemPromptPanelProps> = ({ prompt, onChange }) => {
  const handleRoleChange = (field: keyof SystemPrompt['role'], value: string) => {
    onChange({
      ...prompt,
      role: { ...prompt.role, [field]: value }
    });
  };

  const handleToneChange = (field: keyof SystemPrompt['tone'], value: string | number) => {
    onChange({
      ...prompt,
      tone: { ...prompt.tone, [field]: value }
    });
  };

  const handleContextChange = (field: keyof SystemPrompt['context'], value: string) => {
    onChange({
      ...prompt,
      context: { ...prompt.context, [field]: value }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">System Prompt</h2>
      
      <div className="space-y-6">
        {/* Role Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Role</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={prompt.role.type}
                onChange={(e) => handleRoleChange('type', e.target.value)}
              >
                <option value="">Select a role</option>
                <option value="assistant">Assistant</option>
                <option value="expert">Expert</option>
                <option value="teacher">Teacher</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {prompt.role.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Role</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={prompt.role.custom ?? ''}
                  onChange={(e) => handleRoleChange('custom', e.target.value)}
                  placeholder="Enter custom role"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Role Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                value={prompt.role.description}
                onChange={(e) => handleRoleChange('description', e.target.value)}
                placeholder="Describe the role's responsibilities and characteristics"
              />
            </div>
          </div>
        </div>

        {/* Tone Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Tone</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tone Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={prompt.tone.type}
                onChange={(e) => handleToneChange('type', e.target.value)}
              >
                <option value="">Select a tone</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
                <option value="friendly">Friendly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {prompt.tone.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Tone</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={prompt.tone.custom ?? ''}
                  onChange={(e) => handleToneChange('custom', e.target.value)}
                  placeholder="Enter custom tone"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Tone Intensity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="mt-1 block w-full"
                value={prompt.tone.intensity}
                onChange={(e) => handleToneChange('intensity', parseFloat(e.target.value))}
              />
              <div className="text-sm text-gray-500 text-right">{prompt.tone.intensity}</div>
            </div>
          </div>
        </div>

        {/* Context Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Context</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Context Content</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                value={prompt.context.content}
                onChange={(e) => handleContextChange('content', e.target.value)}
                placeholder="Enter the context for the prompt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Context Template</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={prompt.context.template ?? ''}
                onChange={(e) => handleContextChange('template', e.target.value)}
              >
                <option value="">Select a template</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptPanel; 