import { FormData } from '../context/FormContext';
import { generateSelfIntro } from './openai';
import { generateGeminiSelfIntro } from './gemini';
import { ModelProvider } from '../context/ApiKeyContext';

/**
 * 生成結果接口
 */
export interface GenerationResult {
  content: string;
  prompt?: string;
  error?: string;
}

/**
 * Generate self-introduction using the selected model provider
 * This service acts as a facade over the different model implementations
 */
export const generateSelfIntroduction = async (
  formData: FormData,
  modelProvider: ModelProvider,
  apiKey?: string,
  modelId?: string
): Promise<GenerationResult> => {
  try {
    // Dispatch to appropriate model provider with the selected model ID
    switch (modelProvider) {
      case 'openai':
        return await generateSelfIntro(formData, apiKey, modelId);
      case 'gemini':
        return await generateGeminiSelfIntro(formData, apiKey, modelId);
      default:
        return {
          content: '',
          error: `未支援的模型提供者: ${modelProvider}`
        };
    }
  } catch (error) {
    console.error('生成自我介紹時出錯:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : '未知錯誤'
    };
  }
}; 