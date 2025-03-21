import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OPENAI_MODELS, GEMINI_MODELS, getModelById, getDefaultModel } from '../utils/modelConfig';

// Define model provider types
export type ModelProvider = 'openai' | 'gemini';

// Define model interface
interface ModelInfo {
  id: string;
  name: string;
  description: string;
  costPer1kTokens?: number;
  currency?: string;
  defaultTokens?: number;
}

export interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string) => void;
  error: string | null;
  loading: boolean;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  modelName: string;
  modelProvider: ModelProvider;
  setModelProvider: (provider: ModelProvider) => void;
  availableModels: ModelInfo[];
  selectedModel: ModelInfo;
  setSelectedModel: (modelId: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider = ({ children }: ApiKeyProviderProps) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxTokens, setMaxTokensState] = useState(1500); // Default value
  const [modelProvider, setModelProvider] = useState<ModelProvider>('openai');
  const [selectedModelId, setSelectedModelId] = useState('gpt-3.5-turbo');
  
  // OpenAI models
  const openAIModels: ModelInfo[] = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: '最佳性價比的模型，適合大多數任務',
      costPer1kTokens: 0.001,
      currency: 'USD',
      defaultTokens: 1500
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: '更強大的功能和準確度，但成本更高',
      costPer1kTokens: 0.03,
      currency: 'USD',
      defaultTokens: 1000
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'GPT-4 的更快版本，支援最新知識',
      costPer1kTokens: 0.01,
      currency: 'USD',
      defaultTokens: 1500
    }
  ];
  
  // Gemini models
  const geminiModels: ModelInfo[] = [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      description: 'Google 通用模型，適合多數任務',
      costPer1kTokens: 0.0005,
      currency: 'USD',
      defaultTokens: 2000
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: '增強的能力和效能',
      costPer1kTokens: 0.0025,
      currency: 'USD',
      defaultTokens: 2000
    }
  ];
  
  // Get available models based on current provider
  const availableModels = modelProvider === 'openai' ? openAIModels : geminiModels;
  
  // Find the current model info
  const selectedModel = availableModels.find(model => model.id === selectedModelId) || availableModels[0];
  
  // Methods to update model provider and selected model
  const handleModelProviderChange = (provider: ModelProvider) => {
    setModelProvider(provider);
    // Set default model for the new provider
    if (provider === 'openai') {
      setSelectedModelId('gpt-3.5-turbo');
    } else {
      setSelectedModelId('gemini-pro');
    }
  };
  
  const handleSelectedModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  // Set API Key methods
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    setError(null);
  };
  
  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    setError(null);
  };
  
  const setMaxTokens = (tokens: number) => {
    setMaxTokensState(tokens);
  };
  
  // Initialize API keys
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setLoading(true);
        
        // First try to load from localStorage if user has set custom API keys
        const apiKeySource = localStorage.getItem('apiKeySource');
        
        if (apiKeySource === 'custom') {
          const openaiKey = localStorage.getItem('openai_api_key');
          const geminiKey = localStorage.getItem('gemini_api_key');
          const maxTokensValue = localStorage.getItem('max_tokens');
          
          if (openaiKey) setApiKeyState(openaiKey);
          if (geminiKey) setGeminiApiKeyState(geminiKey);
          if (maxTokensValue) setMaxTokensState(parseInt(maxTokensValue, 10));
        } else {
          // Otherwise, load from environment variables
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
          const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const maxTokensEnv = import.meta.env.VITE_MAX_TOKENS;
          
          if (openaiKey) {
            setApiKeyState(openaiKey);
          } else {
            console.warn('OpenAI API key not found in environment variables');
          }
          
          if (geminiKey) {
            setGeminiApiKeyState(geminiKey);
          } else {
            console.warn('Gemini API key not found in environment variables');
          }
          
          if (maxTokensEnv) {
            setMaxTokensState(parseInt(maxTokensEnv, 10));
          }
        }
      } catch (err) {
        console.error('Error loading API keys:', err);
        setError('載入 API 密鑰時發生錯誤。請確保您的環境變量已正確設置。');
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKeys();
  }, []);
  
  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        geminiApiKey,
        setGeminiApiKey,
        error,
        loading,
        maxTokens,
        setMaxTokens,
        modelName: selectedModel.name,
        modelProvider,
        setModelProvider: handleModelProviderChange,
        availableModels,
        selectedModel,
        setSelectedModel: handleSelectedModelChange
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}; 