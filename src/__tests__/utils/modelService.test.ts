import { generateSelfIntroduction, GenerationResult } from '../../utils/modelService';
import { generateSelfIntro } from '../../utils/openai';
import { generateGeminiSelfIntro } from '../../utils/gemini';
import { FormData } from '../../context/FormContext';

// Mock the OpenAI and Gemini functions
jest.mock('../../utils/openai', () => ({
  generateSelfIntro: jest.fn(),
  generatePrompt: jest.fn().mockImplementation((formData) => 'mocked openai prompt')
}));

jest.mock('../../utils/gemini', () => ({
  generateGeminiSelfIntro: jest.fn(),
}));

describe('modelService', () => {
  const mockFormData: FormData = {
    personalInfo: {
      name: 'John Doe',
      age: '30',
      education: [{ school: 'Test University', degree: 'Bachelor', major: 'Computer Science', graduationYear: '2020' }],
      workExperience: [{ 
        company: 'Test Company', 
        position: 'Developer', 
        startDate: '2020-01', 
        endDate: '2023-01', 
        isCurrent: false,
        description: 'Test Description'
      }],
      skills: [{ name: 'JavaScript', level: 'Advanced' }],
      projects: 'Test Project',
      awards: 'Test Award',
      interests: 'Coding'
    },
    industrySettings: {
      industry: 'tech',
      jobCategory: 'it',
      jobSubcategory: 'software_engineer',
      specificPosition: 'Frontend Developer',
      keywords: ['React', 'TypeScript']
    },
    generationSettings: {
      duration: '60',
      customDuration: '',
      language: 'English',
      style: 'professional',
      structure: 'skills_first',
      useCustomPrompt: false,
      promptTemplate: 'Test template',
      tone: 'confident',
      outputLength: 'Medium',
      highlightStrengths: true,
      includeCallToAction: true,
      focusOnRecentExperience: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call OpenAI service when provider is openai', async () => {
    const mockResult: GenerationResult = { 
      content: 'Generated self-introduction',
      prompt: 'Generated prompt'
    };
    
    (generateSelfIntro as jest.Mock).mockResolvedValue(mockResult);
    
    const result = await generateSelfIntroduction(mockFormData, 'openai', 'test-api-key', 'gpt-4');
    
    expect(generateSelfIntro).toHaveBeenCalledWith(mockFormData, 'test-api-key', 'gpt-4');
    expect(result.content).toBe('Generated self-introduction');
    expect(result.prompt).toBe('Generated prompt');
  });

  test('should call Gemini service when provider is gemini', async () => {
    const mockResult: GenerationResult = { 
      content: 'Generated self-introduction from Gemini',
      prompt: 'Generated Gemini prompt'
    };
    
    (generateGeminiSelfIntro as jest.Mock).mockResolvedValue(mockResult);
    
    const result = await generateSelfIntroduction(mockFormData, 'gemini', 'test-api-key', 'gemini-pro');
    
    expect(generateGeminiSelfIntro).toHaveBeenCalledWith(mockFormData, 'test-api-key', 'gemini-pro');
    expect(result.content).toBe('Generated self-introduction from Gemini');
    expect(result.prompt).toBe('Generated Gemini prompt');
  });

  test('should handle errors gracefully', async () => {
    (generateSelfIntro as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    const result = await generateSelfIntroduction(mockFormData, 'openai', 'test-api-key');
    
    expect(result.error).toBe('API Error');
    expect(result.content).toBe('');
  });

  test('should return error for unsupported provider', async () => {
    const result = await generateSelfIntroduction(mockFormData, 'unsupported' as any, 'test-api-key');
    
    expect(result.error).toContain('未支援的模型提供者');
    expect(result.content).toBe('');
  });
}); 