import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  description: string;
}

export interface GenerationSettings {
  duration: string;
  customDuration: string;
  language: string;
  style: string;
  structure: string;
  useCustomPrompt: boolean;
  promptTemplate: string;
  activePromptId: string;
  promptTemplates: Record<string, PromptTemplate>;
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
    activePromptId: 'default',
    promptTemplates: {
      'default': {
        id: 'default',
        name: '預設通用模板',
        description: '全方位展示您的教育、技能和工作經驗的通用模板。',
        content: '請幫我寫一份自我介紹，應徵職位是{job_position}，目標行業是{industry}。\n\n個人資料：\n- 姓名：{name}\n- 年齡：{age}\n- 所在地：{location}\n\n教育背景：\n{education}\n\n技能專長：\n{skills}\n\n工作經驗：\n{experience}\n\n要求：\n- 語言：{language}\n- 語調：{tone}\n- 長度：{length}\n- 目標讀者：{target_audience}\n- 重點突出：{focus_areas}\n\n請直接給我完整的自我介紹文本，不要包含任何解釋或前言後語。'
      },
      'technical': {
        id: 'technical',
        name: '技術專業型模板',
        description: '適合技術職位面試，著重展示您的技術能力和專業成就。',
        content: '請生成一份技術導向的{language}自我介紹，時長{duration}秒，適用於{industry}行業的技術職位面試。\n\n重點內容：\n1. 簡短介紹教育背景和技術專業\n2. 詳細說明技術棧和專業能力，特別是{keywords}\n3. 技術成就展示：具體陳述如何運用技術解決問題，包含量化的成果\n4. 技術專案經驗：簡要描述專案中使用的技術和實現的功能\n5. 技術學習能力和持續進修的態度\n\n整體應以專業技術語言為主，避免過多非技術內容，確保能在{duration}秒內說完。'
      },
      'achievement': {
        id: 'achievement',
        name: '成就導向型模板',
        description: '側重於展示您的職業成就和量化成果，適合需要強調成功經驗的場合。',
        content: '請使用{language}生成一份以成就為導向的自我介紹，時長{duration}秒，適合{industry}行業的{job_position}職位申請。\n\n重點突出以下成就：\n1. 開場：簡要介紹自己並表明申請意向\n2. 最顯著的職業成就：詳述2-3個最具影響力的成就，並量化結果\n3. 與{industry}相關的專案成果：特別是涉及的關鍵貢獻\n4. 獲得的認可和獎項\n5. 這些成就如何使你成為{job_position}的理想人選\n\n整體風格應{style}，重點強調可量化的成果和解決問題的能力。'
      }
    },
    tone: 'Professional',
    outputLength: 'Medium',
    highlightStrengths: true,
    includeCallToAction: true,
    focusOnRecentExperience: false
  }
};

// Context interface
export interface FormContextProps {
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
  addPromptTemplate: (template: Omit<PromptTemplate, 'id'>) => string;
  updatePromptTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  deletePromptTemplate: (id: string) => void;
  setActivePromptId: (id: string) => void;
  getPromptTemplatesList: () => PromptTemplate[];
  
  // Save all prompt templates to localStorage
  savePromptTemplatesToLocalStorage: () => void;
  
  // 新增生成結果暫存相關方法
  storeGenerationResult: (result: Omit<GenerationResult, 'timestamp'>) => void;
  getStoredGenerationResult: () => GenerationResult | null;
  clearStoredGenerationResult: () => void;
  isGenerationResultStored: () => boolean;
  
