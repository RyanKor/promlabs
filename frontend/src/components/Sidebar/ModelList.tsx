import { useState, useRef, useEffect } from 'react';
import { Model, Project, Prompt } from '@/types';
import { getStorageData, addModel, addProject, addPrompt, deleteModel, deleteProject, deletePrompt, clearStorageData, updateModels } from '@/lib/storage';
import { Dialog } from '@headlessui/react';

interface ModelListProps {
  onSelectPrompt: (modelId: string, projectId: string, promptId: string) => void;
  selectedProjectId?: string;
  selectedPromptId?: string;
}

interface DeleteConfirmState {
  type: 'model' | 'project' | 'prompt';
  modelId: string;
  projectId?: string;
  promptId?: string;
  name: string;
}

const DEFAULT_API_CONFIG = {
  endpoint: 'https://api.upstage.ai/v1',
  apiKey: 'YOUR_DEFAULT_API_KEY',
};

export default function ModelList({ onSelectPrompt, selectedProjectId, selectedPromptId }: ModelListProps) {
  const [models, setModels] = useState<Model[]>(getStorageData().models);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{ type: 'model' | 'project' | 'prompt', id: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [draggedModel, setDraggedModel] = useState<string | null>(null);
  const [draggedProject, setDraggedProject] = useState<{modelId: string, projectId: string} | null>(null);
  const [draggedPrompt, setDraggedPrompt] = useState<{modelId: string, projectId: string, promptId: string} | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [apiConfigModal, setApiConfigModal] = useState<{ open: boolean; modelId: string | null }>({ open: false, modelId: null });
  const [apiConfigDraft, setApiConfigDraft] = useState(DEFAULT_API_CONFIG);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (editingItem && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingItem]);

  // 반응형: 모바일/태블릿에서 자동 접힘
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setCollapsed(true);
      else setCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleModel = (modelId: string) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const startEditing = (type: 'model' | 'project' | 'prompt', id: string, currentName: string) => {
    setEditingItem({ type, id });
    setEditValue(currentName);
  };

  const saveEdit = () => {
    if (!editingItem) return;

    const newModels = models.map(model => {
      if (editingItem.type === 'model' && model.id === editingItem.id) {
        return { ...model, name: editValue };
      }
      if (editingItem.type === 'project') {
        return {
          ...model,
          projects: model.projects.map(project =>
            project.id === editingItem.id
              ? { ...project, name: editValue }
              : project
          )
        };
      }
      if (editingItem.type === 'prompt') {
        return {
          ...model,
          projects: model.projects.map(project => ({
            ...project,
            prompts: project.prompts.map(prompt =>
              prompt.id === editingItem.id
                ? { ...prompt, title: editValue }
                : prompt
            )
          }))
        };
      }
      return model;
    });

    setModels(newModels);
    updateModels(newModels);
    setEditingItem(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingItem(null);
    }
  };

  const handleDelete = (type: 'model' | 'project' | 'prompt', modelId: string, projectId?: string, promptId?: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    let name = '';
    if (type === 'model') {
      name = model.name;
    } else if (type === 'project' && projectId) {
      const project = model.projects.find(p => p.id === projectId);
      if (project) name = project.name;
    } else if (type === 'prompt' && projectId && promptId) {
      const project = model.projects.find(p => p.id === projectId);
      if (project) {
        const prompt = project.prompts.find(p => p.id === promptId);
        if (prompt) name = prompt.title;
      }
    }

    setDeleteConfirm({
      type,
      modelId,
      projectId,
      promptId,
      name
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'model') {
      deleteModel(deleteConfirm.modelId);
      setModels(models.filter(m => m.id !== deleteConfirm.modelId));
    } else if (deleteConfirm.type === 'project' && deleteConfirm.projectId) {
      deleteProject(deleteConfirm.modelId, deleteConfirm.projectId);
      setModels(models.map(model => {
        if (model.id === deleteConfirm.modelId) {
          return {
            ...model,
            projects: model.projects.filter(p => p.id !== deleteConfirm.projectId)
          };
        }
        return model;
      }));
    } else if (deleteConfirm.type === 'prompt' && deleteConfirm.projectId && deleteConfirm.promptId) {
      deletePrompt(deleteConfirm.modelId, deleteConfirm.projectId, deleteConfirm.promptId);
      setModels(models.map(model => {
        if (model.id === deleteConfirm.modelId) {
          return {
            ...model,
            projects: model.projects.map(project => {
              if (project.id === deleteConfirm.projectId) {
                return {
                  ...project,
                  prompts: project.prompts.filter(p => p.id !== deleteConfirm.promptId)
                };
              }
              return project;
            })
          };
        }
        return model;
      }));
    }

    setDeleteConfirm(null);
  };

  const addNewModel = () => {
    const newModel: Model = {
      id: crypto.randomUUID(),
      name: 'New Model',
      projects: []
    };
    addModel(newModel);
    setModels(prev => [...prev, newModel]);
    startEditing('model', newModel.id, 'New Model');
  };

  const addNewProject = (modelId: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'New Project',
      prompts: []
    };
    addProject(modelId, newProject);
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, projects: [...model.projects, newProject] }
        : model
    ));
    startEditing('project', newProject.id, 'New Project');
  };

  const addNewPrompt = (modelId: string, projectId: string) => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: 'New Prompt',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    addPrompt(modelId, projectId, newPrompt);
    setModels(prev => prev.map(model => {
      if (model.id === modelId) {
        return {
          ...model,
          projects: model.projects.map(project =>
            project.id === projectId
              ? { ...project, prompts: [...project.prompts, newPrompt] }
              : project
          )
        };
      }
      return model;
    }));
    startEditing('prompt', newPrompt.id, 'New Prompt');
  };

  const resetModels = () => {
    clearStorageData();
    setModels(getStorageData().models);
    setExpandedModels(new Set());
    setExpandedProjects(new Set());
    setEditingItem(null);
    setEditValue('');
    setDeleteConfirm(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, modelId: string) => {
    if (editingItem) return; // Prevent drag while editing
    setDraggedModel(modelId);
    e.dataTransfer.setData('text/plain', modelId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-[var(--primary-light)]');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-[var(--primary-light)]');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetModelId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[var(--primary-light)]');
    
    if (!draggedModel || draggedModel === targetModelId) return;

    const draggedIndex = models.findIndex(m => m.id === draggedModel);
    const targetIndex = models.findIndex(m => m.id === targetModelId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a new array with the reordered models
    const newModels = [...models];
    const [movedModel] = newModels.splice(draggedIndex, 1);
    newModels.splice(targetIndex, 0, movedModel);
    
    setModels(newModels);
    updateModels(newModels);
    setDraggedModel(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedModel(null);
  };

  // Project drag handlers
  const handleProjectDragStart = (e: React.DragEvent<HTMLDivElement>, modelId: string, projectId: string) => {
    if (editingItem) return;
    setDraggedProject({ modelId, projectId });
    e.dataTransfer.setData('text/plain', projectId);
    e.currentTarget.classList.add('opacity-50');
  };
  const handleProjectDrop = (e: React.DragEvent<HTMLDivElement>, modelId: string, targetProjectId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[var(--primary-light)]');
    if (!draggedProject || draggedProject.modelId !== modelId || draggedProject.projectId === targetProjectId) return;
    const modelIdx = models.findIndex(m => m.id === modelId);
    if (modelIdx === -1) return;
    const projects = [...models[modelIdx].projects];
    const draggedIdx = projects.findIndex(p => p.id === draggedProject.projectId);
    const targetIdx = projects.findIndex(p => p.id === targetProjectId);
    if (draggedIdx === -1 || targetIdx === -1) return;
    const [moved] = projects.splice(draggedIdx, 1);
    projects.splice(targetIdx, 0, moved);
    const newModels = models.map((m, i) => i === modelIdx ? { ...m, projects } : m);
    setModels(newModels);
    updateModels(newModels);
    setDraggedProject(null);
  };
  const handleProjectDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedProject(null);
  };

  // Prompt drag handlers
  const handlePromptDragStart = (e: React.DragEvent<HTMLDivElement>, modelId: string, projectId: string, promptId: string) => {
    if (editingItem) return;
    setDraggedPrompt({ modelId, projectId, promptId });
    e.dataTransfer.setData('text/plain', promptId);
    e.currentTarget.classList.add('opacity-50');
  };
  const handlePromptDrop = (e: React.DragEvent<HTMLDivElement>, modelId: string, projectId: string, targetPromptId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-[var(--primary-light)]');
    if (!draggedPrompt || draggedPrompt.modelId !== modelId || draggedPrompt.projectId !== projectId || draggedPrompt.promptId === targetPromptId) return;
    const modelIdx = models.findIndex(m => m.id === modelId);
    if (modelIdx === -1) return;
    const projectIdx = models[modelIdx].projects.findIndex(p => p.id === projectId);
    if (projectIdx === -1) return;
    const prompts = [...models[modelIdx].projects[projectIdx].prompts];
    const draggedIdx = prompts.findIndex(p => p.id === draggedPrompt.promptId);
    const targetIdx = prompts.findIndex(p => p.id === targetPromptId);
    if (draggedIdx === -1 || targetIdx === -1) return;
    const [moved] = prompts.splice(draggedIdx, 1);
    prompts.splice(targetIdx, 0, moved);
    const newModels = models.map((m, mi) => mi === modelIdx ? {
      ...m,
      projects: m.projects.map((p, pi) => pi === projectIdx ? { ...p, prompts } : p)
    } : m);
    setModels(newModels);
    updateModels(newModels);
    setDraggedPrompt(null);
  };
  const handlePromptDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedPrompt(null);
  };

  const openApiConfigModal = (model: Model) => {
    setApiConfigDraft(model.apiConfig || DEFAULT_API_CONFIG);
    setApiConfigModal({ open: true, modelId: model.id });
  };

  const closeApiConfigModal = () => {
    setApiConfigModal({ open: false, modelId: null });
  };

  const saveApiConfig = () => {
    if (!apiConfigModal.modelId) return;
    const newModels = models.map(model =>
      model.id === apiConfigModal.modelId
        ? { ...model, apiConfig: { ...apiConfigDraft } }
        : model
    );
    setModels(newModels);
    updateModels(newModels);
    closeApiConfigModal();
  };

  return (
    <div className={`h-full border-r border-[var(--border)] transition-all duration-300 bg-[var(--background)] ${collapsed ? 'w-16' : 'w-72'} relative`}>
      <button
        className="absolute top-8 -right-2 z-50 bg-[var(--primary)] text-white rounded-full shadow p-1.5 hover:bg-[var(--primary-hover)] transition-all duration-200"
        style={{ width: '32px', height: '32px', right: collapsed ? '-16px' : '-20px', top: '24px' }}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {collapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>
      <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center mb-6 w-full px-4 ${collapsed ? 'justify-center' : ''}`}
          style={{ minHeight: 48 }}>
          <h2 className={`text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] bg-clip-text text-transparent transition-all duration-300 ${collapsed ? 'scale-0 opacity-0 w-0' : 'scale-100 opacity-100 w-auto'} mr-8`}>PromLabs</h2>
          {!collapsed && (
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={resetModels}
                className="btn btn-secondary p-2"
                title="Reset All Models"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={addNewModel}
                className="btn btn-primary p-2"
                title="모델 추가"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className={`space-y-3 flex-1 w-full overflow-y-auto transition-all duration-300 ${collapsed ? 'px-0' : 'px-0'}`}>
          {models.map(model => (
            <div 
              key={model.id} 
              className={`space-y-2 sidebar-model ${collapsed ? 'w-full' : ''}`}
              draggable={!editingItem}
              onDragStart={(e) => handleDragStart(e, model.id)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, model.id)}
              onDragEnd={handleDragEnd}
            >
              <div 
                className={`flex items-center justify-between p-3 hover:bg-[var(--secondary)] rounded-lg cursor-pointer transition-all duration-200 group ${collapsed ? 'justify-center' : ''}`}
                onClick={() => toggleModel(model.id)}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'flex-1'}`}>
                  <div className={`mr-2 cursor-grab group-hover:opacity-100 opacity-30 ${collapsed ? 'mx-auto' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  {!collapsed && (
                    editingItem?.type === 'model' && editingItem.id === model.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        className="input"
                        onClick={(e) => e.stopPropagation()}
                        maxLength={30}
                        style={{ maxWidth: 180 }}
                      />
                    ) : (
                      <span
                        className="flex-1 font-medium truncate"
                        style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onDoubleClick={() => startEditing('model', model.id, model.name)}
                        title={model.name.length > 30 ? model.name : undefined}
                      >
                        {model.name.length > 30 ? model.name.slice(0, 30) + '…' : model.name}
                      </span>
                    )
                  )}
                </div>
                <div className={`flex items-center ${collapsed ? 'flex-col space-x-0 space-y-1' : 'flex-row gap-1 min-w-0 flex-nowrap shrink-0'}`}>
                  {!collapsed && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addNewProject(model.id);
                        }}
                        className="btn btn-secondary p-1.5"
                        title="프로젝트 추가"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('model', model.id);
                        }}
                        className="btn btn-danger p-1.5"
                        title="모델 삭제"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    className="ml-2 p-1.5 rounded hover:bg-[var(--secondary-hover)]"
                    onClick={e => { e.stopPropagation(); openApiConfigModal(model); }}
                    title="API 설정"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-[var(--primary)]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.878 3.31.905 2.432 2.432a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.878 1.527-.905 3.31-2.432 2.432a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.878-3.31-.905-2.432-2.432a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.878-1.527.905-3.31 2.432-2.432.996.574 2.247.06 2.573-1.066z" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {expandedModels.has(model.id) && (
                <div className="ml-0 space-y-2">
                  {model.projects.map(project => (
                    <div
                      key={project.id}
                      className={`space-y-2 sidebar-project${selectedProjectId === project.id ? ' active' : ''}`}
                      draggable={!editingItem}
                      onDragStart={(e) => handleProjectDragStart(e, model.id, project.id)}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleProjectDrop(e, model.id, project.id)}
                      onDragEnd={handleProjectDragEnd}
                    >
                      <div 
                        className="flex items-center justify-between p-3 hover:bg-[var(--secondary)] rounded-lg cursor-pointer transition-all duration-200"
                        onClick={() => toggleProject(project.id)}
                      >
                        {editingItem?.type === 'project' && editingItem.id === project.id ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            className="input"
                            onClick={(e) => e.stopPropagation()}
                            maxLength={30}
                            style={{ maxWidth: 140 }}
                          />
                        ) : (
                          <span
                            className="flex-1 text-[var(--text-secondary)] truncate"
                            style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            onDoubleClick={() => startEditing('project', project.id, project.name)}
                            title={project.name.length > 30 ? project.name : undefined}
                          >
                            {project.name.length > 30 ? project.name.slice(0, 30) + '…' : project.name}
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addNewPrompt(model.id, project.id);
                            }}
                            className="btn btn-secondary p-1.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete('project', model.id, project.id);
                            }}
                            className="btn btn-danger p-1.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {expandedProjects.has(project.id) && (
                        <div className="ml-0 space-y-2">
                          {project.prompts.map(prompt => (
                            <div
                              key={prompt.id}
                              className={`flex items-center justify-between p-3 hover:bg-[var(--secondary)] rounded-lg cursor-pointer transition-all duration-200 sidebar-prompt${selectedPromptId === prompt.id ? ' active' : ''}`}
                              draggable={!editingItem}
                              onDragStart={(e) => handlePromptDragStart(e, model.id, project.id, prompt.id)}
                              onDragOver={handleDragOver}
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handlePromptDrop(e, model.id, project.id, prompt.id)}
                              onDragEnd={handlePromptDragEnd}
                              onClick={() => onSelectPrompt(model.id, project.id, prompt.id)}
                            >
                              {editingItem?.type === 'prompt' && editingItem.id === prompt.id ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  onBlur={saveEdit}
                                  className="input"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span
                                  className="flex-1 text-[var(--text-secondary)] text-sm"
                                  onDoubleClick={() => startEditing('prompt', prompt.id, prompt.title)}
                                >
                                  {prompt.title}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete('prompt', model.id, project.id, prompt.id);
                                }}
                                className="btn btn-danger p-1.5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--background)] p-6 rounded-lg shadow-lg max-w-md w-full border border-[var(--border)]">
            <h3 className="text-xl font-bold mb-4">Delete Confirmation</h3>
            <p className="mb-6 text-[var(--text-secondary)]">
              Are you sure you want to delete "{deleteConfirm.name}"?
              {deleteConfirm.type === 'model' && ' This will also delete all projects and prompts under this model.'}
              {deleteConfirm.type === 'project' && ' This will also delete all prompts under this project.'}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={apiConfigModal.open} onClose={closeApiConfigModal} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative bg-white dark:bg-[var(--background)] rounded-lg p-6 w-full max-w-md mx-auto shadow-lg border border-[var(--border)]">
          <Dialog.Title className="text-lg font-bold mb-4">API Configuration</Dialog.Title>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Endpoint</label>
              <input
                className="input"
                value={apiConfigDraft.endpoint}
                onChange={e => setApiConfigDraft(d => ({ ...d, endpoint: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                className="input"
                value={apiConfigDraft.apiKey}
                onChange={e => setApiConfigDraft(d => ({ ...d, apiKey: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn btn-secondary" onClick={closeApiConfigModal}>취소</button>
            <button className="btn btn-primary" onClick={saveApiConfig}>저장</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 