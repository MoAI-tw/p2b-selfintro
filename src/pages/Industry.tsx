import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndustry, faKey, faChartPie, faArrowLeft, faArrowRight, faTimes, faCheckCircle, faPlus, faTrash, faSave, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../components/ProgressBar';
import { useFormContext } from '../context/FormContext';
import Modal from '../components/Modal';
import ApiKeySettings from '../components/ApiKeySettings';
import DraggableModal from '../components/DraggableModal';

// 定義職務類別資料結構
interface JobSubcategories {
  [key: string]: string;
}

interface JobCategory {
  name: string;
  subcategories: JobSubcategories;
}

interface JobCategories {
  [key: string]: JobCategory;
}

// 參考104人力銀行職務分類
const jobCategories: JobCategories = {
  // 經營/人資類
  'management': {
    name: '經營/人資類',
    subcategories: {
      'executive_mgmt': '經營管理主管',
      'human_resource': '人力資源主管',
      'human_resource_staff': '人力資源專員',
      'training_staff': '教育訓練人員',
      'compensation_staff': '人事薪資福利人員',
      'labor_safety': '勞工安全衛生管理',
      'business_admin': '行政主管',
      'admin_staff': '行政人員'
    }
  },
  // 行政/總務/法務類
  'admin': {
    name: '行政/總務/法務類',
    subcategories: {
      'general_affairs': '總務人員',
      'secretary': '秘書',
      'receptionist': '櫃檯接待人員',
      'legal_staff': '法務人員',
      'paralegal': '法務助理',
      'contract_mgmt': '合約管理人員',
      'intellectual_property': '智財人員'
    }
  },
  // 財務/金融專業類
  'finance': {
    name: '財務/金融專業類',
    subcategories: {
      'financial_mgmt': '財務主管',
      'financial_analyst': '財務分析人員',
      'accountant_mgmt': '會計主管',
      'accountant': '會計人員',
      'auditor': '審計/稽核人員',
      'tax_staff': '稅務人員',
      'bank_specialist': '銀行專業人員',
      'security_specialist': '證券專業人員',
      'insurance_specialist': '保險專業人員',
      'investment_mgmt': '投資理財人員',
      'risk_mgmt': '風險管理人員'
    }
  },
  // 行銷/企劃/專案管理類
  'marketing': {
    name: '行銷/企劃/專案管理類',
    subcategories: {
      'marketing_mgmt': '行銷企劃主管',
      'marketing_specialist': '行銷企劃專員',
      'market_research': '市場調查/市場分析',
      'product_planning': '產品企劃開發人員',
      'brand_planning': '品牌行銷人員',
      'project_mgmt': '專案管理主管',
      'project_specialist': '專案管理人員',
      'project_assistant': '專案助理'
    }
  },
  // 客服/門市/業務類
  'sales': {
    name: '客服/門市/業務類',
    subcategories: {
      'sales_mgmt': '業務主管',
      'sales_representative': '業務人員',
      'customer_service_mgmt': '客服主管',
      'customer_service': '客服人員',
      'retail_mgmt': '門市/店員/專櫃人員',
      'auction_staff': '售票/收銀人員',
      'telemarketing': '電話行銷人員',
      'sales_engineer': '業務工程師',
      'international_trade': '國貿人員'
    }
  },
  // 資訊軟體系統類
  'it': {
    name: '資訊軟體系統類',
    subcategories: {
      'it_mgmt': '資訊主管',
      'software_engineer': '軟體工程師',
      'mobile_dev': '手機/APP工程師',
      'web_dev': '網頁前端工程師',
      'database_admin': '資料庫管理人員',
      'network_admin': '網路管理工程師',
      'system_analyst': '系統分析師',
      'system_admin': '系統維護/操作人員',
      'it_support': 'IT技術支援/維修人員',
      'programmer': '程式設計師',
      'qa_engineer': 'MIS/網管人員',
      'data_scientist': '資料科學家',
      'ai_engineer': 'AI工程師'
    }
  },
  // 設計/美術類
  'design': {
    name: '設計/美術類',
    subcategories: {
      'graphic_design': '平面設計師',
      'web_design': '網頁設計師',
      'multimedia_design': '多媒體設計師',
      'product_design': '產品設計師',
      'interior_design': '室內設計師',
      'ui_ux_design': 'UI/UX設計師',
      'industrial_design': '工業設計師',
      'exhibition_design': '展場/展覽設計',
      'fashion_design': '服裝設計師',
      'jewelry_design': '珠寶設計師'
    }
  },
  // 文字/傳媒/藝術類
  'media': {
    name: '文字/傳媒/藝術類',
    subcategories: {
      'editor': '編輯人員',
      'writer': '文字工作者',
      'copywriter': '文案/企劃',
      'journalist': '記者',
      'translator': '翻譯人員',
      'photographer': '攝影師',
      'media_planning': '媒體公關/宣傳',
      'art_designer': '藝術設計',
      'artist': '藝術工作者',
      'broadcasting': '廣播電視製作'
    }
  },
  // 研發/生技/醫療類
  'research': {
    name: '研發/生技/醫療類',
    subcategories: {
      'rd_mgmt': '研發主管',
      'rd_engineer': '研發工程師',
      'biotech': '生技/化工研發人員',
      'pharmaceutical': '醫藥研發人員',
      'clinical_researcher': '臨床研究人員',
      'doctor': '醫師',
      'nurse': '護理師',
      'medical_technician': '醫療技術人員',
      'pharmacist': '藥師',
      'nutritionist': '營養師',
      'psychologist': '心理師',
      'veterinarian': '獸醫/寵物照護'
    }
  },
  // 製造/工程/環保類
  'engineering': {
    name: '製造/工程/環保類',
    subcategories: {
      'production_mgmt': '生產管理主管',
      'production_engineer': '生產技術/製程工程師',
      'quality_control': '品管/檢驗人員',
      'quality_engineer': '品保工程師',
      'mechanical_engineer': '機械工程師',
      'electrical_engineer': '電機工程師',
      'electronic_engineer': '電子工程師',
      'chemical_engineer': '化學工程師',
      'civil_engineer': '土木/結構工程師',
      'environmental_engineer': '環境工程師',
      'industrial_safety': '工業安全衛生',
      'maintenance_engineer': '維修/保養人員'
    }
  },
  // 教育/傳道類
  'education': {
    name: '教育/傳道類',
    subcategories: {
      'professor': '大學教授/講師',
      'teacher': '中小學教師',
      'teaching_assistant': '教學助理',
      'tutor': '補習班/安親班老師',
      'kindergarten': '幼教/托育人員',
      'special_education': '特殊教育教師',
      'educational_admin': '教育行政人員',
      'training_instructor': '教育訓練講師',
      'religious_worker': '宗教/傳道人員'
    }
  },
  // 服務/餐飲/旅遊類
  'service': {
    name: '服務/餐飲/旅遊類',
    subcategories: {
      'chef': '廚師',
      'restaurant_staff': '餐飲服務人員',
      'food_processing': '食品處理人員',
      'tourism_mgmt': '旅遊/休閒管理',
      'tour_guide': '導遊/領隊',
      'flight_attendant': '空服/地勤人員',
      'hotel_staff': '飯店/旅館服務',
      'beautician': '美容/美髮師',
      'cleaning': '清潔維護人員',
      'driver': '司機/車輛駕駛',
      'security': '保全人員'
    }
  },
  // 物流/運輸/操作類
  'logistics': {
    name: '物流/運輸/操作類',
    subcategories: {
      'logistics_mgmt': '物流/運輸主管',
      'logistics_specialist': '物流/運輸專員',
      'inventory_management': '倉儲管理人員',
      'procurement': '採購人員',
      'operation_engineer': '操作/技術人員',
      'delivery': '配送/遞送人員'
    }
  }
};

