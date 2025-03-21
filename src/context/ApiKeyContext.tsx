import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OPENAI_MODELS, GEMINI_MODELS, getModelById, getDefaultModel } from '../utils/modelConfig';

// Define model provider types
export type ModelProvider = 'openai' | 'gemini';

// Define model interface
export interface Model {
  id: string;
  name: string;
  description: string;
  defaultTokens: number;
  costPer1kTokens?: number;
  currency?: string;
}

interface ApiKeyContextType {
  apiKey: string;
  geminiApiKey: string;
  isLoading: boolean;
  error: string;
  modelName: string;
  modelId: string;
  maxTokens: number;
  modelProvider: ModelProvider;
  setModelProvider: (provider: ModelProvider) => void;
  availableModels: Model[];
  selectedModel: Model;
  setSelectedModel: (modelId: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: '',
  geminiApiKey: '',
  isLoading: true,
  error: '',
  modelName: '',
  modelId: '',
  maxTokens: 0,
  modelProvider: 'openai',
  setModelProvider: () => {},
  availableModels: [],
  selectedModel: OPENAI_MODELS[0],
  setSelectedModel: () => {},
});

export const useApiKey = () => useContext(ApiKeyContext);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState<number>(0);
  const [modelProvider, setModelProvider] = useState<ModelProvider>(
    (localStorage.getItem('modelProvider') as ModelProvider) || 'openai'
  );
  const [availableModels, setAvailableModels] = useState<Model[]>(
    modelProvider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS
  );
  const [selectedModel, setSelectedModel] = useState<Model>(() => {
    const savedModelId = localStorage.getItem(`${modelProvider}_modelId`);
    return savedModelId 
      ? getModelById(savedModelId) 
      : getDefaultModel(modelProvider);
  });
  
  // Update available models when provider changes
  useEffect(() => {
    setAvailableModels(modelProvider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS);
    
    // Get saved model ID for this provider or use default
    const savedModelId = localStorage.getItem(`${modelProvider}_modelId`);
    const model = savedModelId 
      ? getModelById(savedModelId) 
      : getDefaultModel(modelProvider);
    
    setSelectedModel(model);
  }, [modelProvider]);
  
  // Handle model selection
  const handleSetSelectedModel = (modelId: string) => {
    const model = getModelById(modelId);
    setSelectedModel(model);
    localStorage.setItem(`${modelProvider}_modelId`, modelId);
  };
  
  // Load API key from environment variable
  useEffect(() => {
    try {
      // Get API keys from environment variables
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Get max tokens setting
      const MAX_TOKENS = parseInt(import.meta.env.VITE_MAX_TOKENS || '1500', 10);
      
      // Based on selected model provider, check for appropriate API key
      if (modelProvider === 'openai' && !OPENAI_API_KEY) {
        setError('OpenAI API Key 未設定。請在環境變數中設定 VITE_OPENAI_API_KEY。');
      } else if (modelProvider === 'gemini' && !GEMINI_API_KEY) {
        setError('Gemini API Key 未設定。請在環境變數中設定 VITE_GEMINI_API_KEY。');
      } else {
        setApiKey(OPENAI_API_KEY || '');
        setGeminiApiKey(GEMINI_API_KEY || '');
        setModelName(selectedModel.name);
        setModelId(selectedModel.id);
        setMaxTokens(MAX_TOKENS);
        setError('');
      }
    } catch (error) {
      setError('載入 API Key 時出錯。請確保環境變數正確設定。');
      console.error('Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  }, [modelProvider, selectedModel]);

  // Save model provider selection to localStorage when changed
  useEffect(() => {
    localStorage.setItem('modelProvider', modelProvider);
  }, [modelProvider]);
  
  const handleSetModelProvider = (provider: ModelProvider) => {
    setModelProvider(provider);
  };
  
  const contextValue: ApiKeyContextType = {
    apiKey,
    geminiApiKey,
    isLoading,
    error,
    modelName,
    modelId,
    maxTokens,
    modelProvider,
    setModelProvider: handleSetModelProvider,
    availableModels,
    selectedModel,
    setSelectedModel: handleSetSelectedModel
  };
  
  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
}; 