  // Get all templates for project export
  getAllTemplatesForExport: () => Record<string, PromptTemplate>;
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
    setFormData(prev => {
      const updatedSettings = {
        ...prev.generationSettings,
        ...data
      };
      
      // Save prompt templates to localStorage if they've been updated
      if (data.promptTemplates) {
        localStorage.setItem('prompt_templates', JSON.stringify(data.promptTemplates));
      }
      
      // Save selected template ID to localStorage if it's been updated
      if (data.activePromptId) {
        localStorage.setItem('selected_prompt_template_id', data.activePromptId);
      }
      
      // If promptTemplate is updated, save it to localStorage
      if (data.promptTemplate) {
        localStorage.setItem('current_prompt_template', data.promptTemplate);
      }
      
      // Save useCustomPrompt setting
      if (data.useCustomPrompt !== undefined) {
        localStorage.setItem('use_custom_prompt', String(data.useCustomPrompt));
      }
      
      return {
        ...prev,
        generationSettings: updatedSettings
      };
    });
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

  // New methods for prompt template management
  const addPromptTemplate = (template: Omit<PromptTemplate, 'id'>) => {
    const id = uuidv4();
    const newTemplate: PromptTemplate = {
      ...template, 
      id
    };
    
    // First get the current templates from state
    const updatedTemplates = {
      ...formData.generationSettings.promptTemplates,
      [id]: newTemplate
    };
    
    // Update state with new template
    setFormData(prev => {
      return {
        ...prev,
        generationSettings: {
          ...prev.generationSettings,
          promptTemplates: updatedTemplates,
          activePromptId: id,
          promptTemplate: newTemplate.content
        }
      };
    });
    
    // Directly save updated templates to localStorage
    try {
      localStorage.setItem('prompt_templates', JSON.stringify(updatedTemplates));
      localStorage.setItem('selected_prompt_template_id', id);
      localStorage.setItem('current_prompt_template', newTemplate.content);
      localStorage.setItem('use_custom_prompt', 'true');
      console.log('Added new template and saved to localStorage:', newTemplate.name);
    } catch (error) {
      console.error('Error saving new template to localStorage:', error);
    }
    
    return id;
  };
  
  const updatePromptTemplate = (id: string, template: Partial<PromptTemplate>) => {
    // Get existing template from state
    const existingTemplate = formData.generationSettings.promptTemplates[id];
    if (!existingTemplate) {
      console.warn('Template not found, cannot update:', id);
      return;
    }
    
    // Create updated template and collection
    const updatedTemplate = {
      ...existingTemplate,
      ...template
    };
    
    const updatedTemplates = {
      ...formData.generationSettings.promptTemplates,
      [id]: updatedTemplate
    };
    
    // Determine if we need to update the prompt template as well
    const isActiveTemplate = id === formData.generationSettings.activePromptId;
    const newPromptTemplate = isActiveTemplate ? 
      updatedTemplate.content : 
      formData.generationSettings.promptTemplate;
    
    // Update state
    setFormData(prev => {
      return {
        ...prev,
        generationSettings: {
          ...prev.generationSettings,
          promptTemplates: updatedTemplates,
          promptTemplate: newPromptTemplate
        }
      };
    });
    
    // Directly save to localStorage
    try {
      localStorage.setItem('prompt_templates', JSON.stringify(updatedTemplates));
      if (isActiveTemplate) {
        localStorage.setItem('current_prompt_template', newPromptTemplate);
      }
      console.log('Updated template and saved to localStorage:', updatedTemplate.name);
    } catch (error) {
      console.error('Error saving updated template to localStorage:', error);
    }
  };
  
