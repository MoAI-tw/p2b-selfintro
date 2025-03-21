import React, { useState, useEffect, useRef } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ModelSelectorProps {
  compact?: boolean;
  className?: string;
}

/**
 * 對模型進行分類，用於更好地在下拉菜單中分組顯示
 */
const categorizeModels = (models: any[], modelProvider: string) => {
  if (modelProvider === 'openai') {
    // OpenAI 模型分組
    return [
      {
        category: 'GPT-4 系列',
        models: models.filter(m => m.id.startsWith('gpt-4'))
      },
      {
        category: 'GPT-3.5 系列',
        models: models.filter(m => m.id.startsWith('gpt-3.5'))
      }
    ];
  } else {
    // Gemini 模型分組
    return [
      {
        category: 'Gemini 2.0 系列',
        models: models.filter(m => m.id.startsWith('gemini-2.0'))
      },
      {
        category: 'Gemini 1.5 系列',
        models: models.filter(m => m.id.startsWith('gemini-1.5'))
      },
      {
        category: 'Gemma 系列',
        models: models.filter(m => m.id.startsWith('gemma'))
      },
      {
        category: '舊版模型',
        models: models.filter(m => m.id.startsWith('gemini-1.0'))
      }
    ].filter(group => group.models.length > 0); // 只保留有模型的分組
  }
};

const ModelSelector: React.FC<ModelSelectorProps> = ({ compact = false, className = '' }) => {
  const { 
    modelProvider, 
    setModelProvider, 
    availableModels, 
    selectedModel, 
    setSelectedModel 
  } = useApiKey();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState(availableModels);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 將模型分類為組
  const modelGroups = categorizeModels(filteredModels, modelProvider);

  // 模型搜索功能
  useEffect(() => {
    if (searchTerm) {
      const filtered = availableModels.filter(model => 
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(availableModels);
    }
  }, [searchTerm, availableModels]);

  // 關閉下拉菜單當點擊外部
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 處理模型提供商變更
  const handleModelProviderChange = (provider: 'openai' | 'gemini') => {
    setModelProvider(provider);
    setShowDropdown(false);
    setSearchTerm('');
  };

  // 處理模型選擇
  const handleModelSelection = (modelId: string) => {
    setSelectedModel(modelId);
    setShowDropdown(false);
    setSearchTerm('');
  };

  // 渲染模型組
  const renderModelGroups = () => {
    return modelGroups.map((group, groupIndex) => (
      <div key={groupIndex}>
        {/* 只有當有超過一個組時才顯示組標題 */}
        {modelGroups.length > 1 && (
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
            {group.category}
          </div>
        )}
        
        {/* 組內的模型列表 */}
        {group.models.map((model) => (
          <div
            key={model.id}
            onClick={() => handleModelSelection(model.id)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium">{model.name}</div>
                {model.costPer1kTokens && (
                  <div className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded ml-2">
                    ${model.costPer1kTokens}/1K tokens
                  </div>
                )}
              </div>
              {!compact && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{model.description}</div>
              )}
            </div>
            {selectedModel.id === model.id && (
              <FontAwesomeIcon icon={faCheck} className="ml-2 text-green-500" />
            )}
          </div>
        ))}
      </div>
    ));
  };

  if (compact) {
    // 精簡版本（僅下拉菜單，無提供商標籤）
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>{selectedModel.name}</span>
          <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
        </button>
        
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
            {/* 搜索框 */}
            {availableModels.length > 5 && (
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索模型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* 提供商切換 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleModelProviderChange('openai')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  modelProvider === 'openai'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => handleModelProviderChange('gemini')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  modelProvider === 'gemini'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Google Gemini
              </button>
            </div>
            
            {/* 無搜索結果提示 */}
            {filteredModels.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                沒有找到匹配的模型
              </div>
            )}
            
            {/* 模型列表 */}
            {renderModelGroups()}
          </div>
        )}
      </div>
    );
  }

  // 完整版本，帶有提供商標籤和模型下拉菜單
  return (
    <div className={`${className}`}>
      {/* 提供商選擇標籤 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => handleModelProviderChange('openai')}
          className={`px-4 py-2 text-sm font-medium ${
            modelProvider === 'openai'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          OpenAI
        </button>
        <button
          onClick={() => handleModelProviderChange('gemini')}
          className={`px-4 py-2 text-sm font-medium ${
            modelProvider === 'gemini'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Google Gemini
        </button>
      </div>

      {/* 模型選擇下拉菜單 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>{selectedModel.name}</span>
          <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
        </button>
        
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
            {/* 搜索框 */}
            {availableModels.length > 5 && (
              <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索模型..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* 無搜索結果提示 */}
            {filteredModels.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                沒有找到匹配的模型
              </div>
            )}
            
            {/* 模型列表 */}
            {renderModelGroups()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector; 