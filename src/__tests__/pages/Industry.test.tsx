import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { FormProvider, FormData, useFormContext } from '../../context/FormContext';
import Industry from '../../pages/Industry';
import mockUseApiKey from '../mocks/apiKeyContextMock';

// Mock ApiKeyContext
jest.mock('../../context/ApiKeyContext', () => ({
  useApiKey: () => mockUseApiKey,
  ApiKeyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ModelProvider: 'openai'
}));

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

// Mock FormContext
const mockFormContextValue = {
  formData: {} as FormData,
  setFormData: jest.fn(),
  updatePersonalInfo: jest.fn(),
  updateIndustrySettings: jest.fn(),
  updateGenerationSettings: jest.fn(),
  addEducation: jest.fn(),
  removeEducation: jest.fn(),
  addWorkExperience: jest.fn(),
  removeWorkExperience: jest.fn(),
  addSkill: jest.fn(),
  removeSkill: jest.fn(),
  addKeyword: jest.fn(),
  removeKeyword: jest.fn(),
  resetForm: jest.fn(),
  addGenerationRecord: jest.fn(() => ''),
  getGenerationRecords: jest.fn(() => []),
  getGenerationRecordById: jest.fn()
};

// Mock the useFormContext hook
jest.mock('../../context/FormContext', () => ({
  ...jest.requireActual('../../context/FormContext'),
  useFormContext: jest.fn(() => mockFormContextValue)
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '' })
}));

const renderIndustryPage = () => {
  // Set window.alert to our mock before each render
  window.alert = mockAlert;
  
  return render(
    <BrowserRouter>
      <FormProvider>
        <Industry />
      </FormProvider>
    </BrowserRouter>
  );
};