// 關鍵詞建議的結構
interface KeywordSuggestions {
  [key: string]: string[];
}

// 取得關鍵詞建議
const getKeywordSuggestions = (category: string, subcategory: string): string[] => {
  const commonKeywords = ['團隊合作', '溝通能力', '問題解決', '創新思維', '領導能力', '時間管理', '適應能力', '持續學習'];
  
  // 根據職務類別提供特定關鍵詞
  const specificKeywords: KeywordSuggestions = {
    'it': ['系統開發', '程式設計', '邏輯思考', '技術分析', '專案管理', '系統整合', '除錯能力'],
    'software_engineer': ['程式開發', '軟體架構', '敏捷開發', '代碼優化', '技術文檔', 'API設計'],
    'financial_analyst': ['財務分析', '風險評估', '數據解讀', '財務規劃', '精確性', '商業敏銳度'],
    'marketing_specialist': ['市場分析', '品牌推廣', '廣告策劃', '社群媒體', '內容創作', '數據分析'],
    'sales_representative': ['客戶開發', '銷售技巧', '談判能力', '產品知識', '目標達成', '客戶關係管理'],
    'hr_specialist': ['招聘管理', '員工關係', '績效評估', '培訓發展', '勞資關係', '組織發展'],
    'graphic_design': ['視覺設計', '創意發想', '品牌識別', '排版設計', '色彩運用', '使用者體驗']
  };
  
  // 根據類別返回合適的關鍵詞
  if (specificKeywords[subcategory]) {
    return [...specificKeywords[subcategory], ...commonKeywords];
  } else if (specificKeywords[category]) {
    return [...specificKeywords[category], ...commonKeywords];
  }
  
  return commonKeywords;
};

