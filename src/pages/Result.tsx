import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormContext, GenerationRecord } from '../context/FormContext';
import { useApiKey } from '../context/ApiKeyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy, faDownload, faRedo, faEdit, faThumbsUp, faThumbsDown, faSave, faTimes, faCheck, faExclamationCircle, faHistory } from '@fortawesome/free-solid-svg-icons';
import { generateSelfIntroduction } from '../utils/modelService';
import Modal from '../components/Modal';
import CostEstimator from '../components/CostEstimator';
import GenerationHistory from '../components/GenerationHistory';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formData, 
    setFormData, 
    addGenerationRecord,
    getGenerationRecords,
    getGenerationRecordById
  } = useFormContext();
  
  const { 
    apiKey, 
    geminiApiKey, 
    modelProvider, 
    isLoading: isApiKeyLoading, 
    error: apiKeyError,
    modelName,
    modelId,
    selectedModel
  } = useApiKey();
  
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [actualPrompt, setActualPrompt] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [projectId, setProjectId] = useState<string | number>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null);

  // Check for project name and ID in URL params on component mount
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
            
            // 如果專案有表單數據，則更新 FormContext
            if (project.formData) {
              setFormData(project.formData);
            }
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
        }
      }
    }
  }, [location, setFormData]);

  // Validate project title when it changes
  useEffect(() => {
    setTitleError(projectTitle.trim() === '');
  }, [projectTitle]);

  // Check if there's a record ID in the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const recordId = searchParams.get('record');
    if (recordId) {
      setHistoryRecordId(recordId);
      const record = getGenerationRecordById(recordId);
      if (record) {
        loadGenerationRecord(record);
      }
    }
  }, [location, getGenerationRecordById]);

  // Function to generate introduction using the selected LLM model provider
  const generateIntroduction = async () => {
    // Clear previous states
    setIsLoading(true);
    setError('');
    
    // Check if we have a valid API key based on the selected model provider
    const currentApiKey = modelProvider === 'openai' ? apiKey : geminiApiKey;
    
    if (!currentApiKey) {
      setError(`${modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API Key 未設定。請聯繫管理員。`);
      setIsLoading(false);
      return;
    }
    
    try {
      // 取得URL中的專案ID
      const searchParams = new URLSearchParams(location.search);
      const idFromUrl = searchParams.get('id');
      if (idFromUrl) {
        setProjectId(idFromUrl);
      }
      
      // Use the model service to generate content based on selected provider and model
      const result = await generateSelfIntroduction(
        formData,
        modelProvider,
        currentApiKey,
        modelId
      );
      
      if (result.error) {
        setError(result.error);
      } else if (result.content) {
        setGeneratedText(result.content);
        
        // 儲存提示詞和其他相關資訊
        if (result.prompt) {
          setActualPrompt(result.prompt);
        }
        
        // 估算成本 (假設用字元數估算，實際可能需要更精確的計算)
        const tokens = getApproximateTokenCount(result.content);
        const cost = calculateCost(tokens, modelProvider, modelId);
        setEstimatedCost(cost);
        
        // 保存生成記錄
        const searchParams = new URLSearchParams(location.search);
        const idFromUrl = searchParams.get('id') || '';
        
        addGenerationRecord({
          projectId: idFromUrl,
          projectTitle: projectTitle,
          formData: { ...formData },
          generatedText: result.content,
          modelProvider,
          modelId,
          estimatedTokens: tokens,
          estimatedCost: cost,
          promptTemplate: formData.generationSettings.promptTemplate,
          actualPrompt: result.prompt || ''
        });
      } else {
        setError('生成自我介紹時發生未知錯誤');
      }
    } catch (error) {
      console.error('生成自我介紹時發生錯誤:', error);
      setError(error instanceof Error ? error.message : '未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate cost based on tokens and model
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

  // Generate introduction when component mounts or when API key is loaded
  // or when model provider or selected model changes
  useEffect(() => {
    if (!isApiKeyLoading && (modelProvider === 'openai' ? apiKey : geminiApiKey)) {
      generateIntroduction();
    } else if (!isApiKeyLoading && apiKeyError) {
      setError(apiKeyError);
      setIsLoading(false);
    }
  }, [isApiKeyLoading, apiKey, geminiApiKey, apiKeyError, modelProvider, modelId]);

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProjectTitle(newTitle);
    setTitleError(newTitle.trim() === '');
    setHasChanges(true);
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
    
    // Check if we're editing an existing project
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    let existingProject = null;
    
    if (projectId) {
      existingProject = projects.find((project: { id: number }) => project.id.toString() === projectId);
    }
    
    if (existingProject) {
      // Update existing project
      const updatedProjects = projects.map((project: any) => {
        if (project.id.toString() === projectId) {
          return {
            ...project,
            title: projectTitle,
            lastEdited: new Date().toLocaleDateString(),
            status: 'completed',  // Mark as completed when saving from results
            formData: project.formData || {
              personalInfo: formData.personalInfo,
              industrySettings: formData.industrySettings,
              generationSettings: formData.generationSettings
            },
            generatedText: generatedText, // Save the generated text as well
            modelProvider,
            modelId
          };
        }
        return project;
      });
      
      // Save back to localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Show modal
      setIsSaveModalOpen(true);
      setHasChanges(false);
    } else {
      // Create a new project
      const projectData = {
        id: Date.now(), // Generate a unique ID based on timestamp
        title: projectTitle,
        status: 'completed',
        lastEdited: new Date().toLocaleDateString(),
        description: '自我介紹專案',
        formData: {
          personalInfo: formData.personalInfo,
          industrySettings: formData.industrySettings,
          generationSettings: formData.generationSettings
        },
        generatedText: generatedText, // Save the generated text as well
        modelProvider,
        modelId
      };
      
      // Add the new project to the array
      projects.push(projectData);
      
      // Save back to localStorage
      localStorage.setItem('projects', JSON.stringify(projects));
      
      // Show modal
      setIsSaveModalOpen(true);
      setHasChanges(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || '自我介紹'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    generateIntroduction();
  };

  const handleEdit = () => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    navigate(projectId ? `/profile?id=${projectId}` : '/profile');
  };

  const handleFeedback = (isPositive: boolean) => {
    // In a real app, you might want to send this feedback to your backend
    console.log(`User feedback: ${isPositive ? 'Positive' : 'Negative'}`);
    setFeedbackGiven(true);
    setTimeout(() => setFeedbackGiven(false), 3000);
  };

  // Calculate approximate token count from generated text
  const getApproximateTokenCount = (text: string) => {
    // A very rough estimation: 1 token ≈ 4 characters in English, might vary for other languages
    return Math.ceil(text.length / 4);
  };

  // 計算返回按鈕的目標路徑
  const backToFormUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    return projectId ? `/profile?id=${projectId}` : '/profile';
  }, [location.search]);

  // Load generation record data
  const loadGenerationRecord = (record: GenerationRecord) => {
    setGeneratedText(record.generatedText);
    setActualPrompt(record.actualPrompt);
    setFormData(record.formData);
    setProjectId(record.projectId);
    setEstimatedCost(record.estimatedCost);
    
    // Try to get the actual project title from localStorage if available
    if (record.projectId) {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          const project = projects.find((p: any) => p.id.toString() === String(record.projectId));
          if (project && project.title) {
            setProjectTitle(project.title);
          } else {
            // Fall back to the record's project title if no match found
            setProjectTitle(record.projectTitle);
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
          setProjectTitle(record.projectTitle);
        }
      } else {
        setProjectTitle(record.projectTitle);
      }
    } else {
      setProjectTitle(record.projectTitle);
    }
    
    setIsLoading(false);
  };

  // Handle selecting a record from history
  const handleSelectHistoryRecord = (record: GenerationRecord) => {
    loadGenerationRecord(record);
    setShowHistoryModal(false);
    // Update URL to include record ID
    navigate(`/result?record=${record.id}`);
  };

  // Render info section including prompt and cost
  const renderDetailedInfo = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 space-y-3">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
          <span>自我介紹已使用 <span className="font-semibold">{selectedModel.name}</span> 模型生成</span>
        </div>
        <div>
          <p className="font-medium mb-1">估算資訊：</p>
          <div className="pl-2 border-l-2 border-gray-200">
            <p>使用字數: {generatedText.length} 字</p>
            <p>估算 Token: {getApproximateTokenCount(generatedText)}</p>
            <p>估算成本: ${estimatedCost.toFixed(6)} USD</p>
          </div>
        </div>
        <div>
          <Link to="/history" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
            <span>查看生成歷史記錄</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  // Add this in the JSX where the action buttons are (like save, copy, etc.)
  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        onClick={handleCopyToClipboard}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faCopy} className="mr-2" />
        {copySuccess ? '已複製' : '複製到剪貼簿'}
      </button>
      
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        下載文本檔
      </button>
      
      <button
        onClick={handleRegenerate}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faRedo} className="mr-2" />
        重新生成
      </button>
      
      <button
        onClick={handleEdit}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        編輯設定
      </button>
      
      {/* <button
        onClick={() => setShowHistoryModal(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faHistory} className="mr-2" />
        生成歷史
      </button> */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link 
              to={backToFormUrl}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              返回表單
            </Link>
            <div className="flex items-center">
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 mr-2 flex items-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faRedo} className="mr-2" />
                重新生成
              </button>
              <button 
                onClick={handleEdit}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                編輯表單
              </button>
            </div>
          </div>
          
          {/* Project title input */}
          <div className="mb-6 w-full sm:w-2/3 lg:w-1/2">
            <div className={`relative rounded-lg border ${titleError ? 'border-red-500' : 'border-gray-300'} shadow-sm`}>
              <input
                type="text"
                value={projectTitle}
                onChange={handleProjectTitleChange}
                placeholder="專案名稱"
                ref={saveInputRef}
                className={`w-full px-4 py-2 rounded-lg ${titleError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              {titleError && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
                </div>
              )}
            </div>
            {titleError && <p className="mt-1 text-sm text-red-500">請輸入專案名稱</p>}
          </div>
          
          {/* Display detailed info panel */}
          {generatedText && !error && renderDetailedInfo()}
          
          {/* Result display */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">生成的自我介紹</h2>
            
            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">正在生成自我介紹，請稍候...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">生成失敗</p>
                <p>{error}</p>
              </div>
            ) : generatedText ? (
              <div>
                <pre className="whitespace-pre-wrap border border-gray-200 rounded-lg p-4 text-gray-700 bg-gray-50 text-base font-sans">
                  {generatedText}
                </pre>
                
                {/* Action Buttons */}
                {renderActionButtons()}
              </div>
            ) : (
              <p className="text-gray-600">無法生成自我介紹，請檢查您的API Key設定和表單資料。</p>
            )}
          </div>
        
          {/* Feedback section */}
          {generatedText && !error && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">這個自我介紹對您有幫助嗎？</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackGiven}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    feedbackGiven ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
                  有幫助
                </button>
                <button 
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackGiven}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    feedbackGiven ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faThumbsDown} className="mr-2" />
                  需要改進
                </button>
              </div>
              {feedbackGiven && (
                <p className="mt-2 text-green-600 flex items-center">
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  感謝您的反饋！
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* History Modal */}
      <Modal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)}
        title="生成歷史記錄"
      >
        <GenerationHistory onSelectRecord={handleSelectHistoryRecord} />
      </Modal>
      
      {/* Save Modal */}
      <Modal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)}
        title="儲存自我介紹專案"
      >
        <div className="p-4">
          <label htmlFor="project_title" className="block text-sm font-medium text-gray-700 mb-2">
            專案名稱
          </label>
          <input
            type="text"
            id="project_title_save"
            ref={saveInputRef}
            value={projectTitle}
            onChange={handleProjectTitleChange}
            className={`block w-full px-3 py-2 border ${titleError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="請輸入專案名稱"
          />
          {titleError && (
            <p className="mt-1 text-sm text-red-600">請輸入專案名稱</p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={titleError}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${titleError ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              儲存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Result; 