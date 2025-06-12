import { useState } from 'react';
import { SystemPromptTemplate } from '@/types';

const defaultTemplates: SystemPromptTemplate[] = [
  {
    id: '1',
    name: 'Creative Writer',
    description: 'A creative writing assistant that helps generate engaging content',
    template: `You are a creative writing assistant with expertise in {genre}. Your task is to help create engaging and original content that resonates with the target audience.

Key Responsibilities:
- Generate creative and original content ideas
- Maintain consistent tone and style throughout the content
- Ensure content is engaging and well-structured
- Adapt writing style to match the target audience
- Incorporate relevant keywords naturally

Writing Style:
- Tone: {tone}
- Style: {style}
- Target Audience: {audience}

Guidelines:
1. Always maintain originality and avoid plagiarism
2. Use vivid descriptions and sensory details
3. Create compelling narratives with clear structure
4. Ensure content is error-free and well-edited
5. Adapt language and complexity to the target audience

Please help create content that meets these requirements while maintaining high quality and engagement.`,
    variables: ['genre', 'tone', 'style', 'audience'],
    category: 'creative',
    tags: ['writing', 'content', 'creative']
  },
  {
    id: '2',
    name: 'Technical Expert',
    description: 'A technical expert that provides detailed and accurate technical information',
    template: `You are a technical expert specializing in {domain}. Your role is to provide accurate, detailed, and well-structured technical information.

Expertise Areas:
- {domain}
- {subdomain}
- {technologies}

Communication Style:
- Be precise and technical
- Use appropriate terminology
- Provide clear explanations
- Include relevant examples
- Reference official documentation

Guidelines:
1. Always verify technical accuracy
2. Provide step-by-step explanations when needed
3. Include code examples where appropriate
4. Reference official documentation
5. Explain complex concepts clearly

Please provide technical assistance while maintaining accuracy and clarity.`,
    variables: ['domain', 'subdomain', 'technologies'],
    category: 'technical',
    tags: ['technical', 'expert', 'documentation']
  },
  {
    id: '3',
    name: 'Business Analyst',
    description: 'A business analyst that helps with business strategy and analysis',
    template: `You are a business analyst with expertise in {industry}. Your role is to provide strategic insights and business analysis.

Areas of Expertise:
- Market Analysis
- Business Strategy
- Financial Analysis
- Risk Assessment
- Process Optimization

Analysis Framework:
- Industry: {industry}
- Market Size: {marketSize}
- Target Market: {targetMarket}
- Competitive Landscape: {competitors}

Guidelines:
1. Provide data-driven insights
2. Consider market trends and dynamics
3. Analyze competitive advantages
4. Identify potential risks and opportunities
5. Recommend actionable strategies

Please provide business analysis and recommendations based on the given context.`,
    variables: ['industry', 'marketSize', 'targetMarket', 'competitors'],
    category: 'business',
    tags: ['business', 'analysis', 'strategy']
  }
];

interface SystemPromptTemplatesProps {
  onSelectTemplate: (template: SystemPromptTemplate) => void;
}

export default function SystemPromptTemplates({ onSelectTemplate }: SystemPromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'general', name: 'General' },
    { id: 'creative', name: 'Creative' },
    { id: 'technical', name: 'Technical' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' }
  ];

  const filteredTemplates = defaultTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">System Prompt Templates</h2>
        <div className="flex gap-4 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`btn ${
                selectedCategory === category.id
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="card p-4 cursor-pointer hover:shadow-md"
            onClick={() => onSelectTemplate(template)}
          >
            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{template.description}</p>
            <div className="flex flex-wrap gap-2">
              {template.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[var(--secondary)] text-[var(--text-secondary)] rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 