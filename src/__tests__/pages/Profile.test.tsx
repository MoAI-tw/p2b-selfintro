import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { FormProvider, FormData, useFormContext } from '../../context/FormContext';
import Profile from '../../pages/Profile';
import mockUseApiKey from '../mocks/apiKeyContextMock';

// Mock ApiKeyContext
jest.mock('../../context/ApiKeyContext', () => ({
  useApiKey: () => mockUseApiKey,
  ApiKeyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

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

// Mock the validation error modal since it's using portals which don't work well in tests
jest.mock('../../pages/Profile', () => {
  const OriginalProfile = jest.requireActual('../../pages/Profile').default;
  return function MockedProfile(props: any) {
    const profile = <OriginalProfile {...props} />;
    return profile;
  };
});

const renderProfilePage = () => {
  return render(
    <BrowserRouter>
      <FormProvider>
        <Profile />
      </FormProvider>
    </BrowserRouter>
  );
};

describe('Profile Page Validation', () => {
  
  beforeEach(() => {
    mockNavigate.mockClear();
    
    // Default empty form data
    mockFormContextValue.formData = {
      personalInfo: {
        name: '',
        age: '',
        education: [{ school: '', degree: '', major: '', graduationYear: '' }],
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

    // Set up the updatePersonalInfo mock implementation
    mockFormContextValue.updatePersonalInfo.mockImplementation((data) => {
      mockFormContextValue.formData = {
        ...mockFormContextValue.formData,
        personalInfo: {
          ...mockFormContextValue.formData.personalInfo,
          ...data
        }
      };
    });
  });

  test('should validate name field is required', async () => {
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Verify navigation did not occur
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should validate education fields are required', async () => {
    // Set name but leave education incomplete
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: '', graduationYear: '2023' }] // Missing major
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Verify navigation did not occur
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should not show validation error for empty work experience', async () => {
    // Set name and complete education
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        workExperience: [] // Empty work experience
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('should validate work experience fields when partially filled', async () => {
    // Set name and complete education, but incomplete work experience
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        workExperience: [{ company: 'Test Company', position: '', startDate: '', endDate: '', isCurrent: false, description: '' }] // Partially filled
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Verify navigation did not occur
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should not show validation error for empty skills', async () => {
    // Set name and complete education, no skills
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        skills: [] // Empty skills
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('should validate skills fields when partially filled', async () => {
    // Set name and complete education, but incomplete skills
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        skills: [{ name: '', level: 'expert' }] // Partially filled skill (missing name)
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Verify navigation did not occur
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should navigate when all required fields are filled', async () => {
    // Set all required fields
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }]
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test('should navigate when all fields including optional ones are properly filled', async () => {
    // Set all fields including optional ones
    mockFormContextValue.formData = {
      ...mockFormContextValue.formData,
      personalInfo: {
        ...mockFormContextValue.formData.personalInfo,
        name: 'Test User',
        age: '30',
        education: [{ school: 'Test School', degree: 'bachelor', major: 'Computer Science', graduationYear: '2023' }],
        workExperience: [{ 
          company: 'Test Company', 
          position: 'Software Engineer', 
          startDate: '2020-01', 
          endDate: '2023-01', 
          isCurrent: false, 
          description: 'Worked on web applications' 
        }],
        skills: [{ name: 'React', level: 'expert' }],
        projects: 'Various web projects',
        awards: 'Best developer award',
        interests: 'Coding, hiking'
      }
    };
    
    renderProfilePage();
    
    // Find next button and click it
    const nextButton = screen.getByText('下一步：產業設置');
    fireEvent.click(nextButton);
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
}); 