import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useFormContext } from '../context/FormContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faPaperPlane, faChartPie, faLanguage, faComment, faFileAlt, faCheck, faSave, faTimes, faExclamationCircle, faArrowLeft, faArrowRight, faKey, faSliders, faGlobe, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import ApiKeySettings from '../components/ApiKeySettings';
import DraggableModal from '../components/DraggableModal';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updateGenerationSettings, updateIndustrySettings } = useFormContext();
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }
    
    if (selectedFocusAreas.length === 0) {
      return; // Prevent submission if no focus areas are selected
    }
    
    // Update context with local state
    updateGenerationSettings({
      tone: localSettings.tone,
      outputLength: localSettings.outputLength,
      language: localSettings.language,
      highlightStrengths: localSettings.highlightStrengths,
      includeCallToAction: localSettings.includeCallToAction,
      focusOnRecentExperience: localSettings.focusOnRecentExperience
    });
    
    updateIndustrySettings({
      focusAreas: selectedFocusAreas
    });
    
    navigate(`/result?project_name=${encodeURIComponent(projectTitle)}`);
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
                disabled={selectedFocusAreas.length === 0}
                className={`flex items-center px-6 py-3 rounded-md text-white transition-colors ${
                  selectedFocusAreas.length > 0 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                生成內容
                <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
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