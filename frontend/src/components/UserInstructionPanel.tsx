import React, { useState } from 'react';
import { UserInstruction } from '../types/prompt';

interface UserInstructionPanelProps {
  instruction: UserInstruction;
  onChange: (instruction: UserInstruction) => void;
}

const UserInstructionPanel: React.FC<UserInstructionPanelProps> = ({ instruction, onChange }) => {
  const [newField, setNewField] = useState({ key: '', value: '' });

  const handleGeneralInstructionChange = (value: string) => {
    onChange({
      ...instruction,
      generalInstruction: value
    });
  };

  const handleFormatChange = (value: string) => {
    onChange({
      ...instruction,
      structuredOutput: {
        ...instruction.structuredOutput,
        format: value
      }
    });
  };

  const handleAddField = () => {
    if (newField.key && newField.value) {
      onChange({
        ...instruction,
        structuredOutput: {
          ...instruction.structuredOutput,
          fields: {
            ...instruction.structuredOutput.fields,
            [newField.key]: newField.value
          }
        }
      });
      setNewField({ key: '', value: '' });
    }
  };

  const handleRemoveField = (key: string) => {
    const newFields = { ...instruction.structuredOutput.fields };
    delete newFields[key];
    onChange({
      ...instruction,
      structuredOutput: {
        ...instruction.structuredOutput,
        fields: newFields
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">User Instruction</h2>
      
      <div className="space-y-6">
        {/* General Instruction */}
        <div>
          <label className="block text-sm font-medium text-gray-700">General Instruction</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
            value={instruction.generalInstruction}
            onChange={(e) => handleGeneralInstructionChange(e.target.value)}
            placeholder="Enter the general instruction for the prompt"
          />
        </div>

        {/* Structured Output */}
        <div>
          <h3 className="text-lg font-medium mb-3">Structured Output</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Output Format</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={instruction.structuredOutput.format}
                onChange={(e) => handleFormatChange(e.target.value)}
              >
                <option value="">Select a format</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="text">Plain Text</option>
              </select>
            </div>

            {/* Fields Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Fields</label>
              <div className="space-y-2">
                {Object.entries(instruction.structuredOutput.fields).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={key}
                      disabled
                    />
                    <input
                      type="text"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={value}
                      disabled
                    />
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveField(key)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newField.key}
                    onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                    placeholder="Field name"
                  />
                  <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={newField.value}
                    onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                    placeholder="Field value"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={handleAddField}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInstructionPanel; 