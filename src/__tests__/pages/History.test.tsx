import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import History from '../../pages/History';
import { FormProvider } from '../../context/FormContext';
import * as FormContextModule from '../../context/FormContext';

describe('History 頁面', () => {
  const mockGenerationRecords = [
    {
      id: '1',
      timestamp: Date.now() - 86400000,
      projectTitle: '測試項目 1',
      projectId: '1',
      formData: {} as FormContextModule.FormData,
      generatedText: '測試內容 1',
      modelProvider: 'openai',
      modelId: 'gpt-3.5-turbo',
      estimatedTokens: 100,
      estimatedCost: 0.01,
      promptTemplate: '模板1',
      actualPrompt: '提示詞1'
    },
    {
      id: '2',
      timestamp: Date.now(),
      projectTitle: '測試項目 2',
      projectId: '2',
      formData: {} as FormContextModule.FormData,
      generatedText: '測試內容 2',
      modelProvider: 'gemini',
      modelId: 'gemini-pro',
      estimatedTokens: 200,
      estimatedCost: 0.02,
      promptTemplate: '模板2',
      actualPrompt: '提示詞2'
    }
  ];

  beforeEach(() => {
    // 模擬 getGenerationRecords 方法的實現
    jest.spyOn(FormContextModule, 'useFormContext').mockImplementation(() => ({
      getGenerationRecords: () => mockGenerationRecords,
      formData: {} as FormContextModule.FormData,
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
      addGenerationRecord: jest.fn(),
      getGenerationRecordById: jest.fn()
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/history']}>
        <FormProvider>
          <Routes>
            <Route path="/history" element={<History />} />
          </Routes>
        </FormProvider>
      </MemoryRouter>
    );
  };

  test('渲染歷史記錄列表', () => {
    renderWithRouter();
    
    // 檢查標題是否正確顯示
    expect(screen.getByText('生成歷史記錄')).toBeInTheDocument();
    
    // 檢查記錄是否顯示
    expect(screen.getByText('測試項目 1')).toBeInTheDocument();
    expect(screen.getByText('測試項目 2')).toBeInTheDocument();
  });

  test('空記錄狀態', () => {
    // 模擬空記錄
    jest.spyOn(FormContextModule, 'useFormContext').mockImplementation(() => ({
      getGenerationRecords: () => [],
      formData: {} as FormContextModule.FormData,
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
      addGenerationRecord: jest.fn(),
      getGenerationRecordById: jest.fn()
    }));
    
    renderWithRouter();
    
    // 檢查空記錄提示
    expect(screen.getByText('尚無生成記錄')).toBeInTheDocument();
  });
}); 