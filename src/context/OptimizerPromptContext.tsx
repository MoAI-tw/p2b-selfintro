import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OptimizerPromptTemplate {
  id: string;
  name: string;
  description: string;
  analysisTemplate: string;
  guidanceTemplate: string;
  isDefault: boolean;
}

interface OptimizerPromptContextType {
  analysisTemplates: OptimizerPromptTemplate[];
  currentTemplate: OptimizerPromptTemplate | null;
  setCurrentTemplate: (templateId: string) => void;
  addTemplate: (template: Omit<OptimizerPromptTemplate, 'id'>) => string;
  updateTemplate: (templateId: string, updates: Partial<OptimizerPromptTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  useCustomPrompt: boolean;
  setUseCustomPrompt: (useCustom: boolean) => void;
}

const OptimizerPromptContext = createContext<OptimizerPromptContextType | undefined>(undefined);

export const useOptimizerPrompt = () => {
  const context = useContext(OptimizerPromptContext);
  if (context === undefined) {
    throw new Error('useOptimizerPrompt must be used within an OptimizerPromptProvider');
  }
  return context;
};

interface OptimizerPromptProviderProps {
  children: ReactNode;
}

export const OptimizerPromptProvider = ({ children }: OptimizerPromptProviderProps) => {
  const [templates, setTemplates] = useState<OptimizerPromptTemplate[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  // Default templates
  const defaultAnalysisTemplate = `請分析這段自我介紹語音的表現。

語音轉錄文本：
{transcript}

需要評估的指標：
- 語速評分（3-5分）：評估說話速度是否適中，是否有助於聽眾理解。
- 清晰度（0-100分）：評估發音是否清晰，是否有咬字不清或模糊的情況。
- 自信度（0-100分）：評估表達是否自信，語調是否堅定有力。

請特別關注以下方面：
{evaluation_areas}

請提供2-5條具體的改進建議，針對性指出可以提升的地方。

請按照以下JSON格式回覆，不要包含任何其他內容：
{
  "speechRate": 數字（3-5之間），
  "clarity": 數字（0-100之間），
  "confidence": 數字（0-100之間），
  "improvements": ["建議1", "建議2", ...]
}`;

  const defaultGuidanceTemplate = `請根據以下分析結果，提供優化這段自我介紹的具體建議和指導。

語音轉錄文本：
{transcript}

分析結果：
- 語速評分：{speech_rate}/5
- 清晰度：{clarity}/100
- 自信度：{confidence}/100

改進建議：
{improvements}

請提供具體的練習方法和技巧，幫助改善以上問題。針對每個改進建議，提供1-2個實用的練習或技巧。

另外，請根據分析結果，重寫一份優化後的自我介紹文稿，作為參考範本。`;

  // Initialize templates
  useEffect(() => {
    console.log('Initializing OptimizerPromptProvider');
    
    const loadTemplates = () => {
      try {
        console.log('Loading templates from localStorage');
        const savedTemplates = localStorage.getItem('optimizerPromptTemplates');
        
        if (savedTemplates) {
          console.log('Found saved templates:', savedTemplates);
          const parsed = JSON.parse(savedTemplates);
          setTemplates(parsed);
          
          // Set current template to first one or default
          if (parsed.length > 0) {
            console.log('Setting current template ID to:', parsed[0].id);
            setCurrentTemplateId(parsed[0].id);
          }
        } else {
          console.log('No saved templates found, creating default template');
          // Create default template
          const defaultTemplate: OptimizerPromptTemplate = {
            id: '1',
            name: '預設模板',
            description: '預設的自我介紹語音分析模板',
            analysisTemplate: defaultAnalysisTemplate,
            guidanceTemplate: defaultGuidanceTemplate,
            isDefault: true
          };
          
          setTemplates([defaultTemplate]);
          setCurrentTemplateId('1');
          localStorage.setItem('optimizerPromptTemplates', JSON.stringify([defaultTemplate]));
        }
      } catch (error) {
        console.error('Error loading optimizer prompt templates:', error);
        
        // Fallback to default template
        console.log('Using fallback default template due to error');
        const defaultTemplate: OptimizerPromptTemplate = {
          id: '1',
          name: '預設模板',
          description: '預設的自我介紹語音分析模板',
          analysisTemplate: defaultAnalysisTemplate,
          guidanceTemplate: defaultGuidanceTemplate,
          isDefault: true
        };
        
        setTemplates([defaultTemplate]);
        setCurrentTemplateId('1');
      }
    };
    
    loadTemplates();
    
    return () => {
      console.log('OptimizerPromptProvider cleanup');
    };
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      try {
        localStorage.setItem('optimizerPromptTemplates', JSON.stringify(templates));
      } catch (error) {
        console.error('Error saving optimizer prompt templates:', error);
      }
    }
  }, [templates]);

  // Methods to manage templates
  const getCurrentTemplate = () => {
    if (!currentTemplateId) return null;
    return templates.find(template => template.id === currentTemplateId) || null;
  };

  const setCurrentTemplate = (templateId: string) => {
    setCurrentTemplateId(templateId);
  };

  const addTemplate = (template: Omit<OptimizerPromptTemplate, 'id'>) => {
    console.log('Adding new template:', template);
    const newTemplate: OptimizerPromptTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    
    console.log('Created template with ID:', newTemplate.id);
    setTemplates(prev => {
      console.log('Previous templates:', prev);
      const newTemplates = [...prev, newTemplate];
      console.log('New templates array:', newTemplates);
      return newTemplates;
    });
    setCurrentTemplateId(newTemplate.id);
    return newTemplate.id;
  };

  const updateTemplate = (templateId: string, updates: Partial<OptimizerPromptTemplate>) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId ? { ...template, ...updates } : template
      )
    );
  };

  const deleteTemplate = (templateId: string) => {
    // Don't allow deleting the default template
    const templateToDelete = templates.find(t => t.id === templateId);
    if (templateToDelete?.isDefault) return;
    
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    
    // If deleting current template, switch to first available template
    if (currentTemplateId === templateId) {
      const remainingTemplates = templates.filter(template => template.id !== templateId);
      if (remainingTemplates.length > 0) {
        setCurrentTemplateId(remainingTemplates[0].id);
      } else {
        setCurrentTemplateId(null);
      }
    }
  };

  return (
    <OptimizerPromptContext.Provider
      value={{
        analysisTemplates: templates,
        currentTemplate: getCurrentTemplate(),
        setCurrentTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        useCustomPrompt,
        setUseCustomPrompt
      }}
    >
      {children}
    </OptimizerPromptContext.Provider>
  );
}; 