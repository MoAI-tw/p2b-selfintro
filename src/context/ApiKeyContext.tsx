import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OPENAI_MODELS, GEMINI_MODELS, getModelById, getDefaultModel, Model } from '../utils/modelConfig';

// Define model provider types
export type ModelProvider = 'openai' | 'gemini';

// Define model interface for context - using the Model type from modelConfig
export type ModelInfo = Model;

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
  saveModelSettingsToLocalStorage: () => void;
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
  const [modelProvider, setModelProviderState] = useState<ModelProvider>('openai');
  const [selectedModelId, setSelectedModelIdState] = useState('gpt-3.5-turbo');
  
  // Get available models based on current provider from modelConfig.ts
  const availableModels = modelProvider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;
  
  // Find the current model info
  const selectedModel = availableModels.find(model => model.id === selectedModelId) || getDefaultModel(modelProvider);
  
  // Methods to update model provider and selected model
  const handleModelProviderChange = (provider: ModelProvider) => {
    setModelProviderState(provider);
    // Set default model for the new provider
    const defaultModel = getDefaultModel(provider);
    setSelectedModelIdState(defaultModel.id);
    
    // Save to localStorage
    localStorage.setItem('model_provider', provider);
    localStorage.setItem('selected_model_id', defaultModel.id);
  };
  
  const handleSelectedModelChange = (modelId: string) => {
    setSelectedModelIdState(modelId);
    // Save to localStorage
    localStorage.setItem('selected_model_id', modelId);
  };

  // Set API Key methods
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('openai_api_key', key);
    setError(null);
  };
  
  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('gemini_api_key', key);
    setError(null);
  };
  
  const setMaxTokens = (tokens: number) => {
    setMaxTokensState(tokens);
    localStorage.setItem('max_tokens', tokens.toString());
  };
  
  // Save all model settings to localStorage
  const saveModelSettingsToLocalStorage = () => {
    localStorage.setItem('model_provider', modelProvider);
    localStorage.setItem('selected_model_id', selectedModelId);
    localStorage.setItem('max_tokens', maxTokens.toString());
    if (apiKey) localStorage.setItem('openai_api_key', apiKey);
    if (geminiApiKey) localStorage.setItem('gemini_api_key', geminiApiKey);
  };
  
  // Initialize API keys and model settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Load API keys
        const openaiKey = localStorage.getItem('openai_api_key');
        const geminiKey = localStorage.getItem('gemini_api_key');
        const maxTokensValue = localStorage.getItem('max_tokens');
        
        // Load model settings
        const storedModelProvider = localStorage.getItem('model_provider') as ModelProvider | null;
        const storedModelId = localStorage.getItem('selected_model_id');
        
        // If localStorage has values, use them
        if (openaiKey) {
          setApiKeyState(openaiKey);
        } else {
          // Otherwise use environment variables
          const envOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (envOpenAIKey) {
            setApiKeyState(envOpenAIKey);
          } else {
            console.warn('OpenAI API key not found in localStorage or environment variables');
          }
        }
        
        if (geminiKey) {
          setGeminiApiKeyState(geminiKey);
        } else {
          // Otherwise use environment variables
          const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (envGeminiKey) {
            setGeminiApiKeyState(envGeminiKey);
          } else {
            console.warn('Gemini API key not found in localStorage or environment variables');
          }
        }
        
        if (maxTokensValue) {
          setMaxTokensState(parseInt(maxTokensValue, 10));
        } else {
          const maxTokensEnv = import.meta.env.VITE_MAX_TOKENS;
          if (maxTokensEnv) {
            setMaxTokensState(parseInt(maxTokensEnv, 10));
          }
        }
        
        // Set model provider if found in localStorage
        if (storedModelProvider && (storedModelProvider === 'openai' || storedModelProvider === 'gemini')) {
          setModelProviderState(storedModelProvider);
        }
        
        // Set selected model if found in localStorage
        if (storedModelId) {
          // Verify the model exists for the selected provider
          const provider = storedModelProvider || modelProvider;
          const models = provider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;
          const modelExists = models.some(model => model.id === storedModelId);
          
          if (modelExists) {
            setSelectedModelIdState(storedModelId);
          } else {
            // If model doesn't exist, use default model for provider
            const defaultModel = getDefaultModel(provider);
            setSelectedModelIdState(defaultModel.id);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('載入設定時發生錯誤。請確保您的設定正確。');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
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
        setSelectedModel: handleSelectedModelChange,
        saveModelSettingsToLocalStorage
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}; 