const Industry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updateIndustrySettings, addKeyword, removeKeyword } = useFormContext();
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [customKeyword, setCustomKeyword] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  
  // Add API Key Modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Define industries data
  const industries: {[key: string]: string} = {
    'tech': '科技業',
    'finance': '金融業',
    'education': '教育產業',
    'healthcare': '醫療保健',
    'manufacturing': '製造業',
    'retail': '零售業',
    'services': '服務業',
    'media': '媒體與娛樂',
    'construction': '建築與工程',
    'transportation': '運輸與物流',
    'hospitality': '餐飲與旅遊',
    'government': '政府與公部門',
    'nonprofit': '非營利組織',
    'agriculture': '農業與食品',
    'energy': '能源與環保',
    'telecom': '電信業',
    'realestate': '房地產',
    'other': '其他行業'
  };
  
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
            if (project.formData && project.formData.industrySettings) {
              updateIndustrySettings(project.formData.industrySettings);
            }
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
        }
      }
    }
  }, [location, updateIndustrySettings]);

  // Track changes to enable/disable save button
  useEffect(() => {
    setHasChanges(true);
  }, [formData.industrySettings, projectTitle]);

  // Validate project title when it changes
  useEffect(() => {
    setTitleError(projectTitle.trim() === '');
  }, [projectTitle]);

  // 初始化或更新建議關鍵詞
  useEffect(() => {
    if (formData.industrySettings.jobCategory && formData.industrySettings.jobSubcategory) {
      const keywords = getKeywordSuggestions(
        formData.industrySettings.jobCategory,
        formData.industrySettings.jobSubcategory
      );
      setSuggestedKeywords(keywords);
    }
  }, [formData.industrySettings.jobCategory, formData.industrySettings.jobSubcategory]);

  // 處理添加關鍵詞
  const handleAddKeyword = (keyword: string) => {
    if (keyword && !formData.industrySettings.keywords.includes(keyword)) {
      addKeyword(keyword);
      setNewKeyword('');
    }
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
        generationSettings: formData.generationSettings
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

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }
    
    // Validate required fields
    const requiredFieldsErrors = [];
    
    // Check industry settings
    if (!formData.industrySettings.industry) {
      requiredFieldsErrors.push('行業類別');
    }
    
    if (!formData.industrySettings.jobCategory) {
      requiredFieldsErrors.push('職務類別');
    }
    
    if (formData.industrySettings.jobCategory && !formData.industrySettings.jobSubcategory) {
      requiredFieldsErrors.push('職務子類別');
    }
    
    if (!formData.industrySettings.specificPosition || formData.industrySettings.specificPosition.trim() === '') {
      requiredFieldsErrors.push('特定職位');
    }
    
    if (formData.industrySettings.keywords.length === 0) {
      requiredFieldsErrors.push('至少添加一個關鍵字');
    }
    
    // If there are validation errors, show them and prevent navigation
    if (requiredFieldsErrors.length > 0) {
      // Set validation errors
      setValidationErrors(requiredFieldsErrors);
      // Show validation error modal
      setShowValidationErrorModal(true);
      return;
    }
    
    navigate(`/settings?project_name=${encodeURIComponent(projectTitle)}`);
  };

  // 取得所選類別的子類別
  const getSubcategories = (): JobSubcategories => {
    if (formData.industrySettings.jobCategory && jobCategories[formData.industrySettings.jobCategory]) {
      return jobCategories[formData.industrySettings.jobCategory].subcategories;
    }
    return {};
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
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

      <ProgressBar currentStep={2} projectName={projectTitle} />

      {/* 主要內容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">產業和職位設置</h1>
          <p className="text-gray-600 mb-8">請選擇您想要應徵的產業和職位，以生成更具針對性的自我介紹</p>
          
          <form onSubmit={handleSubmit}>
            {/* 產業選擇 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faIndustry} className="text-indigo-600 mr-2" />選擇職務類別
              </h2>
              <div className="mb-6">
                <label htmlFor="industry" className="block text-gray-700 font-medium mb-2">
                  行業類別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="industry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.industrySettings.industry || ''}
                  onChange={(e) => updateIndustrySettings({ industry: e.target.value })}
                  required
                >
                  <option value="">請選擇行業類別</option>
                  {Object.keys(industries).map((industryId) => (
                    <option key={industryId} value={industryId}>
                      {industries[industryId]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="jobCategory" className="block text-gray-700 font-medium mb-2">
                  職務類別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobCategory"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.industrySettings.jobCategory || ''}
                  onChange={(e) => updateIndustrySettings({ jobCategory: e.target.value, jobSubcategory: '' })}
                  required
                >
                  <option value="">請選擇職務類別</option>
                  {Object.keys(jobCategories).map((categoryId) => (
                    <option key={categoryId} value={categoryId}>
                      {jobCategories[categoryId].name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="jobSubcategory" className="block text-gray-700 font-medium mb-2">
                  職務子類別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="jobSubcategory"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.industrySettings.jobSubcategory || ''}
                  onChange={(e) => updateIndustrySettings({ jobSubcategory: e.target.value })}
                  disabled={!formData.industrySettings.jobCategory}
                  required
                >
                  <option value="">請選擇職務子類別</option>
                  {Object.keys(getSubcategories()).map((subcategoryId) => (
                    <option key={subcategoryId} value={subcategoryId}>
                      {getSubcategories()[subcategoryId]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="specificPosition" className="block text-gray-700 font-medium mb-2">
                  特定職位 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specificPosition"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：前端工程師、行銷專員"
                  value={formData.industrySettings.specificPosition || ''}
                  onChange={(e) => updateIndustrySettings({ specificPosition: e.target.value })}
                  required
                />
              </div>
            </div>
            
            {/* 關鍵詞設定 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faKey} className="text-indigo-600 mr-2" />關鍵詞設定
              </h2>
              <p className="text-gray-600 mb-4">您可以添加職位相關的關鍵詞，系統會自動將這些關鍵詞融入自我介紹中</p>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">已選擇的關鍵詞</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[60px]">
                  {formData.industrySettings.keywords.length > 0 ? (
                    formData.industrySettings.keywords.map((keyword: string) => (
                      <div key={keyword} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm">
                        {keyword}
                        <button 
                          type="button"
                          onClick={() => removeKeyword(keyword)} 
                          className="ml-2 text-indigo-500 hover:text-indigo-700"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">尚未選擇任何關鍵詞</p>
                  )}
                </div>
              </div>
              
              {/* 建議關鍵詞 */}
              {suggestedKeywords.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">建議關鍵詞</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedKeywords.map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleAddKeyword(keyword)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          formData.industrySettings.keywords.includes(keyword)
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                        disabled={formData.industrySettings.keywords.includes(keyword)}
                      >
                        {keyword}
                        {formData.industrySettings.keywords.includes(keyword) && (
                          <FontAwesomeIcon icon={faCheckCircle} className="ml-1 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 添加自定義關鍵詞 */}
              <div className="flex">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="輸入自定義關鍵詞"
                />
                <button
                  type="button"
                  onClick={() => handleAddKeyword(newKeyword)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1" />
                  添加
                </button>
              </div>
            </div>
            
            {/* 表單按鈕 */}
            <div className="flex justify-between mt-6">
              <Link 
                to={`/profile?project_name=${encodeURIComponent(projectTitle)}`} 
                className="flex items-center text-gray-700 hover:text-indigo-600"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                返回個人資料
              </Link>
              <button 
                type="submit" 
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
              >
                下一步：生成設置
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
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

      {/* Add validation error modal */}
      {showValidationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              行業設定未完成
            </h3>
            <p className="text-gray-600 mb-4">在繼續前，請完成以下必填資料：</p>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowValidationErrorModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Industry; 