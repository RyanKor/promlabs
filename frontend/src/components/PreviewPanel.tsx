import React from 'react';
import { SystemPrompt, UserInstruction } from '../types/prompt';

interface PreviewPanelProps {
  systemPrompt: SystemPrompt;
  userInstruction: UserInstruction;
  onGenerate: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  systemPrompt,
  userInstruction,
  onGenerate
}) => {
  const formatSystemPrompt = () => {
    const roleText = systemPrompt.role.custom ?? systemPrompt.role.type;
    const toneText = systemPrompt.tone.custom ?? systemPrompt.tone.type;
    
    return `You are a ${roleText}${systemPrompt.role.description ? `: ${systemPrompt.role.description}` : ''}.
Your tone should be ${toneText} (intensity: ${systemPrompt.tone.intensity}).
${systemPrompt.context.content ? `Context: ${systemPrompt.context.content}` : ''}`;
  };

  const formatUserInstruction = () => {
    const fields = Object.entries(userInstruction.structuredOutput.fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return `${userInstruction.generalInstruction}
${userInstruction.structuredOutput.format ? `\nFormat: ${userInstruction.structuredOutput.format}` : ''}
${fields ? `\nFields:\n${fields}` : ''}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      
      <div className="space-y-6">
        {/* System Prompt Preview */}
        <div>
          <h3 className="text-lg font-medium mb-3">System Prompt</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{formatSystemPrompt()}</pre>
          </div>
        </div>

        {/* User Instruction Preview */}
        <div>
          <h3 className="text-lg font-medium mb-3">User Instruction</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{formatUserInstruction()}</pre>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={onGenerate}
          >
            Generate Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel; 