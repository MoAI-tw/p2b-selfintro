import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faInfoCircle, faEye, faKey, faCog } from '@fortawesome/free-solid-svg-icons';
import { useApiKey } from '../context/ApiKeyContext';

interface ModelSettingsDashboardProps {
  onSettingsClick?: () => void;
  compact?: boolean;
}

const ModelSettingsDashboard: React.FC<ModelSettingsDashboardProps> = ({ 
  onSettingsClick,
  compact = false
}) => {
  const { 
    apiKey,
    geminiApiKey,
    modelProvider,
    selectedModel,
    maxTokens,
    loading
  } = useApiKey();

  // Check if API key is configured for current provider
  const isApiKeyConfigured = modelProvider === 'openai' ? !!apiKey : !!geminiApiKey;
  
  // Calculate cost estimate for a typical 1000 token request
  const costEstimate = selectedModel.costPer1kTokens 
    ? (selectedModel.costPer1kTokens * 1).toFixed(6) 
    : 'N/A';

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isApiKeyConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{selectedModel.name}</span>
          </div>
          <button
            onClick={onSettingsClick}
            className="text-gray-400 hover:text-indigo-600"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faRobot} className="text-indigo-600 mr-2" />
          AI 模型設定
        </h3>
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="text-gray-400 hover:text-indigo-600"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={isApiKeyConfigured ? faKey : faInfoCircle} 
              className={isApiKeyConfigured ? "text-green-500" : "text-red-500"} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">API Key 狀態</p>
            <p className={`text-sm ${isApiKeyConfigured ? 'text-green-600' : 'text-red-600'}`}>
              {isApiKeyConfigured ? '已設定' : '未設定'}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faRobot} className="text-indigo-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">當前模型</p>
            <p className="text-sm text-gray-900">{selectedModel.name}</p>
            <p className="text-xs text-gray-500">{selectedModel.description}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">模型提供者</p>
            <p className="text-sm text-gray-900">
              {modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faEye} className="text-purple-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">設定</p>
            <p className="text-sm text-gray-900">最大 Token: {maxTokens}</p>
            <p className="text-sm text-gray-900">預估成本: ${costEstimate} / 1K tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsDashboard; 