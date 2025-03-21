import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import * as ReactRouter from 'react-router-dom';
import Result from '../../pages/Result';
import { FormProvider } from '../../context/FormContext';
import mockUseApiKey from '../mocks/apiKeyContextMock';
import { generateSelfIntroduction } from '../../utils/modelService';

// Mock the necessary modules
jest.mock('../../context/ApiKeyContext', () => ({
  useApiKey: () => mockUseApiKey
}));

jest.mock('../../utils/modelService', () => ({
  generateSelfIntroduction: jest.fn().mockResolvedValue({
    content: 'Generated self-introduction content',
    prompt: 'Mock prompt for testing',
    error: null
  })
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn().mockReturnValue({ search: '', state: null }),
}));

// Mock FormContext
const mockFormContextValue = {
  formData: {
    personalInfo: { name: 'Test User' },
    industrySettings: { industry: 'Tech' },
    generationSettings: { language: 'Chinese' }
  },
  storeGenerationResult: jest.fn(),
  getStoredGenerationResult: jest.fn().mockReturnValue({
    text: 'Stored introduction text',
    prompt: 'Stored prompt',
    projectTitle: 'Test Project',
    modelProvider: 'openai',
    modelId: 'gpt-4',
    estimatedTokens: 100,
    estimatedCost: 0.001,
    timestamp: Date.now()
  }),
  isGenerationResultStored: jest.fn().mockReturnValue(true),
  clearStoredGenerationResult: jest.fn(),
  addGenerationRecord: jest.fn(),
  getGenerationRecordById: jest.fn(),
  // Add other necessary mock methods here
};

jest.mock('../../context/FormContext', () => ({
  ...jest.requireActual('../../context/FormContext'),
  useFormContext: jest.fn(() => mockFormContextValue),
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Result Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });

  test('renders result component with stored generation result', async () => {
    // Setup mock to return stored result
    mockFormContextValue.isGenerationResultStored.mockReturnValue(true);
    
    // Render the component
    render(
      <MemoryRouter>
        <FormProvider>
          <Result />
        </FormProvider>
      </MemoryRouter>
    );
    
    // Wait for component to process stored result
    await waitFor(() => {
      // Check that the stored result is displayed
      expect(mockFormContextValue.getStoredGenerationResult).toHaveBeenCalled();
    });
  });

  test('renders error message when no generation result is found', async () => {
    // Setup mock to return no stored result so it will try to generate
    mockFormContextValue.isGenerationResultStored.mockReturnValue(false);
    // Make sure the sessionStorage is empty
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn()
      }
    });
    
    // Render the component
    render(
      <MemoryRouter>
        <FormProvider>
          <Result />
        </FormProvider>
      </MemoryRouter>
    );
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/未找到生成結果/i)).toBeInTheDocument();
    });
  });
}); 