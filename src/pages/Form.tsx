import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useFormContext } from '../context/FormContext';
import { useApiKey } from '../context/ApiKeyContext';
import ModelSelector from '../components/ModelSelector';
import CostEstimator from '../components/CostEstimator';

interface FormOption {
  id: string;
  label: string;
  value: string;
}

const durationOptions: FormOption[] = [
  { id: '30', label: '30 秒', value: '30秒' },
  { id: '60', label: '1 分鐘', value: '1分鐘' },
  { id: '120', label: '2 分鐘', value: '2分鐘' },
  { id: '180', label: '3 分鐘', value: '3分鐘' },
];

const languageOptions: FormOption[] = [
  { id: 'Chinese', label: '繁體中文', value: '繁體中文' },
  { id: 'SimplifiedChinese', label: '简体中文', value: '简体中文' },
  { id: 'English', label: 'English', value: 'English' },
  { id: 'Japanese', label: '日本語', value: '日本語' },
];

const styleOptions: FormOption[] = [
  { id: 'professional', label: '專業正式', value: '專業正式' },
  { id: 'friendly', label: '友善開朗', value: '友善開朗' },
  { id: 'casual', label: '輕鬆隨性', value: '輕鬆隨性' },
  { id: 'confident', label: '自信有力', value: '自信有力' },
];

const toneOptions: FormOption[] = [
  { id: 'education', label: '教育背景', value: '教育背景' },
  { id: 'experience', label: '工作經驗', value: '工作經驗' },
  { id: 'skills', label: '專業技能', value: '專業技能' },
  { id: 'personality', label: '個人特質', value: '個人特質' },
];

