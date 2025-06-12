import { ChatMessage } from '@/types';

interface SystemPromptConfig {
  role: string;
  expertise: string[];
  tone: string;
  guidelines: string[];
  outputFormat?: string;
}

const SYSTEM_PROMPT_TEMPLATES: Record<string, SystemPromptConfig> = {
  creative: {
    role: 'creative writing assistant',
    expertise: ['content creation', 'storytelling', 'creative writing'],
    tone: 'engaging and imaginative',
    guidelines: [
      'Maintain originality and avoid plagiarism',
      'Use vivid descriptions and sensory details',
      'Create compelling narratives with clear structure',
      'Ensure content is error-free and well-edited',
      'Adapt language and complexity to the target audience'
    ]
  },
  technical: {
    role: 'technical expert',
    expertise: ['technical documentation', 'problem-solving', 'system design'],
    tone: 'precise and professional',
    guidelines: [
      'Provide accurate and detailed technical information',
      'Use appropriate technical terminology',
      'Include relevant code examples when needed',
      'Reference official documentation',
      'Explain complex concepts clearly'
    ],
    outputFormat: 'Use markdown for code blocks and technical formatting'
  },
  business: {
    role: 'business analyst',
    expertise: ['market analysis', 'business strategy', 'financial analysis'],
    tone: 'professional and analytical',
    guidelines: [
      'Provide data-driven insights',
      'Consider market trends and dynamics',
      'Analyze competitive advantages',
      'Identify potential risks and opportunities',
      'Recommend actionable strategies'
    ]
  },
  education: {
    role: 'educational expert',
    expertise: ['teaching', 'curriculum development', 'learning strategies'],
    tone: 'clear and supportive',
    guidelines: [
      'Break down complex concepts into digestible parts',
      'Provide clear examples and analogies',
      'Encourage critical thinking',
      'Adapt explanations to different learning styles',
      'Include practice exercises when appropriate'
    ]
  },
  general: {
    role: 'helpful assistant',
    expertise: ['general knowledge', 'problem-solving'],
    tone: 'friendly and professional',
    guidelines: [
      'Provide clear and accurate information',
      'Be helpful and supportive',
      'Maintain a professional tone',
      'Adapt responses to the user\'s needs',
      'Ask clarifying questions when needed'
    ]
  }
};

function detectIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Creative writing patterns
  if (lowerText.match(/\b(write|story|creative|content|blog|article)\b/)) {
    return 'creative';
  }
  
  // Technical patterns
  if (lowerText.match(/\b(how to|code|programming|technical|debug|implement|api|database)\b/)) {
    return 'technical';
  }
  
  // Business patterns
  if (lowerText.match(/\b(business|market|strategy|analysis|financial|profit|revenue|competitor)\b/)) {
    return 'business';
  }
  
  // Education patterns
  if (lowerText.match(/\b(explain|teach|learn|understand|concept|education|study)\b/)) {
    return 'education';
  }
  
  return 'general';
}

function generateSystemPrompt(config: SystemPromptConfig): string {
  const prompt = `You are a ${config.role} with expertise in ${config.expertise.join(', ')}. 
Your communication style should be ${config.tone}.

Key Guidelines:
${config.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${config.outputFormat ? `\nOutput Format:\n${config.outputFormat}` : ''}

Please provide responses that are helpful, accurate, and aligned with these guidelines.`;

  return prompt;
}

export function createSystemPrompt(messages: ChatMessage[]): string {
  // If there are no messages yet, return a default general prompt
  if (messages.length === 0) {
    return generateSystemPrompt({
      role: 'helpful assistant',
      expertise: ['general knowledge', 'problem-solving'],
      tone: 'friendly and professional',
      guidelines: [
        'Provide clear and accurate information',
        'Be helpful and supportive',
        'Maintain a professional tone',
        'Adapt responses to the user\'s needs',
        'Ask clarifying questions when needed'
      ]
    });
  }

  // Analyze the latest user message to determine intent
  const latestMessage = messages[messages.length - 1];
  const intent = detectIntent(latestMessage.content);
  
  // Get the appropriate template based on intent
  const template = SYSTEM_PROMPT_TEMPLATES[intent] || SYSTEM_PROMPT_TEMPLATES.general;
  
  return generateSystemPrompt(template);
} 