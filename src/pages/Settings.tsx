import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useFormContext } from '../context/FormContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faPaperPlane, faChartPie, faLanguage, faComment, faFileAlt, faCheck, faSave, faTimes, faExclamationCircle, faArrowLeft, faArrowRight, faKey, faSliders, faGlobe, faMicrophone, faMagic, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import ApiKeySettings from '../components/ApiKeySettings';
import DraggableModal from '../components/DraggableModal';
import { useApiKey } from '../context/ApiKeyContext';
import { generateSelfIntroduction } from '../utils/modelService';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formData, 
    updateGenerationSettings, 
    updateIndustrySettings,
    storeGenerationResult
  } = useFormContext();
  
  const { 
    apiKey, 
    geminiApiKey, 
    modelProvider, 
    isLoading: isApiKeyLoading, 
    error: apiKeyError,
    modelId,
    selectedModel
  } = useApiKey();
  
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
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
              // Load generation settings
              if (project.formData.generationSettings) {
                const genSettings = project.formData.generationSettings;
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
                updateGenerationSettings(genSettings);
              }
              
              // Load focus areas
              if (project.formData.industrySettings && project.formData.industrySettings.focusAreas) {
                setSelectedFocusAreas(project.formData.industrySettings.focusAreas);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
        }
      }
    }
  }, [location, formData.generationSettings, updateGenerationSettings]);

  // Track changes to enable/disable save button
  useEffect(() => {
    setHasChanges(true);
  }, [localSettings, selectedFocusAreas, projectTitle]);

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
    
    // Get existing projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    let projects = [];
    
    if (storedProjects) {
      projects = JSON.parse(storedProjects);
    }
    
    // Check for duplicate project titles and generate a unique title if needed
    let uniqueTitle = projectTitle;
    let counter = 1;
    
    while (projects.some((project: { title: string }) => project.title === uniqueTitle)) {
      uniqueTitle = `${projectTitle} (${counter})`;
      counter++;
    }
    
    // If title was modified, update the displayed title
    if (uniqueTitle !== projectTitle) {
      setProjectTitle(uniqueTitle);
    }
    
    // Create a new project with the unique title and all form data
    const projectData = {
      id: Date.now(), // Generate a unique ID based on timestamp
      title: uniqueTitle,
      status: 'draft',
      lastEdited: new Date().toLocaleDateString(),
      description: '自我介紹專案',
      formData: {
        personalInfo: formData.personalInfo,
        industrySettings: formData.industrySettings,
        generationSettings: {
          ...formData.generationSettings,
          // Update with local state
          tone: localSettings.tone,
          outputLength: localSettings.outputLength,
          language: localSettings.language,
          highlightStrengths: localSettings.highlightStrengths,
          includeCallToAction: localSettings.includeCallToAction,
          focusOnRecentExperience: localSettings.focusOnRecentExperience
        }
      }
    };
    
    // Add the new project to the array
    projects.push(projectData);
    
    // Save back to localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Alert user
    alert('專案已儲存！');
    setHasChanges(false);
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
      
      console.log('[GENERATE] 呼叫 API 生成自我介紹', { 
        modelProvider,
        modelId,
        hasFormData: !!formData
      });
      
      // 生成自我介紹
      const result = await generateSelfIntroduction(
        formData,
        modelProvider,
        currentApiKey,
        modelId
      );
      
      console.log('[GENERATE] API 回傳結果', {
        success: !result.error, 
        hasContent: !!result.content,
        errorMessage: result.error
      });
      
      if (result.error) {
        console.log('[GENERATE] 生成錯誤', result.error);
        setGenerationError(result.error);
      } else if (result.content) {
        // 估算 token 和成本
        const tokens = getApproximateTokenCount(result.content);
        const cost = calculateCost(tokens, modelProvider, modelId);
        console.log('[GENERATE] 計算 token 和成本', { tokens, cost });
        
        // 存儲生成結果
        console.log('[GENERATE] 儲存生成結果到 sessionStorage');
        storeGenerationResult({
          text: result.content,
          prompt: result.prompt || '',
          projectTitle: projectTitle,
          projectId: idFromUrl || undefined,
          modelProvider,
          modelId,
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
              <Link 
                to="/prompt-editor"
                className="px-4 py-1.5 rounded-full flex items-center text-sm transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-md"
              >
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                提示詞編輯器
              </Link>
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-1.5 rounded-full flex items-center text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                API 設定
              </button>
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

      <ProgressBar currentStep={3} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 my-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">生成設置</h1>
          
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
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-800">自定義提示詞模板</div>
                  <div className="text-sm text-gray-500">
                    {formData.generationSettings.useCustomPrompt ? '已啟用' : '未啟用'}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  使用自定義提示詞模板可以更精確地控制自我介紹的生成結果。您可以通過提示詞編輯器來創建和管理模板。
                </p>
                
                <Link 
                  to="/prompt-editor" 
                  className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:shadow-md transition-all"
                >
                  <FontAwesomeIcon icon={faMagic} className="mr-2" />
                  前往提示詞編輯器
                </Link>
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
    </div>
  );
};

export default Settings; 