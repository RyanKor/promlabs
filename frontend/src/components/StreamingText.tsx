import { useState, useEffect } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isUserMessage?: boolean;
}

export default function StreamingText({ 
  text, 
  speed = 30, 
  onComplete,
  isUserMessage = false
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If it's a user message, immediately show the full text
    if (isUserMessage) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // For assistant messages, animate character by character
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, isUserMessage]);

  useEffect(() => {
    // Reset when text changes
    if (isUserMessage) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    } else {
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [text, isUserMessage]);

  return <span>{displayedText}</span>;
} 