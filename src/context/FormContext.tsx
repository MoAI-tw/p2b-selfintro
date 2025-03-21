import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApiKey } from './ApiKeyContext';
import * as modelService from '../utils/modelService';

// Define types for our form data
export interface Education {
  school: string;
  degree: string;
  major: string;
  graduationYear: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface Skill {
  name: string;
  level: string;
}

export interface PersonalInfo {
  name: string;
  age: string;
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  projects: string;
  awards: string;
  interests: string;
}

export interface IndustrySettings {
  industry?: string;
  jobCategory?: string;
  jobSubcategory?: string;
  specificPosition?: string;
  keywords: string[];
  occasionType?: string;
  introLength?: string;
  expressionStyle?: string;
  focusAreas?: string[];
}

export interface GenerationSettings {
  duration: string;
  customDuration: string;
  language: string;
  style: string;
  structure: string;
  useCustomPrompt: boolean;
  promptTemplate: string;
  tone: string;
  outputLength: string;
  highlightStrengths: boolean;
  includeCallToAction: boolean;
  focusOnRecentExperience: boolean;
}

export interface FormData {
  personalInfo: PersonalInfo;
  industrySettings: IndustrySettings;
  generationSettings: GenerationSettings;
}

// 新增生成結果暫存介面
export interface GenerationResult {
  text: string;
  prompt: string;
  projectTitle: string;
  projectId?: string | number;
  modelProvider: string;
  modelId: string;
  estimatedTokens: number;
  estimatedCost: number;
  errorMessage?: string;
  timestamp: number;
}

// 新增生成歷史記錄的介面
export interface GenerationRecord {
  id: string;  // 唯一識別符
  timestamp: number;  // 生成時間戳記
  projectId: string | number;  // 專案ID
  projectTitle: string;  // 專案標題
  formData: FormData;  // 生成時的表單資料
  generatedText: string;  // 生成的文本
  modelProvider: string;  // 模型提供者 (openai/gemini)
  modelId: string;  // 模型ID
  estimatedTokens: number;  // 估計的token數量
  estimatedCost: number;  // 估計成本
  promptTemplate: string;  // 使用的提示詞模板
  actualPrompt: string;  // 實際發送給模型的提示詞
}

// Default values
const defaultFormData: FormData = {
  personalInfo: {
    name: '',
    age: '',
    education: [{ school: '', degree: '', major: '', graduationYear: '' }],
    workExperience: [{ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' }],
    skills: [{ name: '', level: '' }],
    projects: '',
    awards: '',
    interests: ''
  },
  industrySettings: {
    industry: '',
    jobCategory: '',
    specificPosition: '',
    keywords: []
  },
  generationSettings: {
    duration: '60', // Default 1 minute
    customDuration: '',
    language: 'Chinese',
    style: 'balanced',
    structure: 'skills_first',
    useCustomPrompt: false,
    promptTemplate: '請根據以下信息生成一份專業的自我介紹，時間約為{duration}秒，語言為{language}，風格為{style}，重點突出{keywords}。自我介紹應包含個人背景、教育經歷、專業技能和工作經驗，特別強調與{industry}行業和{job_position}職位相關的能力和經驗。',
    tone: 'Professional',
    outputLength: 'Medium',
    highlightStrengths: true,
    includeCallToAction: true,
    focusOnRecentExperience: false
  }
};

// Context interface
interface FormContextProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  updateIndustrySettings: (data: Partial<IndustrySettings>) => void;
  updateGenerationSettings: (data: Partial<GenerationSettings>) => void;
  addEducation: () => void;
  updateEducation: (index: number, data: Partial<Education>) => void;
  removeEducation: (index: number) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (index: number, data: Partial<WorkExperience>) => void;
  removeWorkExperience: (index: number) => void;
  addSkill: () => void;
  updateSkill: (index: number, data: Partial<Skill>) => void;
  removeSkill: (index: number) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  resetForm: () => void;
  addGenerationRecord: (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => string;
  getGenerationRecords: () => GenerationRecord[];
  getGenerationRecordById: (id: string) => GenerationRecord | undefined;
  deleteGenerationRecord: (id: string) => void;
  
  // 新增生成結果暫存相關方法
  storeGenerationResult: (result: Omit<GenerationResult, 'timestamp'>) => void;
  getStoredGenerationResult: () => GenerationResult | null;
  clearStoredGenerationResult: () => void;
  isGenerationResultStored: () => boolean;
}

// Create context
const FormContext = createContext<FormContextProps | undefined>(undefined);

// Provider component
export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  // 新增生成歷史記錄的狀態
  const [generationRecords, setGenerationRecords] = useState<GenerationRecord[]>(() => {
    // 從 localStorage 載入歷史記錄
    const storedRecords = localStorage.getItem('generationRecords');
    if (storedRecords) {
      try {
        return JSON.parse(storedRecords);
      } catch (error) {
        console.error('Error parsing stored generation records:', error);
        return [];
      }
    }
    return [];
  });
  
  // 新增生成結果暫存的狀態
  const [storedGenerationResult, setStoredGenerationResult] = useState<GenerationResult | null>(() => {
    // 從 sessionStorage 載入暫存的生成結果
    const storedResult = sessionStorage.getItem('currentGenerationResult');
    if (storedResult) {
      try {
        return JSON.parse(storedResult);
      } catch (error) {
        console.error('Error parsing stored generation result:', error);
        return null;
      }
    }
    return null;
  });

  const updatePersonalInfo = (data: Partial<PersonalInfo>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...data
      }
    }));
  };

  const updateIndustrySettings = (data: Partial<IndustrySettings>) => {
    setFormData(prev => ({
      ...prev,
      industrySettings: {
        ...prev.industrySettings,
        ...data
      }
    }));
  };

  const updateGenerationSettings = (data: Partial<GenerationSettings>) => {
    setFormData(prev => ({
      ...prev,
      generationSettings: {
        ...prev.generationSettings,
        ...data
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        education: [...prev.personalInfo.education, { school: '', degree: '', major: '', graduationYear: '' }]
      }
    }));
  };

  const updateEducation = (index: number, data: Partial<Education>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        education: prev.personalInfo.education.map((education, i) =>
          i === index ? { ...education, ...data } : education
        )
      }
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        education: prev.personalInfo.education.filter((_, i) => i !== index)
      }
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        workExperience: [...prev.personalInfo.workExperience, { 
          company: '', 
          position: '', 
          startDate: '', 
          endDate: '', 
          isCurrent: false, 
          description: '' 
        }]
      }
    }));
  };

  const updateWorkExperience = (index: number, data: Partial<WorkExperience>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        workExperience: prev.personalInfo.workExperience.map((experience, i) =>
          i === index ? { ...experience, ...data } : experience
        )
      }
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        workExperience: prev.personalInfo.workExperience.filter((_, i) => i !== index)
      }
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        skills: [...prev.personalInfo.skills, { name: '', level: '' }]
      }
    }));
  };

  const updateSkill = (index: number, data: Partial<Skill>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        skills: prev.personalInfo.skills.map((skill, i) =>
          i === index ? { ...skill, ...data } : skill
        )
      }
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        skills: prev.personalInfo.skills.filter((_, i) => i !== index)
      }
    }));
  };

  const addKeyword = (keyword: string) => {
    if (!formData.industrySettings.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        industrySettings: {
          ...prev.industrySettings,
          keywords: [...prev.industrySettings.keywords, keyword]
        }
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      industrySettings: {
        ...prev.industrySettings,
        keywords: prev.industrySettings.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  // 新增生成記錄方法
  const addGenerationRecord = (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => {
    // 建立新記錄
    const newRecord: GenerationRecord = {
      ...record,
      id: uuidv4(), // 產生唯一ID
      timestamp: Date.now()
    };
    
    // 更新記錄列表
    const updatedRecords = [...generationRecords, newRecord];
    setGenerationRecords(updatedRecords);
    
    // 儲存到 localStorage (永久保存)
    try {
      localStorage.setItem('generationRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error saving generation records to localStorage:', error);
    }
    
    return newRecord.id;
  };
  
  // 獲取所有生成記錄
  const getGenerationRecords = () => {
    return generationRecords;
  };
  
  // 根據 ID 獲取特定生成記錄
  const getGenerationRecordById = (id: string) => {
    return generationRecords.find(record => record.id === id);
  };
  
  // 刪除特定生成記錄
  const deleteGenerationRecord = (id: string) => {
    const updatedRecords = generationRecords.filter(record => record.id !== id);
    setGenerationRecords(updatedRecords);
    
    // 更新 localStorage
    try {
      localStorage.setItem('generationRecords', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error updating generation records in localStorage after deletion:', error);
    }
  };

  // 儲存生成結果到暫存
  const storeGenerationResult = (result: Omit<GenerationResult, 'timestamp'>) => {
    console.log('[FORM_CONTEXT] 開始儲存生成結果', {
      hasText: !!result.text,
      textLength: result.text?.length || 0,
      projectTitle: result.projectTitle,
      projectId: result.projectId,
      modelProvider: result.modelProvider,
      modelId: result.modelId
    });
    
    const resultWithTimestamp: GenerationResult = {
      ...result,
      timestamp: Date.now()
    };
    
    setStoredGenerationResult(resultWithTimestamp);
    
    // 儲存到 sessionStorage 以便跨頁面保持狀態
    try {
      sessionStorage.setItem('currentGenerationResult', JSON.stringify(resultWithTimestamp));
      console.log('[FORM_CONTEXT] 成功儲存生成結果到 sessionStorage');
      
      // 檢查儲存結果
      const storedValue = sessionStorage.getItem('currentGenerationResult');
      console.log('[FORM_CONTEXT] sessionStorage 中的生成結果', {
        exists: !!storedValue,
        length: storedValue?.length || 0
      });
    } catch (error) {
      console.error('[FORM_CONTEXT] 儲存生成結果到 sessionStorage 時發生錯誤:', error);
    }
  };
  
  // 獲取暫存的生成結果
  const getStoredGenerationResult = () => {
    console.log('[FORM_CONTEXT] 嘗試獲取暫存的生成結果');
    try {
      const stored = sessionStorage.getItem('currentGenerationResult');
      console.log('[FORM_CONTEXT] sessionStorage 中的生成結果狀態', { 
        exists: !!stored,
        length: stored?.length || 0
      });
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[FORM_CONTEXT] 成功解析生成結果', { 
          timestamp: parsed.timestamp,
          hasText: !!parsed.text,
          textLength: parsed.text?.length || 0
        });
        return parsed;
      }
    } catch (error) {
      console.error('[FORM_CONTEXT] 獲取或解析生成結果時發生錯誤:', error);
    }
    
    console.log('[FORM_CONTEXT] 沒有找到暫存的生成結果');
    return storedGenerationResult;
  };
  
  // 清除暫存的生成結果
  const clearStoredGenerationResult = () => {
    console.log('[FORM_CONTEXT] 清除暫存的生成結果');
    setStoredGenerationResult(null);
    sessionStorage.removeItem('currentGenerationResult');
  };
  
  // 檢查是否有暫存的生成結果
  const isGenerationResultStored = () => {
    const result = storedGenerationResult !== null;
    console.log('[FORM_CONTEXT] 檢查是否有暫存的生成結果', { exists: result });
    return result;
  };

  const generateSelfIntroduction = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      // Get API key and model info from the API Key context
      const { apiKey, geminiApiKey, modelProvider, selectedModel, maxTokens } = apiKeyContext;
      
      // Select the appropriate API key based on the model provider
      const selectedApiKey = modelProvider === 'openai' ? apiKey : geminiApiKey;
      
      // Check if we have valid form data
      if (!formData.personalInfo) {
        throw new Error('缺少個人資料。請填寫必要的資訊。');
      }
      
      // Call the model service
      const result = await modelService.generateSelfIntroduction(
        {
          formData,
          apiKey: selectedApiKey,
          selectedModel: selectedModel.id,
          maxTokens
        },
        modelProvider
      );
      
      if (!result.success || !result.data) {
        throw new Error(result.error || '生成自我介紹時發生錯誤。');
      }
      
      // Update the state with the generated result
      setGeneratedIntroduction(result.data);
      
      // Save to generation history 
      addGenerationRecord({
        formData,
        generatedIntroduction: result.data,
        timestamp: new Date().toISOString(),
        modelInfo: {
          provider: modelProvider,
          model: selectedModel.name
        }
      });
      
      return result.data;
    } catch (error) {
      console.error('生成失敗:', error);
      setGenerationError(error instanceof Error ? error.message : '未知錯誤');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FormContext.Provider value={{
      formData,
      setFormData,
      updatePersonalInfo,
      updateIndustrySettings,
      updateGenerationSettings,
      addEducation,
      updateEducation,
      removeEducation,
      addWorkExperience,
      updateWorkExperience,
      removeWorkExperience,
      addSkill,
      updateSkill,
      removeSkill,
      addKeyword,
      removeKeyword,
      resetForm,
      addGenerationRecord,
      getGenerationRecords,
      getGenerationRecordById,
      deleteGenerationRecord,
      // 新增生成結果暫存相關方法
      storeGenerationResult,
      getStoredGenerationResult,
      clearStoredGenerationResult,
      isGenerationResultStored
    }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook for using the form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}; 