  const deletePromptTemplate = (id: string) => {
    // Don't allow deleting the default template
    if (id === 'default') {
      console.warn('Cannot delete default template');
      return;
    }
    
    // First check if the template exists in current state
    const existingTemplates = formData.generationSettings.promptTemplates;
    if (!existingTemplates || !existingTemplates[id]) {
      console.warn('Template not found, cannot delete:', id);
      return;
    }
    
    // Create a copy and remove the template
    const updatedTemplates = { ...existingTemplates };
    delete updatedTemplates[id];
    
    // Determine new active template if needed
    const isActiveTemplate = id === formData.generationSettings.activePromptId;
    const newActiveId = isActiveTemplate ? 'default' : formData.generationSettings.activePromptId;
    const newPromptTemplate = isActiveTemplate ? 
      (updatedTemplates[newActiveId]?.content || '') : 
      formData.generationSettings.promptTemplate;
    
    // Update state with template removed
    setFormData(prev => {
      return {
        ...prev,
        generationSettings: {
          ...prev.generationSettings,
          promptTemplates: updatedTemplates,
          activePromptId: newActiveId,
          promptTemplate: newPromptTemplate
        }
      };
    });
    
    // Directly save updated templates to localStorage
    try {
      localStorage.setItem('prompt_templates', JSON.stringify(updatedTemplates));
      if (isActiveTemplate) {
        localStorage.setItem('selected_prompt_template_id', newActiveId);
        localStorage.setItem('current_prompt_template', newPromptTemplate);
      }
      console.log('Deleted template and saved changes to localStorage:', id);
    } catch (error) {
      console.error('Error saving template changes to localStorage after deletion:', error);
    }
  };
  
  const setActivePromptId = (id: string) => {
    // Check if template exists
    const template = formData.generationSettings.promptTemplates[id];
    if (!template) {
      console.warn('Template not found, cannot set as active:', id);
      return;
    }
    
    // Update state
    setFormData(prev => {
      return {
        ...prev,
        generationSettings: {
          ...prev.generationSettings,
          activePromptId: id,
          promptTemplate: template.content,
          useCustomPrompt: true
        }
      };
    });
    
    // Directly save to localStorage
    try {
      localStorage.setItem('selected_prompt_template_id', id);
      localStorage.setItem('current_prompt_template', template.content);
      localStorage.setItem('use_custom_prompt', 'true');
      console.log('Set active template and saved to localStorage:', template.name);
    } catch (error) {
      console.error('Error saving active template to localStorage:', error);
    }
  };
  
  // Get a list of all prompt templates (for UI display)
  const getPromptTemplatesList = () => {
    // Add null check to prevent "Cannot convert undefined or null to object" error
    if (!formData.generationSettings.promptTemplates) {
      console.warn('promptTemplates is undefined or null in getPromptTemplatesList');
      return [];
    }
    return Object.values(formData.generationSettings.promptTemplates);
  };

