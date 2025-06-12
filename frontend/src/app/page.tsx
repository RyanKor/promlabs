'use client';

import { useState, useEffect } from 'react';
import ModelList from '@/components/Sidebar/ModelList';
import ChatMessage from '@/components/Chat/ChatMessage';
import ChatInput from '@/components/Chat/ChatInput';
import SystemPromptTemplates from '@/components/SystemPrompt/SystemPromptTemplates';
import SystemPromptVariables from '@/components/SystemPrompt/SystemPromptVariables';
import { ChatMessage as ChatMessageType, Prompt, SystemPromptTemplate } from '@/types';
import { streamChatCompletion } from '@/lib/api';
import { getStorageData, updatePrompt, addMessageToPrompt, getPrompt, addPrompt } from '@/lib/storage';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<{
    modelId: string;
    projectId: string;
    promptId: string;
  } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SystemPromptTemplate | null>(null);

  const handleSelectPrompt = (modelId: string, projectId: string, promptId: string) => {
    const prompt = getPrompt(modelId, projectId, promptId);
    if (prompt) {
      setMessages(prompt.messages);
      setCurrentPrompt({ modelId, projectId, promptId });
    }
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: ChatMessageType = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    // If no current prompt is selected, create a new one
    if (!currentPrompt) {
      const data = getStorageData();
      if (data.models.length === 0) {
        alert('Please create a model first');
        return;
      }
      const modelId = data.models[0].id;
      if (data.models[0].projects.length === 0) {
        alert('Please create a project first');
        return;
      }
      const projectId = data.models[0].projects[0].id;
      
      const newPrompt: Prompt = {
        id: crypto.randomUUID(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: updatedMessages
      };

      // Use the addPrompt function from storage.ts
      addPrompt(modelId, projectId, newPrompt);

      setCurrentPrompt({
        modelId,
        projectId,
        promptId: newPrompt.id
      });
    } else {
      // Add message to existing prompt
      addMessageToPrompt(
        currentPrompt.modelId,
        currentPrompt.projectId,
        currentPrompt.promptId,
        newMessage
      );
    }

    setIsLoading(true);

    try {
      let fullResponse = '';

      for await (const chunk of streamChatCompletion(updatedMessages)) {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      const assistantMessage: ChatMessageType = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant's response to the prompt
      if (currentPrompt) {
        addMessageToPrompt(
          currentPrompt.modelId,
          currentPrompt.projectId,
          currentPrompt.promptId,
          assistantMessage
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleSelectTemplate = (template: SystemPromptTemplate) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleTemplateComplete = (filledTemplate: string) => {
    setSelectedTemplate(null);
    handleSendMessage(filledTemplate);
  };

  return (
    <main className="flex h-screen">
      <ModelList onSelectPrompt={handleSelectPrompt} />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isStreaming={message.role === 'assistant' && index === messages.length - 1 && isLoading}
            />
          ))}
          {streamingMessage && (
            <ChatMessage
              message={{
                role: 'assistant',
                content: streamingMessage,
                timestamp: new Date().toISOString()
              }}
              isStreaming={true}
            />
          )}
        </div>
        
        <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 mb-3">
              {/* <button
                onClick={() => setShowTemplates(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span>Use Template</span>
              </button> */}
            </div>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <SystemPromptTemplates onSelectTemplate={handleSelectTemplate} />
        </div>
      )}

      {selectedTemplate && (
        <SystemPromptVariables
          template={selectedTemplate}
          onComplete={handleTemplateComplete}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}
    </main>
  );
}
