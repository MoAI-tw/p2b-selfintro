import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useFormContext } from '../context/FormContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faPaperPlane, faChartPie, faLanguage, faComment, faFileAlt, faCheck, faSave, faTimes, faExclamationCircle, faArrowLeft, faArrowRight, faKey, faSliders, faGlobe, faMicrophone, faMagic, faSpinner, faEye, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import ApiKeySettings from '../components/ApiKeySettings';
import DraggableModal from '../components/DraggableModal';
import { useApiKey } from '../context/ApiKeyContext';
import { generateSelfIntroduction } from '../utils/modelService';
import { generatePrompt } from '../utils/openai';
import ModelSettingsDashboard from '../components/ModelSettingsDashboard';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formData, 
    updateGenerationSettings, 
    updateIndustrySettings,
    storeGenerationResult,
    updatePersonalInfo,
    savePromptTemplatesToLocalStorage,
    addPromptTemplate,
    updatePromptTemplate,
    getPromptTemplatesList,
    getAllTemplatesForExport
  } = useFormContext();
  
  const { 
    apiKey, 
    geminiApiKey, 
    modelProvider, 
    loading: isApiKeyLoading, 
    error: apiKeyError,
    selectedModel,
    maxTokens
  } = useApiKey();
  
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // 新增模板編輯相關狀態
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateEditMode, setTemplateEditMode] = useState<'create' | 'edit'>('create');
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    name: string;
    content: string;
    description: string;
  }>({
    id: '',
    name: '',
    content: '',
    description: ''
  });
  
  const [localSettings, setLocalSettings] = useState({
    tone: formData.generationSettings.tone,
    outputLength: formData.generationSettings.outputLength,
    language: formData.generationSettings.language,
    highlightStrengths: formData.generationSettings.highlightStrengths,
    includeCallToAction: formData.generationSettings.includeCallToAction,
    focusOnRecentExperience: formData.generationSettings.focusOnRecentExperience
  });

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(
    formData.industrySettings.focusAreas ? 
    [...formData.industrySettings.focusAreas] : 
    []
  );

  // Check for project name in URL params on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const nameFromUrl = searchParams.get('project_name');
    const idFromUrl = searchParams.get('id');
    
    if (nameFromUrl) {
      setProjectTitle(nameFromUrl);
    } else if (idFromUrl) {
      // Load project by ID from localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          const project = projects.find((p: any) => p.id.toString() === idFromUrl);
          if (project) {
            setProjectTitle(project.title);
            
            // Load saved form data if available
            if (project.formData) {
              // 加載個人信息
              if (project.formData.personalInfo) {
                // 更新個人信息
                updatePersonalInfo(project.formData.personalInfo);
              }
              
              // 加載行業設置
              if (project.formData.industrySettings) {
                const industrySettings = project.formData.industrySettings;
                
                // 更新焦點領域
                if (industrySettings.focusAreas) {
                  setSelectedFocusAreas(industrySettings.focusAreas);
                }
                
                // 完整更新行業設置
                updateIndustrySettings(industrySettings);
                
                console.log('已加載行業設置:', {
                  industry: industrySettings.industry,
                  jobPosition: industrySettings.specificPosition,
                  keywords: industrySettings.keywords,
                  focusAreas: industrySettings.focusAreas
                });
              }
              
              // 加載生成設置
              if (project.formData.generationSettings) {
                const genSettings = project.formData.generationSettings;
                
                // 更新本地設置狀態
                setLocalSettings({
                  tone: genSettings.tone || formData.generationSettings.tone,
                  outputLength: genSettings.outputLength || formData.generationSettings.outputLength,
                  language: genSettings.language || formData.generationSettings.language,
                  highlightStrengths: genSettings.highlightStrengths !== undefined ? 
                    genSettings.highlightStrengths : formData.generationSettings.highlightStrengths,
                  includeCallToAction: genSettings.includeCallToAction !== undefined ? 
                    genSettings.includeCallToAction : formData.generationSettings.includeCallToAction,
                  focusOnRecentExperience: genSettings.focusOnRecentExperience !== undefined ? 
                    genSettings.focusOnRecentExperience : formData.generationSettings.focusOnRecentExperience
                });
                
                // Check if we have saved templates in the project
                if (genSettings.promptTemplates && typeof genSettings.promptTemplates === 'object') {
                  console.log('Found saved templates in project:', Object.keys(genSettings.promptTemplates).length);
                  
                  // We'll merge default templates with saved ones to ensure we have all necessary templates
                  const mergedSettings = {
                    ...genSettings,
                    promptTemplates: {
                      ...formData.generationSettings.promptTemplates, // Start with current defaults 
                      ...genSettings.promptTemplates // Override with project-specific templates
                    }
                  };
                  
                  // 完整更新生成設置 with merged templates
                  updateGenerationSettings(mergedSettings);
                  
                  // Save the updated templates to localStorage for future use
                  savePromptTemplatesToLocalStorage();
                } else {
                  // No templates found, just update other settings
                  console.log('No templates found in project, using current templates');
                  updateGenerationSettings(genSettings);
                }
                
                console.log('已加載生成設置:', {
                  duration: genSettings.duration,
                  language: genSettings.language,
                  style: genSettings.style,
                  activePromptId: genSettings.activePromptId,
                  tone: genSettings.tone
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
        }
      }
    }
  }, [location, updateGenerationSettings, updateIndustrySettings, updatePersonalInfo, formData.generationSettings, savePromptTemplatesToLocalStorage]);

  // Track changes to enable/disable save button
  useEffect(() => {
    setHasChanges(true);
  }, [localSettings, selectedFocusAreas, projectTitle]);
  
  // Remove the auto-save prompt templates effect since we now directly save when making changes
  // This effect is no longer needed

  // Validate project title when it changes
  useEffect(() => {
    setTitleError(projectTitle.trim() === '');
  }, [projectTitle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setLocalSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFocusAreaToggle = (area: string) => {
    setSelectedFocusAreas(prev => {
      if (prev.includes(area)) {
        return prev.filter(a => a !== area);
      } else {
        return [...prev, area];
      }
    });
  };

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProjectTitle(newTitle);
    setTitleError(newTitle.trim() === '');
  };

  const handleSave = () => {
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }
    
    try {
      // Get existing projects from localStorage
      const storedProjects = localStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Find existing project with the same ID if editing
      const urlParams = new URLSearchParams(location.search);
      const projectId = urlParams.get('id');
      const existingProject = projectId ? projects.find((p: any) => p.id.toString() === projectId) : null;
      
      // Get a copy of all current templates to include with the project
      const allTemplates = getAllTemplatesForExport();
      
      // Create a project data object with the current form state
      const currentFormData = formData;
      const newProjectData = {
        id: existingProject ? existingProject.id : Date.now(),
        title: projectTitle,
        created: existingProject ? existingProject.created : Date.now(),
        updated: Date.now(),
        formData: {
          personalInfo: currentFormData.personalInfo,
          industrySettings: {
            ...currentFormData.industrySettings,
            focusAreas: selectedFocusAreas
          },
          generationSettings: {
            ...currentFormData.generationSettings,
            tone: localSettings.tone,
            outputLength: localSettings.outputLength,
            language: localSettings.language,
            highlightStrengths: localSettings.highlightStrengths,
            includeCallToAction: localSettings.includeCallToAction,
            focusOnRecentExperience: localSettings.focusOnRecentExperience,
            activePromptId: currentFormData.generationSettings.activePromptId,
            promptTemplates: allTemplates  // Include all templates with the project
          }
        }
      };
      
      // Remove existing project if it exists (to avoid duplicates)
      const filteredProjects = projectId 
        ? projects.filter((p: any) => p.id.toString() !== projectId) 
        : projects;
      
      // Add the new project to the array
      filteredProjects.push(newProjectData);
      
      // Save back to localStorage
      localStorage.setItem('projects', JSON.stringify(filteredProjects));
      
      // Make sure all templates are also saved separately in localStorage
      savePromptTemplatesToLocalStorage();
      
      // Alert user
      alert('專案已儲存！');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving project:', error);
      setGenerationError('保存專案時發生錯誤');
    }
  };
  
  // 計算估算的 Token 數量
  const getApproximateTokenCount = (text: string) => {
    // 簡單估算：平均每 4 個字符等於 1 個 token
    return Math.ceil(text.length / 4);
  };

  // 估算成本
  const calculateCost = (tokens: number, provider: string, model: string): number => {
    // 簡單估算成本，實際成本計算應該更精確
    if (provider === 'openai') {
      if (model.includes('gpt-4')) {
        return tokens * 0.00003; // 假設GPT-4的成本
      } else {
        return tokens * 0.000002; // 假設GPT-3.5的成本
      }
    } else if (provider === 'gemini') {
      return tokens * 0.0000005; // 假設Gemini的成本
    }
    return 0;
  };

  // 生成自我介紹
  const generateIntroduction = async () => {
    // Logging：開始執行 generateIntroduction
    console.log('[GENERATE] 開始生成自我介紹流程');

    if (projectTitle.trim() === '') {
      console.log('[GENERATE] 錯誤：專案標題為空');
      setTitleError(true);
      return;
    }
    
    if (selectedFocusAreas.length === 0) {
      console.log('[GENERATE] 錯誤：未選擇重點領域');
      return; // 防止在沒有選擇重點領域時提交
    }
    
    // 首先更新 context 中的設置
    console.log('[GENERATE] 更新生成設置', localSettings);
    updateGenerationSettings({
      tone: localSettings.tone,
      outputLength: localSettings.outputLength,
      language: localSettings.language,
      highlightStrengths: localSettings.highlightStrengths,
      includeCallToAction: localSettings.includeCallToAction,
      focusOnRecentExperience: localSettings.focusOnRecentExperience
    });
    
    console.log('[GENERATE] 更新行業設置', { focusAreas: selectedFocusAreas });
    updateIndustrySettings({
      focusAreas: selectedFocusAreas
    });
    
    // 檢查 API key
    const currentApiKey = modelProvider === 'openai' ? apiKey : geminiApiKey;
    if (!currentApiKey) {
      console.log('[GENERATE] 錯誤：API Key 未設定', { modelProvider });
      setGenerationError(`${modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API Key 未設定。請聯繫管理員。`);
      setShowApiKeyModal(true);
      return;
    }
    
    // 設置生成中狀態
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      // 取得URL中的專案ID
      const searchParams = new URLSearchParams(location.search);
      const idFromUrl = searchParams.get('id');
      console.log('[GENERATE] 專案資訊', { title: projectTitle, id: idFromUrl });
      
      // 確保使用當前的表單數據，檢查並補充缺少的必要參數
      const currentFormData = {...formData};
      
      // 根據本地設置更新生成設置參數
      currentFormData.generationSettings = {
        ...currentFormData.generationSettings,
        language: localSettings.language,
        tone: localSettings.tone,
        outputLength: localSettings.outputLength,
        highlightStrengths: localSettings.highlightStrengths,
        includeCallToAction: localSettings.includeCallToAction,
        focusOnRecentExperience: localSettings.focusOnRecentExperience
      };
      
      // 確保行業設置包含必要參數
      currentFormData.industrySettings = {
        ...currentFormData.industrySettings,
        focusAreas: selectedFocusAreas
      };
      
      // 輸出完整表單數據日誌，檢查關鍵參數是否存在
      console.log('[GENERATE] 生成前的表單數據檢查', {
        // 生成設置
        duration: currentFormData.generationSettings.duration,
        language: currentFormData.generationSettings.language,
        style: currentFormData.generationSettings.style,
        activePromptId: currentFormData.generationSettings.activePromptId,
        useCustomPrompt: currentFormData.generationSettings.useCustomPrompt,
        
        // 行業設置
        industry: currentFormData.industrySettings.industry,
        jobPosition: currentFormData.industrySettings.specificPosition,
        keywords: currentFormData.industrySettings.keywords,
        focusAreas: currentFormData.industrySettings.focusAreas
      });
      
      console.log('[GENERATE] 呼叫 API 生成自我介紹', { 
        modelProvider,
        selectedModel,
        hasFormData: !!currentFormData
      });
      
      // 生成自我介紹
      const result = await generateSelfIntroduction(
        {
          formData: currentFormData,
          apiKey: currentApiKey,
          selectedModel: selectedModel.id,
          maxTokens
        },
        modelProvider
      );
      
      console.log('[GENERATE] API 回傳結果', {
        success: result.success, 
        hasContent: !!result.data,
        errorMessage: result.error
      });
      
      if (result.error) {
        console.log('[GENERATE] 生成錯誤', result.error);
        setGenerationError(result.error);
      } else if (result.data) {
        // 估算 token 和成本
        const tokens = getApproximateTokenCount(result.data);
        const cost = calculateCost(tokens, modelProvider, selectedModel.id);
        console.log('[GENERATE] 計算 token 和成本', { tokens, cost });
        
        // 嘗試獲取和記錄生成的提示詞
        let promptText = '';
        try {
          promptText = generatePrompt(currentFormData);
          console.log('[GENERATE] 生成的提示詞:', {
            length: promptText.length,
            preview: promptText.substring(0, 100) + '...'
          });
        } catch (err) {
          console.error('[GENERATE] 無法獲取提示詞:', err);
        }
        
        // 存儲生成結果
        console.log('[GENERATE] 儲存生成結果到 sessionStorage');
        storeGenerationResult({
          text: result.data,
          prompt: promptText, // 保存提示詞
          projectTitle: projectTitle,
          projectId: idFromUrl || undefined,
          modelProvider,
          modelId: selectedModel.id,
          estimatedTokens: tokens,
          estimatedCost: cost,
        });
        
        // 導航到結果頁面
        const resultUrl = `/result?project_name=${encodeURIComponent(projectTitle)}${idFromUrl ? `&id=${idFromUrl}` : ''}`;
        console.log('[GENERATE] 導航到結果頁面', { url: resultUrl });
        navigate(resultUrl);
      } else {
        console.log('[GENERATE] 未知錯誤：沒有內容也沒有錯誤');
        setGenerationError('生成自我介紹時發生未知錯誤');
      }
    } catch (error) {
      console.error('[GENERATE] 生成自我介紹時發生例外錯誤:', error);
      setGenerationError(error instanceof Error ? error.message : '未知錯誤');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateIntroduction();
  };

  // 定義語氣選項的中英文映射
  const toneOptions = [
    { value: 'Professional', label: '專業正式' },
    { value: 'Friendly', label: '友善親切' },
    { value: 'Confident', label: '自信堅定' },
    { value: 'Creative', label: '創意活潑' },
    { value: 'Formal', label: '嚴謹正式' },
    { value: 'Conversational', label: '對話自然' }
  ];

  // 定義輸出長度選項的中英文映射
  const lengthOptions = [
    { value: 'Short', label: '簡短', description: '約100字' },
    { value: 'Medium', label: '適中', description: '約200字' },
    { value: 'Long', label: '詳細', description: '約300字' }
  ];

  // 定義語言選項的中英文映射
  const languageOptions = [
    { value: 'English', label: '英文' },
    { value: 'Chinese', label: '中文' }
  ];

  // 重點領域選項
  const focusAreaOptions = [
    { value: 'skills', label: '專業技能' },
    { value: 'experience', label: '工作經驗' },
    { value: 'achievements', label: '成就亮點' },
    { value: 'education', label: '教育背景' },
    { value: 'personality', label: '個人特質' }
  ];

  // 新增處理模板相關的函數
  const handleCreateTemplate = () => {
    setTemplateEditMode('create');
    setEditingTemplate({
      id: `custom_${Date.now()}`,
      name: '',
      content: '',
      description: ''
    });
    setShowTemplateModal(true);
  };
  
  const handleEditTemplate = (templateId: string) => {
    const template = formData.generationSettings.promptTemplates[templateId];
    if (template) {
      setTemplateEditMode('edit');
      setEditingTemplate({...template});
      setShowTemplateModal(true);
    }
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveTemplate = () => {
    // 驗證表單
    if (!editingTemplate.name.trim() || !editingTemplate.content.trim()) {
      // 顯示錯誤
      return;
    }
    
    if (templateEditMode === 'create') {
      // 使用新的 addPromptTemplate 方法新增模板
      const newTemplateData = {
        name: editingTemplate.name,
        content: editingTemplate.content,
        description: editingTemplate.description
      };
      
      const newId = addPromptTemplate(newTemplateData);
      
      // Update editing template ID for consistent state
      setEditingTemplate(prev => ({...prev, id: newId}));
    } else {
      // 使用新的 updatePromptTemplate 方法更新模板
      updatePromptTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        content: editingTemplate.content,
        description: editingTemplate.description
      });
    }
    
    // No need to call savePromptTemplatesToLocalStorage here anymore
    // as the addPromptTemplate and updatePromptTemplate methods directly 
    // save to localStorage
    
    // 關閉模態框
    setShowTemplateModal(false);
    setHasChanges(true);
  };

  // 監聽路由變化，當從提示詞編輯器返回時重載
  useEffect(() => {
    // 檢查是否從提示詞編輯器頁面返回
    const prevPath = sessionStorage.getItem('prevPath');
    if (prevPath === '/prompt-editor') {
      console.log('從提示詞編輯器返回，重新載入模板');
      // 設置當前模板ID
      const templateId = formData.generationSettings.activePromptId;
      if (templateId) {
        updateGenerationSettings({
          activePromptId: templateId,
          useCustomPrompt: true
        });
      }
    }
    // 記錄當前路徑
    sessionStorage.setItem('prevPath', location.pathname);
  }, [location.pathname, formData.generationSettings.activePromptId, updateGenerationSettings]);

  // Add an event listener to save templates before leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only try to save if there are unsaved changes (which should be rare since we save directly)
      if (hasChanges) {
        // This is just a backup to catch any edge cases
        console.log('Detected unsaved changes before unload, attempting backup save');
        savePromptTemplatesToLocalStorage();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, savePromptTemplatesToLocalStorage]);

  // Safely get prompt templates list with error handling
  const safeGetPromptTemplatesList = () => {
    try {
      const templates = getPromptTemplatesList();
      return Array.isArray(templates) ? templates : [];
    } catch (error) {
      console.error('Error getting prompt templates list:', error);
      return [];
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 頂部導航區 */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative">
                <input 
                  type="text" 
                  id="project_title" 
                  className={`text-xl font-semibold text-gray-800 focus:outline-none border-b border-transparent focus:border-indigo-500 px-1 ${titleError ? 'border-red-500 text-red-500' : ''}`}
                  value={projectTitle}
                  onChange={handleProjectTitleChange}
                  placeholder="請輸入專案名稱"
                />
                {titleError && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-xs flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                    專案名稱不能為空
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                id="save_btn" 
                disabled={!hasChanges || titleError}
                onClick={handleSave}
                className={`px-4 py-1.5 rounded-full flex items-center text-sm transition-all duration-200 ${
                  hasChanges && !titleError
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />儲存
              </button>
              <Link to="/projects" className="text-gray-600 hover:text-indigo-600 flex items-center">
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                關閉
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ProgressBar currentStep={3} projectName={projectTitle} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* AI Model Dashboard */}
        <div className="mb-6">
          <ModelSettingsDashboard onSettingsClick={() => setShowApiKeyModal(true)} />
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">生成設定</h1>
          <p className="text-gray-600 mb-8">設定您的自我介紹生成偏好</p>
          
          {generationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                <span className="font-medium">生成錯誤</span>
              </div>
              <p className="mt-1">{generationError}</p>
              <div className="mt-2">
                <button 
                  onClick={() => setShowApiKeyModal(true)}
                  className="text-red-600 underline"
                >
                  設定 API Key
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* 介紹類型設定 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartPie} className="text-indigo-600 mr-2" />介紹類型設定
              </h2>
              
              <div>
                <label className="block text-gray-700 font-medium mb-3">重點領域（可多選）</label>
                <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-3">
                  {focusAreaOptions.map(option => (
                    <div 
                      key={option.value}
                      onClick={() => handleFocusAreaToggle(option.value)}
                      className={`border-2 rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                        selectedFocusAreas.includes(option.value) 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 flex-shrink-0 rounded border mr-3 flex items-center justify-center ${
                        selectedFocusAreas.includes(option.value) 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedFocusAreas.includes(option.value) && (
                          <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                        )}
                      </div>
                      <span className="text-gray-800">{option.label}</span>
                    </div>
                  ))}
                </div>
                {selectedFocusAreas.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">請至少選擇一個重點領域</p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium mb-4 text-gray-700">語氣選擇</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {toneOptions.map((tone) => (
                  <div key={tone.value} className="relative">
                    <input
                      type="radio"
                      id={tone.value}
                      name="tone"
                      value={tone.value}
                      checked={localSettings.tone === tone.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor={tone.value}
                      className={`block border-2 rounded-md p-4 text-center cursor-pointer transition-all ${
                        localSettings.tone === tone.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {tone.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium mb-4 text-gray-700">內容長度</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lengthOptions.map((length) => (
                  <div key={length.value} className="relative">
                    <input
                      type="radio"
                      id={length.value}
                      name="outputLength"
                      value={length.value}
                      checked={localSettings.outputLength === length.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor={length.value}
                      className={`block border-2 rounded-md p-4 text-center cursor-pointer transition-all ${
                        localSettings.outputLength === length.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{length.label}</div>
                      <div className="text-sm text-gray-500">
                        {length.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium mb-4 text-gray-700">語言選擇</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languageOptions.map((lang) => (
                  <div key={lang.value} className="relative">
                    <input
                      type="radio"
                      id={lang.value}
                      name="language"
                      value={lang.value}
                      checked={localSettings.language === lang.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor={lang.value}
                      className={`block border-2 rounded-md p-4 text-center cursor-pointer transition-all ${
                        localSettings.language === lang.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {lang.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium mb-4 text-gray-700">額外選項</label>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="highlightStrengths"
                    name="highlightStrengths"
                    checked={localSettings.highlightStrengths}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="highlightStrengths" className="ml-3 text-gray-700">
                    突出關鍵優勢和成就
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeCallToAction"
                    name="includeCallToAction"
                    checked={localSettings.includeCallToAction}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="includeCallToAction" className="ml-3 text-gray-700">
                    包含行動召喚結尾
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="focusOnRecentExperience"
                    name="focusOnRecentExperience"
                    checked={localSettings.focusOnRecentExperience}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="focusOnRecentExperience" className="ml-3 text-gray-700">
                    聚焦於最近的經驗
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faMagic} className="text-indigo-600 mr-2" />提示詞設定
              </h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-800">提示詞模板選擇</div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  選擇預設或自定義的提示詞模板，以控制自我介紹的生成風格和內容。
                </p>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {safeGetPromptTemplatesList().map((template) => (
                    <div 
                      key={template.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.generationSettings.activePromptId === template.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        updateGenerationSettings({
                          activePromptId: template.id,
                          promptTemplate: template.content,
                          useCustomPrompt: true
                        });
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{template.name}</h3>
                        {formData.generationSettings.activePromptId === template.id && (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">已選擇</span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">
                        {template.description || '自定義提示詞模板'}
                      </p>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle preview
                            const previewElem = document.getElementById(`preview-${template.id}`);
                            if (previewElem) {
                              previewElem.classList.toggle('hidden');
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          預覽內容
                        </button>
                        
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template.id);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          編輯
                        </button>
                      </div>
                      
                      <div id={`preview-${template.id}`} className="mt-3 hidden">
                        <div className="bg-white border border-gray-200 rounded p-3 text-xs text-gray-600 max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs">{template.content}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleCreateTemplate}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    添加自定義模板
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-10">
              <Link 
                to={`/industry?project_name=${encodeURIComponent(projectTitle)}`} 
                className="flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faAngleLeft} className="mr-2" />
                返回
              </Link>
              
              <button 
                type="submit"
                disabled={selectedFocusAreas.length === 0 || isGenerating}
                className={`flex items-center px-6 py-3 rounded-md text-white transition-colors ${
                  selectedFocusAreas.length > 0 && !isGenerating
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    生成內容
                    <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* API Key Modal */}
      <DraggableModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="AI 模型設定"
        maxWidth="max-w-2xl"
      >
        <ApiKeySettings onClose={() => setShowApiKeyModal(false)} />
      </DraggableModal>
      
      {/* Template Edit Modal */}
      <DraggableModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={templateEditMode === 'create' ? '創建自定義模板' : '編輯模板'}
        maxWidth="max-w-3xl"
      >
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-2">
              模板名稱
            </label>
            <input
              type="text"
              id="template-name"
              name="name"
              value={editingTemplate.name}
              onChange={handleTemplateChange}
              placeholder="給你的模板起個名字"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-2">
              模板描述
            </label>
            <input
              type="text"
              id="template-description"
              name="description"
              value={editingTemplate.description}
              onChange={handleTemplateChange}
              placeholder="簡短描述此模板的用途和特點"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 mb-2">
              模板內容
            </label>
            <div className="text-xs text-gray-500 mb-2">
              使用 {"{變數名}"} 格式引用用戶資料，例如: {"{name}"}, {"{education}"}, {"{skills}"}
            </div>
            <textarea
              id="template-content"
              name="content"
              value={editingTemplate.content}
              onChange={handleTemplateChange}
              rows={12}
              placeholder="輸入你的提示詞模板..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            />
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <h4 className="font-medium mb-1">可用變數:</h4>
            <div className="grid grid-cols-3 gap-2">
              <span><code>{"{name}"}</code> - 姓名</span>
              <span><code>{"{age}"}</code> - 年齡</span>
              <span><code>{"{location}"}</code> - 所在地</span>
              <span><code>{"{education}"}</code> - 教育背景</span>
              <span><code>{"{skills}"}</code> - 技能專長</span>
              <span><code>{"{experience}"}</code> - 工作經驗</span>
              <span><code>{"{industry}"}</code> - 目標行業</span>
              <span><code>{"{job_position}"}</code> - 應徵職位</span>
              <span><code>{"{language}"}</code> - 語言</span>
              <span><code>{"{tone}"}</code> - 語調</span>
              <span><code>{"{length}"}</code> - 長度</span>
              <span><code>{"{duration}"}</code> - 時間長度</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowTemplateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              儲存模板
            </button>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
};

export default Settings; 