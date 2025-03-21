import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FormProvider, useFormContext, FormData, GenerationRecord } from '../../context/FormContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test component to access FormContext
const TestGenerationHistory = () => {
  const { 
    formData, 
    updatePersonalInfo, 
    updateIndustrySettings,
    updateGenerationSettings,
    addGenerationRecord,
    getGenerationRecords,
    getGenerationRecordById
  } = useFormContext();

  const testFormData: FormData = {
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

  const addTestRecord = () => {
    // For this test, we'll use a predefined formData
    return addGenerationRecord({
      projectId: '123',
      projectTitle: 'Test Project',
      formData: testFormData,
      generatedText: 'Hello, I am John Doe, a Frontend Developer with expertise in React and TypeScript.',
      modelProvider: 'openai',
      modelId: 'gpt-3.5-turbo',
      estimatedTokens: 100,
      estimatedCost: 0.002,
      promptTemplate: 'Create a {{duration}} self-introduction for {{name}} who is applying for {{position}}.',
      actualPrompt: 'Create a 60-second self-introduction for John Doe who is applying for Frontend Developer position with skills in React and TypeScript.'
    });
  };

  const records = getGenerationRecords();
  const firstRecord = records.length > 0 ? records[0] : null;

  return (
    <div>
      <div data-testid="records-count">{records.length}</div>
      {firstRecord && (
        <>
          <div data-testid="record-id">{firstRecord.id}</div>
          <div data-testid="record-project-id">{firstRecord.projectId}</div>
          <div data-testid="record-project-title">{firstRecord.projectTitle}</div>
          <div data-testid="record-model">{firstRecord.modelProvider} - {firstRecord.modelId}</div>
          <div data-testid="record-tokens">{firstRecord.estimatedTokens}</div>
          <div data-testid="record-cost">{firstRecord.estimatedCost}</div>
          <div data-testid="record-prompt-template">{firstRecord.promptTemplate}</div>
          <div data-testid="record-actual-prompt">{firstRecord.actualPrompt}</div>
          <div data-testid="record-timestamp">{firstRecord.timestamp > 0 ? 'has-timestamp' : 'no-timestamp'}</div>
          <div data-testid="record-personal-name">{firstRecord.formData.personalInfo.name}</div>
          <div data-testid="record-industry">{firstRecord.formData.industrySettings.industry}</div>
          <div data-testid="record-specific-position">{firstRecord.formData.industrySettings.specificPosition}</div>
          <div data-testid="record-keywords">{firstRecord.formData.industrySettings.keywords.join(',')}</div>
          <div data-testid="record-duration">{firstRecord.formData.generationSettings.duration}</div>
          <div data-testid="record-language">{firstRecord.formData.generationSettings.language}</div>
        </>
      )}
      <button onClick={addTestRecord}>Add Generation Record</button>
    </div>
  );
};

describe('Generation History', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('should start with empty generation history', () => {
    render(
      <FormProvider>
        <TestGenerationHistory />
      </FormProvider>
    );
    
    expect(screen.getByTestId('records-count').textContent).toBe('0');
  });

  test('should add a new generation record with all required fields', () => {
    render(
      <FormProvider>
        <TestGenerationHistory />
      </FormProvider>
    );
    
    fireEvent.click(screen.getByText('Add Generation Record'));
    
    expect(screen.getByTestId('records-count').textContent).toBe('1');
    expect(screen.getByTestId('record-project-id').textContent).toBe('123');
    expect(screen.getByTestId('record-project-title').textContent).toBe('Test Project');
    expect(screen.getByTestId('record-model').textContent).toBe('openai - gpt-3.5-turbo');
    expect(screen.getByTestId('record-tokens').textContent).toBe('100');
    expect(screen.getByTestId('record-cost').textContent).toBe('0.002');
    expect(screen.getByTestId('record-timestamp').textContent).toBe('has-timestamp');
    expect(screen.getByTestId('record-personal-name').textContent).toBe('John Doe');
    expect(screen.getByTestId('record-industry').textContent).toBe('tech');
    expect(screen.getByTestId('record-specific-position').textContent).toBe('Frontend Developer');
    expect(screen.getByTestId('record-keywords').textContent).toBe('React,TypeScript');
    expect(screen.getByTestId('record-duration').textContent).toBe('60');
    expect(screen.getByTestId('record-language').textContent).toBe('English');
  });

  test('should store generation records in localStorage', () => {
    render(
      <FormProvider>
        <TestGenerationHistory />
      </FormProvider>
    );
    
    fireEvent.click(screen.getByText('Add Generation Record'));
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('generationRecords', expect.any(String));
    
    const storageCallArgs = mockLocalStorage.setItem.mock.calls[0];
    const savedData = JSON.parse(storageCallArgs[1]);
    
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData.length).toBe(1);
    expect(savedData[0].projectId).toBe('123');
    expect(savedData[0].formData.personalInfo.name).toBe('John Doe');
  });

  test('should include prompt template and actual prompt in generation record', () => {
    render(
      <FormProvider>
        <TestGenerationHistory />
      </FormProvider>
    );
    
    fireEvent.click(screen.getByText('Add Generation Record'));
    
    expect(screen.getByTestId('record-prompt-template').textContent)
      .toBe('Create a {{duration}} self-introduction for {{name}} who is applying for {{position}}.');
    
    expect(screen.getByTestId('record-actual-prompt').textContent)
      .toBe('Create a 60-second self-introduction for John Doe who is applying for Frontend Developer position with skills in React and TypeScript.');
  });

  test('should load existing records from localStorage on initialization', () => {
    // Setup existing record in localStorage
    const existingRecord = {
      id: 'existing-id',
      timestamp: Date.now(),
      projectId: '456',
      projectTitle: 'Existing Project',
      formData: {
        personalInfo: { name: 'Jane Smith', age: '', education: [], workExperience: [], skills: [], projects: '', awards: '', interests: '' },
        industrySettings: { industry: 'finance', jobCategory: '', jobSubcategory: '', specificPosition: 'Financial Analyst', keywords: [] },
        generationSettings: { duration: '30', customDuration: '', language: 'Chinese', style: '', structure: '', useCustomPrompt: false, promptTemplate: '', tone: '', outputLength: '', highlightStrengths: false, includeCallToAction: false, focusOnRecentExperience: false }
      },
      generatedText: 'Existing text',
      modelProvider: 'gemini',
      modelId: 'gemini-pro',
      estimatedTokens: 200,
      estimatedCost: 0.001,
      promptTemplate: 'Existing template',
      actualPrompt: 'Existing actual prompt'
    };
    
    mockLocalStorage.setItem('generationRecords', JSON.stringify([existingRecord]));
    
    render(
      <FormProvider>
        <TestGenerationHistory />
      </FormProvider>
    );
    
    expect(screen.getByTestId('records-count').textContent).toBe('1');
    expect(screen.getByTestId('record-id').textContent).toBe('existing-id');
    expect(screen.getByTestId('record-project-title').textContent).toBe('Existing Project');
    expect(screen.getByTestId('record-model').textContent).toBe('gemini - gemini-pro');
    expect(screen.getByTestId('record-personal-name').textContent).toBe('Jane Smith');
  });
}); 