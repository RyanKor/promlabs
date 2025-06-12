import { useState } from 'react';
import { SystemPromptTemplate } from '@/types';

interface SystemPromptVariablesProps {
  template: SystemPromptTemplate;
  onComplete: (filledTemplate: string) => void;
  onCancel: () => void;
}

export default function SystemPromptVariables({ template, onComplete, onCancel }: SystemPromptVariablesProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    template.variables.reduce((acc, variable) => ({
      ...acc,
      [variable]: ''
    }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let filledTemplate = template.template;
    
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      filledTemplate = filledTemplate.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    onComplete(filledTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-lg max-w-2xl w-full border border-[var(--border)]">
        <h3 className="text-xl font-bold mb-4">Configure System Prompt</h3>
        <p className="text-[var(--text-secondary)] mb-6">
          Please fill in the variables for the "{template.name}" template.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {template.variables.map(variable => (
              <div key={variable}>
                <label className="block text-sm font-medium mb-2">
                  {variable.charAt(0).toUpperCase() + variable.slice(1)}
                </label>
                <input
                  type="text"
                  value={variables[variable]}
                  onChange={(e) => setVariables(prev => ({
                    ...prev,
                    [variable]: e.target.value
                  }))}
                  className="input"
                  placeholder={`Enter ${variable}...`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Generate Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 