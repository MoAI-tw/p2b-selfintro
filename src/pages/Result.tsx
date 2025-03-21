import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormContext, GenerationRecord } from '../context/FormContext';
import { useApiKey } from '../context/ApiKeyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy, faDownload, faRedo, faEdit, faThumbsUp, faThumbsDown, faSave, faTimes, faCheck, faExclamationCircle, faHistory, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { generateSelfIntroduction } from '../utils/modelService';
import Modal from '../components/Modal';
import GenerationHistory from '../components/GenerationHistory';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formData, 
    setFormData, 
    addGenerationRecord,
    getGenerationRecords,
    getGenerationRecordById,
    getStoredGenerationResult,
    isGenerationResultStored,
    clearStoredGenerationResult,
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
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // 用於追蹤初始化是否已完成
  const isInitialized = useRef(false);
  
  // 記錄 sessionStorage 狀態的函數
  const logSessionStorageState = () => {
    console.log('[RESULT] 檢查 sessionStorage 狀態');
    try {
      // 列出所有 sessionStorage keys
      const keys = Object.keys(sessionStorage);
      console.log('[RESULT] sessionStorage keys:', keys);
      
      // 檢查是否有 currentGenerationResult
      const hasGenerationResult = sessionStorage.getItem('currentGenerationResult') !== null;
      console.log('[RESULT] currentGenerationResult 存在:', hasGenerationResult);
      
      if (hasGenerationResult) {
        const storedValue = sessionStorage.getItem('currentGenerationResult');
        console.log('[RESULT] currentGenerationResult 長度:', storedValue?.length || 0);
        
        try {
          const parsed = JSON.parse(storedValue || '{}');
          console.log('[RESULT] currentGenerationResult 內容摘要:', {
            hasText: !!parsed.text,
            textLength: parsed.text?.length || 0,
            projectTitle: parsed.projectTitle,
            timestamp: parsed.timestamp,
            modelProvider: parsed.modelProvider
          });
        } catch (parseError) {
          console.error('[RESULT] 解析 currentGenerationResult 失敗:', parseError);
        }
      }
    } catch (error) {
      console.error('[RESULT] 檢查 sessionStorage 時發生錯誤:', error);
    }
  };
  
  // 初始化頁面
  useEffect(() => {
    console.log('[RESULT] 組件載入');
    logSessionStorageState();
    
    // 如果已經初始化過，則退出
    if (isInitialized.current) {
      console.log('[RESULT] 組件已經初始化過，跳過重複初始化');
      return;
    }
    
    const searchParams = new URLSearchParams(location.search);
    
    // 1. 首先檢查是否從歷史記錄載入
    const recordId = searchParams.get('record');
    if (recordId) {
      setHistoryRecordId(recordId);
      const record = getGenerationRecordById(recordId);
      if (record) {
        loadFromHistoryRecord(record);
        isInitialized.current = true;
        return; // 從歷史記錄載入後不需進行其他初始化
      }
    }
    
    // 2. 接著從 URL 獲取專案基本資訊
    const nameFromUrl = searchParams.get('project_name');
    const idFromUrl = searchParams.get('id');
    
    if (nameFromUrl) {
      setProjectTitle(nameFromUrl);
    }
    
    if (idFromUrl) {
      setProjectId(idFromUrl);
      
      // 從 localStorage 載入專案資料
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          const project = projects.find((p: any) => p.id.toString() === idFromUrl);
          if (project) {
            // 更新專案標題（如果 URL 中沒有指定）
            if (!nameFromUrl) {
              setProjectTitle(project.title);
            }
            
            // 載入專案的表單資料
            if (project.formData) {
              setFormData(project.formData);
            }
          }
        } catch (error) {
          console.error('解析專案資料時發生錯誤:', error);
        }
      }
    }
    
    // 3. 最後，嘗試從暫存中獲取生成結果
    if (isGenerationResultStored()) {
      console.log('[RESULT] 發現暫存的生成結果');
      const storedResult = getStoredGenerationResult();
      if (storedResult) {
        console.log('[RESULT] 成功獲取暫存的生成結果', {
          textLength: storedResult.text.length,
          projectTitle: storedResult.projectTitle,
          projectId: storedResult.projectId,
          timestamp: storedResult.timestamp
        });
        
        // 設定生成結果相關資訊
        setGeneratedText(storedResult.text);
        setActualPrompt(storedResult.prompt);
        setEstimatedCost(storedResult.estimatedCost);
        
        // 如有必要，更新專案資訊
        if (!nameFromUrl && storedResult.projectTitle) {
          console.log('[RESULT] 使用暫存結果的專案標題:', storedResult.projectTitle);
          setProjectTitle(storedResult.projectTitle);
        }
        
        if (!idFromUrl && storedResult.projectId) {
          console.log('[RESULT] 使用暫存結果的專案ID:', storedResult.projectId);
          setProjectId(storedResult.projectId);
        }
        
        // 記錄到生成歷史
        const currentProjectId = idFromUrl || (storedResult.projectId ? String(storedResult.projectId) : '');
        console.log('[RESULT] 添加生成記錄', {
          projectId: currentProjectId,
          projectTitle: storedResult.projectTitle,
          modelProvider: storedResult.modelProvider,
          modelId: storedResult.modelId
        });
        
        addGenerationRecord({
          projectId: currentProjectId,
          projectTitle: storedResult.projectTitle,
          formData: { ...formData },
          generatedText: storedResult.text,
          modelProvider,
          modelId,
          estimatedTokens: storedResult.estimatedTokens,
          estimatedCost: storedResult.estimatedCost,
          promptTemplate: formData.generationSettings.promptTemplate,
          actualPrompt: storedResult.prompt
        });
        
        // 清除暫存，避免重複添加記錄
        console.log('[RESULT] 清除暫存的生成結果，避免重複添加記錄');
        clearStoredGenerationResult();
        setIsLoading(false);
      } else {
        console.error('[RESULT] 生成結果解析失敗');
        setError('生成結果解析失敗');
        setIsLoading(false);
      }
    } else {
      console.warn('[RESULT] 未找到暫存的生成結果');
      // 如果沒有暫存結果，則顯示錯誤訊息
      setError('未找到生成結果。請返回設置頁面生成自我介紹。');
      setIsLoading(false);
    }
    
    // 標記初始化已完成
    isInitialized.current = true;
  }, []);
  
  // 驗證專案標題
  useEffect(() => {
    setTitleError(projectTitle.trim() === '');
  }, [projectTitle]);
  
  // 從歷史記錄載入
  const loadFromHistoryRecord = (record: GenerationRecord) => {
    // 設定生成結果
    setGeneratedText(record.generatedText);
    setActualPrompt(record.actualPrompt);
    setFormData(record.formData);
    setProjectId(record.projectId);
    setEstimatedCost(record.estimatedCost);
    
    // 設定專案標題
    if (record.projectId) {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          const project = projects.find((p: any) => p.id.toString() === String(record.projectId));
          if (project && project.title) {
            setProjectTitle(project.title);
          } else {
            setProjectTitle(record.projectTitle);
          }
        } catch (error) {
          console.error('解析專案資料時發生錯誤:', error);
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
  
  // 計算近似 token 數量
  const getApproximateTokenCount = (text: string) => {
    return Math.ceil(text.length / 4);
  };
  
  // 計算成本估算
  const calculateCost = (tokens: number, provider: string, model: string): number => {
    if (provider === 'openai') {
      if (model.includes('gpt-4')) {
        return tokens * 0.00003; // GPT-4 估算價格
      } else {
        return tokens * 0.000002; // GPT-3.5 估算價格
      }
    } else if (provider === 'gemini') {
      return tokens * 0.0000005; // Gemini 估算價格
    }
    return 0;
  };
  
  // 重新生成
  const handleRegenerate = async () => {
    // 檢查 API Key 有效性
    const currentApiKey = modelProvider === 'openai' ? apiKey : geminiApiKey;
    if (!currentApiKey) {
      setError(`${modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API Key 未設定。請設定 API Key 後再嘗試。`);
      return;
    }
    
    // 設定狀態
    setIsLoading(true);
    setError('');
    setIsRegenerating(true);
    
    try {
      // 生成自我介紹
      const result = await generateSelfIntroduction(
        formData,
        modelProvider,
        currentApiKey,
        modelId
      );
      
      if (result.error) {
        setError(result.error);
      } else if (result.content) {
        // 更新 UI
        setGeneratedText(result.content);
        if (result.prompt) {
          setActualPrompt(result.prompt);
        }
        
        // 計算成本
        const tokens = getApproximateTokenCount(result.content);
        const cost = calculateCost(tokens, modelProvider, modelId);
        setEstimatedCost(cost);
        
        // 暫存結果
        storeGenerationResult({
          text: result.content,
          prompt: result.prompt || '',
          projectTitle: projectTitle,
          projectId: typeof projectId === 'string' ? projectId : String(projectId),
          modelProvider,
          modelId,
          estimatedTokens: tokens,
          estimatedCost: cost
        });
        
        // 添加生成記錄
        addGenerationRecord({
          projectId: typeof projectId === 'string' ? projectId : String(projectId),
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
      setIsRegenerating(false);
    }
  };
  
  // 處理專案標題變更
  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProjectTitle(newTitle);
    setTitleError(newTitle.trim() === '');
    setHasChanges(true);
  };
  
  // 處理專案儲存
  const handleSave = () => {
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }
    
    // 取得現有專案
    const storedProjects = localStorage.getItem('projects');
    let projects = [];
    
    if (storedProjects) {
      projects = JSON.parse(storedProjects);
    }
    
    // 檢查是否編輯現有專案
    const searchParams = new URLSearchParams(location.search);
    const currentProjectId = searchParams.get('id');
    let existingProject = null;
    
    if (currentProjectId) {
      existingProject = projects.find((project: { id: number }) => project.id.toString() === currentProjectId);
    }
    
    if (existingProject) {
      // 更新現有專案
      const updatedProjects = projects.map((project: any) => {
        if (project.id.toString() === currentProjectId) {
          return {
            ...project,
            title: projectTitle,
            lastEdited: new Date().toLocaleDateString(),
            status: 'completed',
            formData: project.formData || {
              personalInfo: formData.personalInfo,
              industrySettings: formData.industrySettings,
              generationSettings: formData.generationSettings
            },
            generatedText: generatedText,
            modelProvider,
            modelId
          };
        }
        return project;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setIsSaveModalOpen(true);
      setHasChanges(false);
    } else {
      // 建立新專案
      const projectData = {
        id: Date.now(),
        title: projectTitle,
        status: 'completed',
        lastEdited: new Date().toLocaleDateString(),
        description: '自我介紹專案',
        formData: {
          personalInfo: formData.personalInfo,
          industrySettings: formData.industrySettings,
          generationSettings: formData.generationSettings
        },
        generatedText: generatedText,
        modelProvider,
        modelId
      };
      
      projects.push(projectData);
      localStorage.setItem('projects', JSON.stringify(projects));
      setIsSaveModalOpen(true);
      setHasChanges(false);
    }
  };
  
  // 複製到剪貼簿
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  // 下載文字檔
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
  
  // 導航到編輯頁面
  const handleEdit = () => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    navigate(projectId ? `/profile?id=${projectId}` : '/profile');
  };
  
  // 提交使用者回饋
  const handleFeedback = (isPositive: boolean) => {
    console.log(`User feedback: ${isPositive ? 'Positive' : 'Negative'}`);
    setFeedbackGiven(true);
    setTimeout(() => setFeedbackGiven(false), 3000);
  };
  
  // 計算返回按鈕的目標路徑
  const backToFormUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    return projectId ? `/profile?id=${projectId}` : '/profile';
  }, [location.search]);
  
  // 從歷史記錄選擇
  const handleSelectHistoryRecord = (record: GenerationRecord) => {
    loadFromHistoryRecord(record);
    setShowHistoryModal(false);
    // 更新 URL 以包含記錄 ID
    navigate(`/result?record=${record.id}`);
  };
  
  // 渲染詳細資訊區塊
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
  
  // 渲染操作按鈕
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
        disabled={isLoading || isRegenerating}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <FontAwesomeIcon icon={isRegenerating ? faSpinner : faRedo} className={`mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
        {isRegenerating ? '生成中...' : '重新生成'}
      </button>
      
      <button
        onClick={handleEdit}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        編輯設定
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* 頂部導航欄 */}
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
                disabled={isLoading || isRegenerating}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 mr-2 flex items-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={isRegenerating ? faSpinner : faRedo} className={`mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? '生成中...' : '重新生成'}
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
          
          {/* 專案標題輸入 */}
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
          
          {/* 顯示詳細資訊面板 */}
          {generatedText && !error && renderDetailedInfo()}
          
          {/* 結果顯示 */}
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
                
                {/* 操作按鈕 */}
                {renderActionButtons()}
              </div>
            ) : (
              <p className="text-gray-600">無法生成自我介紹，請檢查您的API Key設定和表單資料。</p>
            )}
          </div>
        
          {/* 回饋部分 */}
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
      
      {/* 歷史記錄彈窗 */}
      <Modal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)}
        title="生成歷史記錄"
      >
        <GenerationHistory onSelectRecord={handleSelectHistoryRecord} />
      </Modal>
      
      {/* 儲存彈窗 */}
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