  // Initialize form data with localStorage values or defaults
  useEffect(() => {
    // Get prompts data from localStorage if available
    try {
      // First, check if we have templates in localStorage
      const storedTemplates = localStorage.getItem('prompt_templates');
      
      if (storedTemplates) {
        // If we have stored templates, use them directly without merging with defaults
        try {
          const parsedTemplates = JSON.parse(storedTemplates);
          if (parsedTemplates && typeof parsedTemplates === 'object') {
            console.log('Loaded stored templates from localStorage:', Object.keys(parsedTemplates).length);
            
            // Get other template settings
            const selectedTemplateId = localStorage.getItem('selected_prompt_template_id') || 'default';
            const currentPromptTemplate = localStorage.getItem('current_prompt_template') || '';
            const useCustomPromptSetting = localStorage.getItem('use_custom_prompt') || 'false';
            
            // Update form data with stored templates and settings
            setFormData(prev => ({
              ...prev,
              generationSettings: {
                ...prev.generationSettings,
                promptTemplates: parsedTemplates,
                activePromptId: selectedTemplateId,
                promptTemplate: currentPromptTemplate || (parsedTemplates[selectedTemplateId]?.content || ''),
                useCustomPrompt: useCustomPromptSetting === 'true'
              }
            }));
          }
        } catch (templateError) {
          console.error('Error parsing stored template collection:', templateError);
          fallbackToDefaultTemplates();
        }
      } else {
        // If no stored templates, initialize with default templates
        console.log('No stored templates found, initializing with defaults');
        initializeWithDefaultTemplates();
        
        // Save default templates to localStorage for future reference
        saveDefaultTemplatesToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading prompt templates from localStorage:', error);
      fallbackToDefaultTemplates();
    }
  }, []);
  
  // Helper function to initialize with default templates
  const initializeWithDefaultTemplates = () => {
    const defaultTemplates = {...defaultFormData.generationSettings.promptTemplates};
    
    setFormData(prev => ({
      ...prev,
      generationSettings: {
        ...prev.generationSettings,
        promptTemplates: defaultTemplates,
        activePromptId: 'default',
        promptTemplate: defaultTemplates['default']?.content || '',
        useCustomPrompt: false
      }
    }));
  };
  
  // Helper function to save default templates to localStorage
  const saveDefaultTemplatesToLocalStorage = () => {
    try {
      const defaultTemplates = {...defaultFormData.generationSettings.promptTemplates};
      localStorage.setItem('prompt_templates', JSON.stringify(defaultTemplates));
      localStorage.setItem('selected_prompt_template_id', 'default');
      localStorage.setItem('current_prompt_template', defaultTemplates['default']?.content || '');
      localStorage.setItem('use_custom_prompt', 'false');
      console.log('Saved default templates to localStorage');
    } catch (error) {
      console.error('Error saving default templates to localStorage:', error);
    }
  };
  
  // Helper function for fallback in case of errors
  const fallbackToDefaultTemplates = () => {
    console.warn('Falling back to default templates');
    initializeWithDefaultTemplates();
  };

  // Save all prompt templates to localStorage function (used as a backup save method) 
  const savePromptTemplatesToLocalStorage = () => {
    // This is now a backup method that should generally not be needed
    // since we directly save templates when they're modified
    
    // Defensive check for null/undefined values
    if (!formData?.generationSettings) {
      console.warn('Cannot save templates - formData.generationSettings is undefined');
      return;
    }
    
    // Check if we already have templates in localStorage first
    try {
      const existingTemplates = localStorage.getItem('prompt_templates');
      if (existingTemplates) {
        // Only log that we're not overwriting existing templates
        console.log('Templates already exist in localStorage, not overwriting automatically');
        return;
      }
    } catch (e) {
      // If there's an error checking, we'll proceed with saving
      console.warn('Error checking localStorage for existing templates');
    }
    
    // If we reach here, it means no templates exist in localStorage, so save current ones
    const { promptTemplates, activePromptId, promptTemplate, useCustomPrompt } = formData.generationSettings;
    
    // If promptTemplates is undefined or null, use default templates
    const templatesToSave = promptTemplates || defaultFormData.generationSettings.promptTemplates;
    const activeIdToSave = (activePromptId && templatesToSave[activePromptId]) ? 
      activePromptId : 'default';
    const templateContentToSave = promptTemplate || 
      (templatesToSave[activeIdToSave]?.content || '');
    
    try {
      localStorage.setItem('prompt_templates', JSON.stringify(templatesToSave));
      localStorage.setItem('selected_prompt_template_id', activeIdToSave);
      localStorage.setItem('current_prompt_template', templateContentToSave);
      localStorage.setItem('use_custom_prompt', String(!!useCustomPrompt));
      console.log('Backed up templates to localStorage:', {
        count: Object.keys(templatesToSave).length,
        activeId: activeIdToSave
      });
    } catch (error) {
      console.error('Error saving prompt templates to localStorage:', error);
    }
  };

  // Get all templates for project export
  const getAllTemplatesForExport = () => {
    // Ensure we never return null or undefined
    if (!formData?.generationSettings?.promptTemplates) {
      console.warn('promptTemplates is undefined or null in getAllTemplatesForExport');
      // Return at least the default templates
      return {...defaultFormData.generationSettings.promptTemplates};
    }
    return formData.generationSettings.promptTemplates;
  };

  return (
    <FormContext.Provider 
      value={{
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
        addPromptTemplate,
        updatePromptTemplate,
        deletePromptTemplate,
        setActivePromptId,
        getPromptTemplatesList,
        getAllTemplatesForExport,
        savePromptTemplatesToLocalStorage,
        storeGenerationResult,
        getStoredGenerationResult,
        clearStoredGenerationResult,
        isGenerationResultStored
      }}
    >
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