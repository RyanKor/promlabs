export interface Model {
  id: string;
  name: string;
  projects: Project[];
  apiConfig?: {
    endpoint: string;
    apiKey: string;
    [key: string]: any;
  };
}

export interface Project {
  id: string;
  name: string;
  prompts: Prompt[];
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SystemPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'general' | 'creative' | 'technical' | 'business' | 'education';
  tags: string[];
}

export interface SystemPromptVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
} 