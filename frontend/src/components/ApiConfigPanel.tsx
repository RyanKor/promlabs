import React from 'react';
import { ApiConfig } from '../types/prompt';

interface ApiConfigPanelProps {
  config: ApiConfig;
  onChange: (config: ApiConfig) => void;
}

const ApiConfigPanel: React.FC<ApiConfigPanelProps> = ({ config, onChange }) => {
  const handleChange = (field: keyof ApiConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">API Type</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={config.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="http">HTTP</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endpoint</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={config.endpoint}
            onChange={(e) => handleChange('endpoint', e.target.value)}
            placeholder={config.type === 'http' ? 'https://chatgpt.com/v1/chat/completions' : 'http://localhost:11434/api/generate'}
          />
        </div>

        {config.type === 'http' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={config.apiKey || ''}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={config.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="gpt-4o"
          />
        </div>
      </div>
    </div>
  );
};

export default ApiConfigPanel; 