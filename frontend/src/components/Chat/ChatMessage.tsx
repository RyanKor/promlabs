import StreamingText from '../StreamingText';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div
        className={`max-w-[70%] rounded-2xl p-4 ${
          isUser 
            ? 'bg-[var(--primary)] text-white' 
            : 'bg-[var(--secondary)] text-[var(--text-primary)]'
        } shadow-sm`}
      >
        <div className="prose prose-sm max-w-none">
          {isStreaming ? (
            <StreamingText text={message.content} isUserMessage={isUser} />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <span className={`text-xs mt-2 block ${isUser ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
} 