const Form: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateGenerationSettings } = useFormContext();
  const { apiKey, geminiApiKey, modelProvider } = useApiKey();
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);

  // Set default values for demo
  useEffect(() => {
    if (!formData.generationSettings.duration) {
      updateGenerationSettings({
        duration: '60',
        language: 'Chinese',
        style: 'professional',
        tone: 'skills',
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      });
    }
  }, []);

  const handleOptionChange = (category: string, optionId: string) => {
    updateGenerationSettings({ [category]: optionId });
  };

  const renderOptionGroup = (
    title: string,
    options: FormOption[],
    selectedId: string,
    category: string,
    isRequired: boolean = false
  ) => (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-2">
        {title} {isRequired && <span className="text-red-500">*</span>}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleOptionChange(category, option.id)}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedId === option.id
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const hasValidApiKey = () => {
    return modelProvider === 'openai' ? !!apiKey : !!geminiApiKey;
  };

  const handleSubmit = () => {
    if (!hasValidApiKey()) return;
    
    const requiredFieldsErrors = [];
    
    // Check generation settings
    if (!formData.generationSettings.duration) {
      requiredFieldsErrors.push('自我介紹時長');
    }
    
    if (!formData.generationSettings.language) {
      requiredFieldsErrors.push('語言');
    }
    
    if (!formData.generationSettings.style) {
      requiredFieldsErrors.push('風格');
    }
    
    if (!formData.generationSettings.tone) {
      requiredFieldsErrors.push('語調');
    }
    
    // Check previous pages' required fields
    // Personal info
    if (!formData.personalInfo.name || !formData.personalInfo.name.trim()) {
      requiredFieldsErrors.push('個人資料：姓名');
    }
    
    // Education
    if (formData.personalInfo.education.length > 0) {
      const hasValidEducation = formData.personalInfo.education.some(
        edu => edu.school.trim() && edu.degree.trim() && edu.major.trim()
      );
      
      if (!hasValidEducation) {
        requiredFieldsErrors.push('個人資料：學歷資料');
      }
    }
    
    // Work experience
    if (formData.personalInfo.workExperience.length > 0) {
      const hasValidWorkExperience = formData.personalInfo.workExperience.some(
        exp => exp.company.trim() && exp.position.trim() && (exp.startDate.trim() || exp.isCurrent)
      );
      
      if (!hasValidWorkExperience) {
        requiredFieldsErrors.push('個人資料：工作經驗');
      }
    }
    
    // Skills
    if (formData.personalInfo.skills.length > 0) {
      const hasValidSkill = formData.personalInfo.skills.some(
        skill => skill.name.trim()
      );
      
      if (!hasValidSkill) {
        requiredFieldsErrors.push('個人資料：技能');
      }
    }
    
    // Industry settings
    if (!formData.industrySettings.industry) {
      requiredFieldsErrors.push('行業設定：行業類別');
    }
    
    if (!formData.industrySettings.jobCategory) {
      requiredFieldsErrors.push('行業設定：職務類別');
    }
    
    if (formData.industrySettings.jobCategory && !formData.industrySettings.jobSubcategory) {
      requiredFieldsErrors.push('行業設定：職務子類別');
    }
    
    if (!formData.industrySettings.specificPosition || formData.industrySettings.specificPosition.trim() === '') {
      requiredFieldsErrors.push('行業設定：特定職位');
    }
    
    if (formData.industrySettings.keywords.length === 0) {
      requiredFieldsErrors.push('行業設定：至少添加一個關鍵字');
    }
    
    // If there are validation errors, show them and prevent navigation
    if (requiredFieldsErrors.length > 0) {
      // Set validation errors
      setValidationErrors(requiredFieldsErrors);
      // Show validation error modal
      setShowValidationErrorModal(true);
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      navigate('/result');
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">生成設定</h1>
          <Link to="/profile" className="text-indigo-600 hover:text-indigo-800">
            返回個人資料
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">生成設定</h2>
            
            {/* Model selector */}
            <div className="w-64">
              <ModelSelector compact={true} />
            </div>
          </div>
          
          {/* Cost estimator */}
          <CostEstimator estimatedTokens={1500} className="mb-6" />
          
          {renderOptionGroup(
            '自我介紹時長',
            durationOptions,
            formData.generationSettings.duration,
            'duration',
            true
          )}
          
          {renderOptionGroup(
            '語言',
            languageOptions,
            formData.generationSettings.language,
            'language',
            true
          )}
          
          {renderOptionGroup(
            '風格',
            styleOptions,
            formData.generationSettings.style,
            'style',
            true
          )}
          
          {renderOptionGroup(
            '語調',
            toneOptions,
            formData.generationSettings.tone,
            'tone',
            true
          )}
          
          <div className="mt-6 flex flex-col space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="highlightStrengths"
                checked={formData.generationSettings.highlightStrengths}
                onChange={(e) => updateGenerationSettings({ highlightStrengths: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="highlightStrengths" className="ml-2 block text-sm text-gray-700">
                突出個人優勢和專長
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeCallToAction"
                checked={formData.generationSettings.includeCallToAction}
                onChange={(e) => updateGenerationSettings({ includeCallToAction: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeCallToAction" className="ml-2 block text-sm text-gray-700">
                包含呼籲行動（如邀請面試或合作）
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="focusOnRecentExperience"
                checked={formData.generationSettings.focusOnRecentExperience}
                onChange={(e) => updateGenerationSettings({ focusOnRecentExperience: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="focusOnRecentExperience" className="ml-2 block text-sm text-gray-700">
                重點強調近期經驗
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            type="button"
            onClick={() => navigate('/industry')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            上一步
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-lg text-white flex items-center ${
              !hasValidApiKey() ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isGenerating ? '生成中...' : '開始生成'} 
            {!isGenerating && <FontAwesomeIcon icon={faArrowRight} className="ml-2" />}
          </button>
        </div>
        
        {!hasValidApiKey() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-start">
            <FontAwesomeIcon icon={faExclamationCircle} className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">需要設定 API Key</p>
              <p className="text-sm">
                使用 {modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} 模型生成自我介紹時需要提供有效的 API Key。
                <Link to="/settings" className="text-indigo-600 hover:text-indigo-800 ml-1">
                  前往設定
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
      
      {showValidationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              無法進行生成
            </h3>
            <p className="text-gray-600 mb-4">
              在生成自我介紹前，您需要完成所有必填欄位的設定。請返回相應頁面完成填寫：
            </p>
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

export default Form; 