// Model configuration for supported LLM providers

export interface Model {
  id: string;
  name: string;
  description: string;
  defaultTokens: number;
  costPer1kTokens?: number;
  currency?: string;
}

// OpenAI models
export const OPENAI_MODELS: Model[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: '最強大的 OpenAI 模型，可用於複雜專業自我介紹',
    defaultTokens: 16000,
    costPer1kTokens: 10,
    currency: 'USD'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: '速度快、價格低、能力強的模型，適合一般自我介紹',
    defaultTokens: 8000,
    costPer1kTokens: 2.5,
    currency: 'USD'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: '強大且高效的模型，適合複雜用例',
    defaultTokens: 8000,
    costPer1kTokens: 15,
    currency: 'USD'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '經濟實惠的選擇，適合一般自我介紹',
    defaultTokens: 4000,
    costPer1kTokens: 0.5,
    currency: 'USD'
  }
];

// Google Gemini models
export const GEMINI_MODELS: Model[] = [
  // Gemini 2.0 系列
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google 最強大的多模態模型，100萬詞元脈絡窗口，專為 Agent 時代打造',
    defaultTokens: 32000,
    costPer1kTokens: 0.1,  // 輸入價格 $0.10 / 1M tokens
    currency: 'USD'
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: '最小且最符合成本效益的機型，專為大規模使用而設計',
    defaultTokens: 16000,
    costPer1kTokens: 0.075, // 輸入價格 $0.075 / 1M tokens
    currency: 'USD'
  },
  // Gemini 1.5 系列
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '脈絡窗口突破性地達到 200 萬個符記的先進多模態模型',
    defaultTokens: 128000,
    costPer1kTokens: 1.25, // 少於 128k 符記：$1.25 / 1M tokens
    currency: 'USD'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: '平衡成本與效能的優質選擇，適合大多數生成需求',
    defaultTokens: 16000,
    costPer1kTokens: 0.0375, // 少於 128k 符記：$0.0375 / 1M tokens
    currency: 'USD'
  },
  // Gemma 3 模型
  {
    id: 'gemma-3',
    name: 'Gemma 3',
    description: 'Google 開源語言模型，平衡效能與成本效益',
    defaultTokens: 8000,
    costPer1kTokens: 0.05, // 預估成本
    currency: 'USD'
  },
  // 保留舊模型以向後兼容
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: '穩定可靠的模型，適合標準文本生成',
    defaultTokens: 4000,
    costPer1kTokens: 0.5,
    currency: 'USD'
  }
];

// Helper functions to get models and default models
export const getAllModels = (): Model[] => [...OPENAI_MODELS, ...GEMINI_MODELS];

export const getModelsByProvider = (provider: 'openai' | 'gemini'): Model[] => {
  return provider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;
};

export const getModelById = (modelId: string): Model => {
  const allModels = getAllModels();
  const model = allModels.find(m => m.id === modelId);
  if (!model) {
    // Fallback to default model
    return OPENAI_MODELS[0]; // GPT-4o as default
  }
  return model;
};

export const getDefaultModel = (provider: 'openai' | 'gemini'): Model => {
  const models = getModelsByProvider(provider);
  return models[0]; // Return the first model in the list which is usually the most capable
}; 