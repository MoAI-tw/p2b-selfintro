import { FormData } from '../context/FormContext';
import { generateSelfIntro as generateOpenAISelfIntro } from './openai';
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

interface GenerateOptions {
  formData: FormData;
  apiKey: string | null;
  selectedModel: string;
  maxTokens: number;
}

export interface GenerateResponse {
  success: boolean;
  data: string | null;
  error: string | null;
}

/**
 * Generate self-introduction using the selected model provider
 * This service acts as a facade over the different model implementations
 */
export const generateSelfIntroduction = async (
  options: GenerateOptions,
  modelProvider: ModelProvider
): Promise<GenerateResponse> => {
  try {
    const { formData, apiKey, selectedModel, maxTokens } = options;
    
    if (!apiKey) {
      console.error(`No API key provided for ${modelProvider} provider`);
      return {
        success: false,
        data: null,
        error: `請設定 ${modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API key 才能使用此功能。`
      };
    }
    
    let response: string;
    
    if (modelProvider === 'openai') {
      // Call OpenAI API
      console.log(`Generating with OpenAI model: ${selectedModel}`);
      response = await generateOpenAISelfIntro(formData, apiKey, selectedModel, maxTokens);
    } else {
      // Call Gemini API
      console.log(`Generating with Gemini model: ${selectedModel}`);
      response = await generateGeminiSelfIntro(formData, apiKey, selectedModel, maxTokens);
    }
    
    return {
      success: true,
      data: response,
      error: null
    };
  } catch (error) {
    console.error('Error generating self introduction:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}; 