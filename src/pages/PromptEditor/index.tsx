import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../context/FormContext';
import { useApiKey } from '../../context/ApiKeyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faInfoCircle, faEdit, faArrowLeft, faCheck, faFlask, faTimes, faCog, faDice, faCopy } from '@fortawesome/free-solid-svg-icons';
import { generateSelfIntroduction } from '../../utils/modelService';
import { ModelProvider } from '../../context/ApiKeyContext';
import ApiSettings from '../../components/ApiKeySettings';
import { jobPositions } from '../../data/jobPositions';
import { departments } from '../../data/departments';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  systemPrompt?: string;
}

const PromptEditor: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateGenerationSettings, getPromptTemplatesList, addPromptTemplate, updatePromptTemplate, deletePromptTemplate, setActivePromptId } = useFormContext();
  const { apiKey, geminiApiKey, modelProvider, selectedModel, maxTokens } = useApiKey();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSystemHelp, setShowSystemHelp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [showTestResult, setShowTestResult] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [processedPrompt, setProcessedPrompt] = useState<string>('');
  const [testData, setTestData] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 從 FormContext 加載模板
  useEffect(() => {
    // 使用新的方法獲取模板列表
    const contextTemplates = getPromptTemplatesList();
    
    setTemplates(contextTemplates);
    
    // 設置當前選中的模板
    const selectedTemplateId = formData.generationSettings.activePromptId;
    const selectedTemplate = contextTemplates.find(t => t.id === selectedTemplateId);
    
    if (selectedTemplate) {
      setCurrentTemplate(selectedTemplate);
    } else if (contextTemplates.length > 0) {
      setCurrentTemplate(contextTemplates[0]);
    }
  }, [formData.generationSettings, getPromptTemplatesList]);

  // 保存更新後的模板
  const saveTemplates = (updatedTemplates: PromptTemplate[]) => {
    setTemplates(updatedTemplates);
    
    // 已經不需要顯式保存，因為各個方法會自動保存
    
    // 顯示成功提示
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(false);
  };

  const handleCreateTemplate = () => {
    const newTemplate: Omit<PromptTemplate, 'id'> = {
      name: '新模板',
      description: '請添加描述',
      content: '請根據以下信息生成一份專業的自我介紹，時間約為{duration}秒，語言為{language}，風格為{style}，重點突出{keywords}。自我介紹應包含個人背景、教育經歷、專業技能和工作經驗，特別強調與{industry}行業和{job_position}職位相關的能力和經驗。',
      systemPrompt: '你是一位專業的自我介紹顧問，請根據用戶提供的信息，幫助生成一份有說服力的自我介紹。'
    };
    
    // 使用新的方法添加模板
    const newId = addPromptTemplate(newTemplate);
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 設置新創建的模板為當前模板
    const createdTemplate = updatedTemplates.find(t => t.id === newId);
    if (createdTemplate) {
      setCurrentTemplate(createdTemplate);
      setIsEditing(true);
    }
  };

  const handleUpdateTemplate = () => {
    if (!currentTemplate) return;
    
    // 使用新的方法更新模板
    updatePromptTemplate(currentTemplate.id, {
      name: currentTemplate.name,
      description: currentTemplate.description,
      content: currentTemplate.content,
      systemPrompt: currentTemplate.systemPrompt
    });
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 如果更新的是當前選中的模板，同時更新 activePromptId
    if (currentTemplate.id === formData.generationSettings.activePromptId) {
      // 這部分在 updatePromptTemplate 方法中已經處理了
      setActivePromptId(currentTemplate.id);
    }
    
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    // 確認刪除
    if (!window.confirm('確定要刪除這個模板嗎？此操作無法撤銷。')) {
      return;
    }
    
    // 使用新的方法刪除模板
    deletePromptTemplate(id);
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 如果刪除的是當前選中的模板，則選中第一個模板
    if (currentTemplate?.id === id) {
      if (updatedTemplates.length > 0) {
        setCurrentTemplate(updatedTemplates[0]);
      } else {
        setCurrentTemplate(null);
      }
    }
    
    setIsEditing(false);
  };

  const handleUseTemplate = () => {
    if (!currentTemplate) return;
    
    // 使用新的方法設置當前模板
    setActivePromptId(currentTemplate.id);
    
    // 顯示成功提示
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  const handleOpenApiSettings = () => {
    setShowApiSettings(true);
  };

  const handleCloseApiSettings = () => {
    setShowApiSettings(false);
  };

  // 生成隨機測試資料
  const generateRandomTestData = () => {
    const industries = ['軟體開發', '金融服務', '數位行銷', '教育科技', '電子商務', '人工智慧', '物聯網', '雲端服務'];
    const schools = ['台灣大學', '清華大學', '交通大學', '成功大學', '政治大學', '台北科技大學'];
    const companies = [
      '台積電', 'Google Taiwan', 'Microsoft Taiwan', 'LINE Taiwan', 'TSMC', 
      'MediaTek', 'Appier', 'Shopee', 'ASUS', 'Garena'
    ];
    const skills = [
      // 專業技能
      'Microsoft Office', 'Google Workspace', 'Adobe Creative Suite', 'AutoCAD', 'Photoshop',
      'Excel進階技巧', 'PowerPoint簡報製作', 'Word文書處理', '資料分析', '專案管理',
      'CRM系統操作', 'ERP系統使用', '財務分析', '市場分析', '社群媒體經營',
      
      // 數位技能
      '網頁管理', '基礎程式設計', '數位行銷', '影片剪輯', '電子商務',
      '數據分析', '雲端服務應用', '資訊安全概念', '人工智慧應用',
      
      // 語言能力
      '英語聽說讀寫', '日語會話', '中英文口譯', '商業英文寫作', '英語簡報',
      '日語N1', '韓語中級', '英語商務溝通', 'TOEIC 900分以上',
      
      // 軟實力
      '團隊合作', '溝通協調', '問題解決', '時間管理', '領導能力',
      '創新思維', '抗壓性高', '適應力強', '客戶服務', '談判技巧',
      '跨部門協作', '危機處理', '決策分析', '教育訓練', '績效管理',
      
      // 產業知識
      '市場趨勢分析', '產業生態理解', '供應鏈管理', '品質管理', '顧客關係管理',
      '成本控制', '風險評估', '法規遵循', '永續發展', '國際貿易實務'
    ];
    const names = [
      '王小明', '李小華', '張小美', '陳大寶', '林小玉',
      '黃小龍', '吳小芳', '劉小雨', '周小天', '楊小雲'
    ];
    
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomItems = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    const randomYear = () => 2010 + Math.floor(Math.random() * 14);
    
    // 生成隨機年齡 (22-45歲之間)
    const randomAge = () => 22 + Math.floor(Math.random() * 24);
    
    // 根據隨機年齡計算對應的出生年份
    const calculateBirthday = (age: number) => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - age;
      return `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    };
    
    // 從完整的職位列表中隨機選擇
    const selectedPosition = randomItem(jobPositions);
    
    const age = randomAge();
    
    return {
      personalInfo: {
        name: randomItem(names),
        age: age,
        birthday: calculateBirthday(age),
        education: [{
          school: randomItem(schools),
          degree: '碩士',
          major: randomItem(departments),  // 使用 departments 列表
          graduationYear: randomYear().toString()
        }],
        workExperience: [{
          company: randomItem(companies),
          position: selectedPosition,
          startDate: '2020-01',
          endDate: '2023-12',
          isCurrent: true,
          description: '負責產品開發與維護'
        }],
        skills: randomItems(skills, 3 + Math.floor(Math.random() * 3)).map(name => ({ name, level: '熟練' })),
        projects: '開發團隊協作平台、建置自動化測試系統',
        awards: '最佳創新獎',
        interests: '技術研究、團隊合作'
      },
      industrySettings: {
        industry: randomItem(industries),
        specificPosition: randomItem(jobPositions),
        keywords: randomItems(['團隊合作', '問題解決', '創新思維', '溝通能力', '領導能力', '專案管理', '敏捷開發', '系統設計'], 3)
      },
      generationSettings: {
        duration: '60',
        language: 'Chinese',
        style: 'professional',
        tone: 'Professional',
        outputLength: 'Medium'
      }
    };
  };

  // 處理提示詞模板和生成
  const processTemplateAndGenerate = async (shouldGenerate: boolean = false) => {
    if (!currentTemplate) return;
    
    // 生成隨機測試資料
    const newTestData = generateRandomTestData();
    setTestData(newTestData);
    
    // 處理提示詞模板
    const processedTemplate = processPromptTemplate(currentTemplate.content, newTestData);
    setProcessedPrompt(processedTemplate);
    
    // 設定視窗狀態
    setShowTestResult(true);
    setTestResult('');

    // 如果需要生成，則執行生成流程
    if (shouldGenerate) {
      setIsTestLoading(true);
      
      try {
        // 準備生成設定，使用當前模板的系統提示詞
        const genSettings = {
          ...formData.generationSettings,
          promptTemplate: currentTemplate.content,
          systemPrompt: currentTemplate.systemPrompt // 使用當前模板的系統提示詞
        };

        // console log out systemPrompt
        console.log('systemPrompt', currentTemplate.systemPrompt);
        // 調用 LLM 生成
        const result = await generateSelfIntroduction(
          {
            formData: {
              ...formData,
              personalInfo: newTestData.personalInfo,
              industrySettings: newTestData.industrySettings,
              generationSettings: genSettings // 使用包含當前系統提示詞的設定
            },
            apiKey,
            selectedModel: selectedModel.id,
            maxTokens
          },
          modelProvider as ModelProvider
        );
        
        if (result.error) {
          setTestResult(`測試時發生錯誤: ${result.error}`);
        } else if (result.data) {
          setTestResult(result.data);
        } else {
          setTestResult('生成結果格式錯誤');
        }
      } catch (error) {
        setTestResult(`測試時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
      } finally {
        setIsTestLoading(false);
      }
    }
  };

  // 處理測試按鈕點擊
  const handleTestTemplate = () => {
    processTemplateAndGenerate(false);
  };

  // 處理重新生成隨機資料
  const handleRegenerateTestData = () => {
    processTemplateAndGenerate(false);
  };

  // 處理實際生成
  const handleGenerate = async () => {
    if (!currentTemplate || !testData) return;
    await processTemplateAndGenerate(true);
  };

  // 處理提示詞模板變數替換
  const processPromptTemplate = (template: string, data: any) => {
    let processed = template;
    
    // 替換基本資訊
    const { personalInfo, industrySettings, generationSettings } = data;
    
    // 處理個人資訊
    processed = processed.replace('{name}', personalInfo.name || '');
    processed = processed.replace('{education}', 
      personalInfo.education?.map((edu: any) => 
        `${edu.school} ${edu.degree} ${edu.major}`
      ).join(', ') || ''
    );
    processed = processed.replace('{experience}',
      personalInfo.workExperience?.map((exp: any) =>
        `${exp.company} ${exp.position}`
      ).join(', ') || ''
    );
    processed = processed.replace('{skills}',
      personalInfo.skills?.map((skill: any) => skill.name).join(', ') || ''
    );
    
    // 處理行業設定
    processed = processed.replace('{industry}', industrySettings.industry || '');
    processed = processed.replace('{job_position}', industrySettings.specificPosition || '');
    processed = processed.replace('{keywords}', industrySettings.keywords?.join(', ') || '');
    
    // 處理生成設定
    processed = processed.replace('{duration}', generationSettings.duration || '');
    processed = processed.replace('{language}', generationSettings.language || '');
    processed = processed.replace('{style}', generationSettings.style || '');
    processed = processed.replace('{tone}', generationSettings.tone || '');
    
    return processed;
  };

  // Add copyToClipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={handleBackToSettings}
            className="text-gray-600 hover:text-indigo-600 flex items-center mb-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回設定頁面
          </button>
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">提示詞編輯器</h1>
          <p className="text-gray-600">創建和管理自定義提示詞模板，提升自我介紹的品質</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {saveSuccess && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md flex items-center">
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              已成功保存更改
            </div>
          )}
          <button
            onClick={handleOpenApiSettings}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center"
            title="API 設定"
          >
            <FontAwesomeIcon icon={faCog} className="mr-2" />
            API 設定
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Template List */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">提示詞模板</h2>
            <button 
              onClick={handleCreateTemplate}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" /> 新增
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${currentTemplate?.id === template.id ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </div>
                {templates.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
          {currentTemplate ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {isEditing ? '編輯模板' : '模板詳情'}
                </h2>
                <div className="space-x-2">
                  {isEditing ? (
                    <button 
                      onClick={handleUpdateTemplate}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-1" /> 儲存
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> 編輯
                      </button>
                      <button 
                        onClick={handleUseTemplate}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-1" /> 套用
                      </button>
                      <button 
                        onClick={handleTestTemplate}
                        disabled={isTestLoading}
                        className={`bg-purple-600 text-white px-3 py-1 rounded-md transition ${isTestLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                      >
                        <FontAwesomeIcon icon={faFlask} className="mr-1" />
                        {isTestLoading ? '測試中...' : '測試'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱</label>
                  <input
                    type="text"
                    value={currentTemplate.name}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                  <input
                    type="text"
                    value={currentTemplate.description}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">系統提示詞</label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setShowSystemHelp(!showSystemHelp)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} /> 說明
                      </button>
                      <span className="text-xs text-gray-500 ml-2">設定AI的角色與行為</span>
                    </div>
                  </div>
                  <textarea
                    value={currentTemplate.systemPrompt || ''}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, systemPrompt: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md h-24 font-mono"
                    placeholder="添加系統提示詞，例如：你是一位專業的自我介紹顧問，請根據用戶提供的信息，幫助生成一份有說服力的自我介紹。"
                    disabled={!isEditing}
                  />
                  {showSystemHelp && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                      <h3 className="font-medium text-blue-800 mb-2">系統提示詞說明</h3>
                      <p className="text-sm text-blue-700 mb-2">系統提示詞用於設定AI的角色和行為，是對AI的指示而非用戶的提問內容。系統提示詞能讓模型理解它應該扮演的角色和應該如何回應。</p>
                      <ul className="list-disc list-inside text-sm text-blue-700">
                        <li>設定AI的專業領域: 「你是一位專業的履歷顧問、自我介紹專家...」</li>
                        <li>設定AI的風格: 「你的回應應該保持專業、簡潔、有創意...」</li>
                        <li>設定AI的行為規則: 「不要詢問額外問題，直接生成結果...」</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">提示詞模板</label>
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} /> 變數說明
                    </button>
                  </div>
                  <textarea
                    value={currentTemplate.content}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, content: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md h-64 font-mono"
                    disabled={!isEditing}
                  />
                </div>

                {showHelp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h3 className="font-medium text-blue-800 mb-2">可用變數</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <span className="text-blue-700"><code>{'{name}'}</code> - 姓名</span>
                      <span className="text-blue-700"><code>{'{age}'}</code> - 年齡</span>
                      <span className="text-blue-700"><code>{'{location}'}</code> - 所在地</span>
                      <span className="text-blue-700"><code>{'{education}'}</code> - 教育背景</span>
                      <span className="text-blue-700"><code>{'{skills}'}</code> - 技能專長</span>
                      <span className="text-blue-700"><code>{'{experience}'}</code> - 工作經驗</span>
                      <span className="text-blue-700"><code>{'{industry}'}</code> - 目標行業</span>
                      <span className="text-blue-700"><code>{'{job_position}'}</code> - 應徵職位</span>
                      <span className="text-blue-700"><code>{'{language}'}</code> - 語言</span>
                      <span className="text-blue-700"><code>{'{tone}'}</code> - 語調</span>
                      <span className="text-blue-700"><code>{'{length}'}</code> - 長度</span>
                      <span className="text-blue-700"><code>{'{duration}'}</code> - 時間長度</span>
                      <span className="text-blue-700"><code>{'{keywords}'}</code> - 關鍵詞</span>
                      <span className="text-blue-700"><code>{'{focus_areas}'}</code> - 重點領域</span>
                      <span className="text-blue-700"><code>{'{target_audience}'}</code> - 目標讀者</span>
                      <span className="text-blue-700"><code>{'{style}'}</code> - 風格</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Result Modal */}
              {showTestResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-xl font-semibold">測試模板</h3>
                      <button 
                        onClick={() => setShowTestResult(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* 提示詞預覽區域 */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-medium">處理後的提示詞</h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleGenerate}
                              disabled={isTestLoading}
                              className={`
                                px-4 py-1 rounded-md text-white font-medium flex items-center
                                ${isTestLoading 
                                  ? 'bg-purple-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700'}
                              `}
                            >
                              {isTestLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                                  生成中...
                                </>
                              ) : '開始生成'}
                            </button>
                            <button
                              onClick={handleRegenerateTestData}
                              className="text-indigo-600 hover:text-indigo-800 p-1"
                              title="重新生成隨機資料"
                            >
                              <FontAwesomeIcon icon={faDice} className="text-xl" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {currentTemplate?.systemPrompt && (
                              <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-100">
                                <div className="font-medium text-blue-800 mb-1">系統提示詞：</div>
                                {currentTemplate.systemPrompt}
                              </div>
                            )}
                            <div className="p-2">
                              <div className="font-medium mb-1">使用者提示詞：</div>
                              {processedPrompt}
                            </div>
                          </pre>
                        </div>
                      </div>

                      {/* 生成結果區域 */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-medium">生成結果</h4>
                          {testResult && (
                            <button
                              onClick={() => copyToClipboard(testResult)}
                              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                              title="複製到剪貼簿"
                            >
                              <FontAwesomeIcon 
                                icon={copySuccess ? faCheck : faCopy} 
                                className={`mr-1 ${copySuccess ? 'text-green-500' : ''}`}
                              />
                              {copySuccess ? '已複製' : '複製'}
                            </button>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {testResult || '點擊上方按鈕開始生成'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">請選擇或創建一個模板</p>
            </div>
          )}
        </div>
      </div>

      {/* API Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">API 設定</h3>
              <button 
                onClick={handleCloseApiSettings}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-6">
              <ApiSettings onClose={handleCloseApiSettings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor; 