describe('Industry Page Validation', () => {
  
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAlert.mockClear();
    
    // Default empty form data
    mockFormContextValue.formData = {
      personalInfo: {
        name: 'Test User',
        age: '30',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        workExperience: [],
        skills: [],
        projects: '',
        awards: '',
        interests: ''
      },
      industrySettings: {
        industry: '',
        jobCategory: '',
        jobSubcategory: '',
        specificPosition: '',
        keywords: []
      },
      generationSettings: {
        duration: '60',
        customDuration: '',
        language: 'Chinese',
        style: 'professional',
        tone: 'Professional',
        structure: 'skills_first',
        useCustomPrompt: false,
        promptTemplate: '',
        outputLength: 'Medium',
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: false
      }
    };
  });

  test('should show validation error when industry field is empty', async () => {
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for validation error modal to appear
    await waitFor(() => {
      expect(screen.getByText('行業設定未完成')).toBeInTheDocument();
    });
    
    // Find the validation error list and check its contents
    const errorModal = screen.getByText('行業設定未完成').closest('.bg-white') as HTMLElement;
    expect(errorModal).toBeInTheDocument();
    
    // Check if the list inside the modal contains the right error
    const errorList = within(errorModal).getAllByRole('listitem');
    const hasIndustryError = errorList.some(item => item.textContent?.includes('行業類別'));
    expect(hasIndustryError).toBe(true);
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should show validation error when job category is missing', async () => {
    // Set industry but no job category
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      industrySettings: {
        ...mockFormContextValue.formData.industrySettings,
        industry: 'tech'
      }
    };
    
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for validation error modal to appear
    await waitFor(() => {
      expect(screen.getByText('行業設定未完成')).toBeInTheDocument();
    });
    
    // Find the validation error list and check its contents
    const errorModal = screen.getByText('行業設定未完成').closest('.bg-white') as HTMLElement;
    expect(errorModal).toBeInTheDocument();
    
    // Check if the list inside the modal contains the right error
    const errorList = within(errorModal).getAllByRole('listitem');
    const hasJobCategoryError = errorList.some(item => item.textContent?.includes('職務類別'));
    expect(hasJobCategoryError).toBe(true);
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should show validation error when job subcategory is missing', async () => {
    // Set industry and job category but no subcategory
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      industrySettings: {
        ...mockFormContextValue.formData.industrySettings,
        industry: 'tech',
        jobCategory: 'it'
      }
    };
    
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for validation error modal to appear
    await waitFor(() => {
      expect(screen.getByText('行業設定未完成')).toBeInTheDocument();
    });
    
    // Find the validation error list and check its contents
    const errorModal = screen.getByText('行業設定未完成').closest('.bg-white') as HTMLElement;
    expect(errorModal).toBeInTheDocument();
    
    // Check if the list inside the modal contains the right error
    const errorList = within(errorModal).getAllByRole('listitem');
    const hasJobSubcategoryError = errorList.some(item => item.textContent?.includes('職務子類別'));
    expect(hasJobSubcategoryError).toBe(true);
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should show validation error when specific position is missing', async () => {
    // Set industry, job category, and subcategory but no specific position
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      industrySettings: {
        ...mockFormContextValue.formData.industrySettings,
        industry: 'tech',
        jobCategory: 'it',
        jobSubcategory: 'software_engineer'
      }
    };
    
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for validation error modal to appear
    await waitFor(() => {
      expect(screen.getByText('行業設定未完成')).toBeInTheDocument();
    });
    
    // Find the validation error list and check its contents
    const errorModal = screen.getByText('行業設定未完成').closest('.bg-white') as HTMLElement;
    expect(errorModal).toBeInTheDocument();
    
    // Check if the list inside the modal contains the right error
    const errorList = within(errorModal).getAllByRole('listitem');
    const hasSpecificPositionError = errorList.some(item => item.textContent?.includes('特定職位'));
    expect(hasSpecificPositionError).toBe(true);
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should show validation error when no keywords added', async () => {
    // Set all fields except keywords
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      industrySettings: {
        ...mockFormContextValue.formData.industrySettings,
        industry: 'tech',
        jobCategory: 'it',
        jobSubcategory: 'software_engineer',
        specificPosition: 'Frontend Developer',
        keywords: [] // No keywords
      }
    };
    
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for validation error modal to appear
    await waitFor(() => {
      expect(screen.getByText('行業設定未完成')).toBeInTheDocument();
    });
    
    // Find the validation error list and check its contents
    const errorModal = screen.getByText('行業設定未完成').closest('.bg-white') as HTMLElement;
    expect(errorModal).toBeInTheDocument();
    
    // Check if the list inside the modal contains the right error
    const errorList = within(errorModal).getAllByRole('listitem');
    const hasKeywordsError = errorList.some(item => item.textContent?.includes('至少添加一個關鍵字'));
    expect(hasKeywordsError).toBe(true);
    
    // Verify navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('should validate keyword length when adding keywords', async () => {
    const { getByText, getByPlaceholderText } = renderIndustryPage();
    
    // Find keyword input and add button
    const keywordInput = getByPlaceholderText('輸入自定義關鍵詞');
    const addButton = getByText('添加');
    
    // Add a valid keyword
    fireEvent.change(keywordInput, { target: { value: 'JavaScript' } });
    fireEvent.click(addButton);
    
    // Should call addKeyword with the valid keyword
    expect(mockFormContextValue.addKeyword).toHaveBeenCalledWith('JavaScript');
  });
  
  test('should navigate to next page when all fields are filled', async () => {
    // Set all required fields
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      industrySettings: {
        ...mockFormContextValue.formData.industrySettings,
        industry: 'tech',
        jobCategory: 'it',
        jobSubcategory: 'software_engineer',
        specificPosition: 'Frontend Developer',
        keywords: ['JavaScript', 'React'] // Has keywords
      }
    };
    
    const { getByText } = renderIndustryPage();
    
    // Find next button and click it
    const nextButton = getByText('下一步：生成設置');
    fireEvent.click(nextButton);
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    
    // Check navigation path - note that Chinese characters will be URL encoded
    expect(mockNavigate).toHaveBeenCalledWith('/settings?project_name=%E6%88%91%E7%9A%84%E8%87%AA%E4%BB%8B%E5%B0%88%E6%A1%88');
  });
}); 