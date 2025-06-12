import { Model, Project, Prompt, ChatMessage } from '@/types';

const STORAGE_KEY = 'prompt-generator-data';

interface StorageData {
  models: Model[];
}

export function getStorageData(): StorageData {
  if (typeof window === 'undefined') {
    return { models: [] };
  }
  
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { models: [] };
}

export function saveStorageData(data: StorageData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStorageData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function updateModels(models: Model[]) {
  if (typeof window === 'undefined') return;
  saveStorageData({ models });
}

export function addModel(model: Model) {
  const data = getStorageData();
  data.models.push(model);
  saveStorageData(data);
}

export function deleteModel(modelId: string) {
  const data = getStorageData();
  data.models = data.models.filter(m => m.id !== modelId);
  saveStorageData(data);
}

export function addProject(modelId: string, project: Project) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    model.projects.push(project);
    saveStorageData(data);
  }
}

export function deleteProject(modelId: string, projectId: string) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    model.projects = model.projects.filter(p => p.id !== projectId);
    saveStorageData(data);
  }
}

export function addPrompt(modelId: string, projectId: string, prompt: Prompt) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    const project = model.projects.find(p => p.id === projectId);
    if (project) {
      project.prompts.push(prompt);
      saveStorageData(data);
    }
  }
}

export function deletePrompt(modelId: string, projectId: string, promptId: string) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    const project = model.projects.find(p => p.id === projectId);
    if (project) {
      project.prompts = project.prompts.filter(p => p.id !== promptId);
      saveStorageData(data);
    }
  }
}

export function updatePrompt(modelId: string, projectId: string, promptId: string, updates: Partial<Prompt>) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    const project = model.projects.find(p => p.id === projectId);
    if (project) {
      const prompt = project.prompts.find(p => p.id === promptId);
      if (prompt) {
        Object.assign(prompt, updates);
        saveStorageData(data);
      }
    }
  }
}

export function addMessageToPrompt(modelId: string, projectId: string, promptId: string, message: ChatMessage) {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    const project = model.projects.find(p => p.id === projectId);
    if (project) {
      const prompt = project.prompts.find(p => p.id === promptId);
      if (prompt) {
        prompt.messages.push(message);
        saveStorageData(data);
      }
    }
  }
}

export function getPrompt(modelId: string, projectId: string, promptId: string): Prompt | null {
  const data = getStorageData();
  const model = data.models.find(m => m.id === modelId);
  if (model) {
    const project = model.projects.find(p => p.id === projectId);
    if (project) {
      const prompt = project.prompts.find(p => p.id === promptId);
      if (prompt) {
        return prompt;
      }
    }
  }
  return null;
} 