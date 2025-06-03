export interface SystemPrompt {
  role: {
    type: string;
    description: string;
    custom?: string;
  };
  tone: {
    type: string;
    intensity: number;
    custom?: string;
  };
  context: {
    content: string;
    template?: string;
  };
}

export interface UserInstruction {
  generalInstruction: string;
  structuredOutput: {
    format: string;
    fields: Record<string, any>;
    validationRules: Record<string, any>;
  };
}

export interface ApiConfig {
  type: 'http' | 'ollama';
  endpoint: string;
  model: string;
  apiKey?: string;
}

export interface GeneratedPrompt {
  id: string;
  systemPrompt: SystemPrompt;
  userInstruction: UserInstruction;
  apiConfig: ApiConfig;
  result: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  promptHistory: GeneratedPrompt[];
  usageStatistics: {
    totalPrompts: number;
    lastUsed: Date;
    successRate: number;
  };
}

export interface PromptVersion {
  version: string;
  model: string;
  createdAt: Date;
  projects: Project[];
} 