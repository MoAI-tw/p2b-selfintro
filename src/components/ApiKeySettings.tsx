import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCheck, faExclamationCircle, faEye, faEyeSlash, faInfoCircle, faRobot, faSliders, faExchangeAlt, faChevronDown, faGripLines, faSave } from '@fortawesome/free-solid-svg-icons';
import { useApiKey, ModelProvider } from '../context/ApiKeyContext';

interface ApiKeySettingsProps {
  onClose?: () => void;
}

const ApiKeySettings = ({ onClose }: ApiKeySettingsProps) => {
  const { 
    apiKey,
    setApiKey,
    geminiApiKey,
    setGeminiApiKey,
    error: apiKeyError, 
    modelName, 
    maxTokens,
    setMaxTokens,
    modelProvider,
    setModelProvider,
    availableModels,
    selectedModel,
    setSelectedModel
  } = useApiKey();
  
  const [showKey, setShowKey] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [inputOpenAIKey, setInputOpenAIKey] = useState('');
  const [inputGeminiKey, setInputGeminiKey] = useState('');
  const [inputMaxTokens, setInputMaxTokens] = useState(maxTokens.toString());
  const [customKeySaved, setCustomKeySaved] = useState(false);
  const [keySource, setKeySource] = useState<'env' | 'custom'>(
    localStorage.getItem('apiKeySource') as 'env' | 'custom' || 'env'
  );
  
  // Load saved API keys if available
  useEffect(() => {
    const savedOpenAIKey = localStorage.getItem('openai_api_key');
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    const savedMaxTokens = localStorage.getItem('max_tokens');
    
    if (savedOpenAIKey) setInputOpenAIKey(savedOpenAIKey);
    if (savedGeminiKey) setInputGeminiKey(savedGeminiKey);
    if (savedMaxTokens) setInputMaxTokens(savedMaxTokens);
  }, []);
  
  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const handleModelProviderChange = (provider: ModelProvider) => {
    setModelProvider(provider);
    setShowModelDropdown(false);
  };
  
  const handleModelSelection = (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelDropdown(false);
  };
  
  const handleSaveAPIKeys = () => {
    // Save keys to localStorage
    if (inputOpenAIKey) localStorage.setItem('openai_api_key', inputOpenAIKey);
    if (inputGeminiKey) localStorage.setItem('gemini_api_key', inputGeminiKey);
    if (inputMaxTokens) localStorage.setItem('max_tokens', inputMaxTokens);
    
    // Save key source preference
    localStorage.setItem('apiKeySource', 'custom');
    setKeySource('custom');
    
    // Update context with new values
    if (inputOpenAIKey) setApiKey(inputOpenAIKey);
    if (inputGeminiKey) setGeminiApiKey(inputGeminiKey);
    if (inputMaxTokens) setMaxTokens(parseInt(inputMaxTokens, 10));
    
    // Show success indicator
    setCustomKeySaved(true);
    setTimeout(() => {
      setCustomKeySaved(false);
    }, 3000);
  };
  
  const handleUseEnvironmentVars = () => {
    // Clear localStorage saved keys
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('max_tokens');
    
    // Set source back to environment
    localStorage.setItem('apiKeySource', 'env');
    setKeySource('env');
    
    // Reload page to reinitialize API key context from environment
    window.location.reload();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between cursor-move" id="modal-drag-handle">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faKey} className="text-indigo-600 mr-2" />
          AI 模型設定
        </div>
        <FontAwesomeIcon icon={faGripLines} className="text-gray-400" />
      </h2>
      
      {/* Model Provider Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <FontAwesomeIcon icon={faExchangeAlt} className="mr-2 text-indigo-600" />
          切換 LLM 模型提供者
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModelProviderChange('openai')}
            className={`px-4 py-3 rounded-lg border flex flex-col items-center transition-all ${
              modelProvider === 'openai' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">OpenAI</span>
            <span className="text-xs mt-1 text-gray-500">多種 GPT 模型</span>
          </button>
          <button
            type="button"
            onClick={() => handleModelProviderChange('gemini')}
            className={`px-4 py-3 rounded-lg border flex flex-col items-center transition-all ${
              modelProvider === 'gemini' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">Google</span>
            <span className="text-xs mt-1 text-gray-500">Gemini 系列模型</span>
          </button>
        </div>
      </div>
      
      {/* Model Selection Dropdown */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <FontAwesomeIcon icon={faRobot} className="mr-2 text-indigo-600" />
          選擇 AI 模型
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
          >
            <span>{selectedModel.name}</span>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`transition-transform ${showModelDropdown ? 'rotate-180' : ''}`}
            />
          </button>
          
          {showModelDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {availableModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelection(model.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedModel.id === model.id ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{model.name}</div>
                    {model.costPer1kTokens && (
                      <div className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        ${model.costPer1kTokens}/1K tokens
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedModel.description}
        </p>
      </div>
      
      {/* API Key Source Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <FontAwesomeIcon icon={faKey} className="mr-2 text-indigo-600" />
          API Key 來源
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setKeySource('env')}
            className={`px-4 py-3 rounded-lg border flex flex-col items-center transition-all ${
              keySource === 'env' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">環境變數</span>
            <span className="text-xs mt-1 text-gray-500">使用伺服器設定</span>
          </button>
          <button
            type="button"
            onClick={() => setKeySource('custom')}
            className={`px-4 py-3 rounded-lg border flex flex-col items-center transition-all ${
              keySource === 'custom' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">自訂 API Key</span>
            <span className="text-xs mt-1 text-gray-500">輸入您自己的 Key</span>
          </button>
        </div>
      </div>
      
      {keySource === 'env' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">環境變數設定</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>此系統現使用環境變數來設定 API Key。API Key 已在伺服器端設定，您無需手動輸入。</p>
                <p className="mt-2">如需更改 API Key，請聯繫系統管理員更新相應的環境變數：</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>OpenAI: <code className="px-1 py-0.5 bg-blue-100 rounded">VITE_OPENAI_API_KEY</code></li>
                  <li>Google Gemini: <code className="px-1 py-0.5 bg-blue-100 rounded">VITE_GEMINI_API_KEY</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {/* Custom OpenAI API Key Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputOpenAIKey}
                onChange={(e) => setInputOpenAIKey(e.target.value)}
                placeholder="sk-..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={toggleShowKey}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FontAwesomeIcon icon={showKey ? faEyeSlash : faEye} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              請從 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI 網站</a> 獲取您的 API Key
            </p>
          </div>
          
          {/* Custom Gemini API Key Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputGeminiKey}
                onChange={(e) => setInputGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={toggleShowKey}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FontAwesomeIcon icon={showKey ? faEyeSlash : faEye} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              請從 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> 獲取您的 API Key
            </p>
          </div>
          
          {/* Custom Max Tokens Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              最大輸出 Token 數
            </label>
            <input
              type="number"
              value={inputMaxTokens}
              onChange={(e) => setInputMaxTokens(e.target.value)}
              placeholder="1500"
              min="100"
              max="4000"
              className="w-full pl-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              控制模型生成的最大字符數，建議值：1000-2000
            </p>
          </div>
          
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveAPIKeys}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            儲存 API 設定
          </button>
          
          {/* Feedback message */}
          {customKeySaved && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">API 設定已成功儲存，將在下次生成時使用。</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Switch back to environment vars */}
          <button
            type="button"
            onClick={handleUseEnvironmentVars}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition text-sm"
          >
            回到使用環境變數 API Key
          </button>
        </div>
      )}
      
      {apiKeyError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">API Key 錯誤</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{apiKeyError}</p>
                <p className="mt-2">請確認您的 API Key 設定是否正確。</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Display appropriate API key based on model provider and key source */}
      {keySource === 'env' && modelProvider === 'openai' && apiKey && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            當前 OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              readOnly
              className="w-full pl-4 pr-10 py-2 border border-gray-300 bg-gray-50 rounded-lg"
            />
            <button
              type="button"
              onClick={toggleShowKey}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={showKey ? faEyeSlash : faEye} />
            </button>
          </div>
          <p className="mt-2 text-green-500 text-sm flex items-center">
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
            OpenAI API Key 已從環境變數載入
          </p>
        </div>
      )}

      {keySource === 'env' && modelProvider === 'gemini' && geminiApiKey && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            當前 Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={geminiApiKey}
              readOnly
              className="w-full pl-4 pr-10 py-2 border border-gray-300 bg-gray-50 rounded-lg"
            />
            <button
              type="button"
              onClick={toggleShowKey}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FontAwesomeIcon icon={showKey ? faEyeSlash : faEye} />
            </button>
          </div>
          <p className="mt-2 text-green-500 text-sm flex items-center">
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
            Gemini API Key 已從環境變數載入
          </p>
        </div>
      )}
      
      {/* Model and Token Info */}
      <div className="mb-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
            <FontAwesomeIcon icon={faSliders} className="mr-2 text-indigo-600" />
            模型設定
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">當前使用模型</p>
              <p className="font-medium">{selectedModel.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">最大字符數</p>
              <p className="font-medium">{maxTokens}</p>
            </div>
          </div>
          {keySource === 'env' && (
            <p className="mt-3 text-xs text-gray-500">
              若要更改最大字符數，請設定環境變數 <code className="px-1 py-0.5 bg-gray-100 rounded">VITE_MAX_TOKENS</code>
            </p>
          )}
        </div>
        
        {/* API Cost Information */}
        {selectedModel.costPer1kTokens && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-blue-600" />
              API 呼叫成本資訊
            </h3>
            <div className="text-sm text-blue-700">
              <p>使用此模型的大約成本: ${selectedModel.costPer1kTokens} / 1,000 tokens</p>
              <p className="mt-1">每次生成自我介紹根據長度大約會消耗 500-2,000 tokens。</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none"
          >
            關閉
          </button>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-2">關於 API：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>OpenAI API Key 可在 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenAI API Keys</a> 頁面取得</li>
          <li>Google Gemini API Key 可在 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">AI Studio API Keys</a> 頁面取得</li>
          <li>API Key 已在環境變數中安全設定，從應用程序內部無法修改</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeySettings; 