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
  apiKey: string,
  modelId?: string
): Promise<GenerationResult> => {
  console.log('[MODEL_SERVICE] 開始生成自我介紹', { 
    modelProvider, 
    modelId, 
    hasApiKey: !!apiKey,
    formDataSummary: {
      hasPersonalInfo: !!formData.personalInfo,
      hasIndustrySettings: !!formData.industrySettings,
      hasGenerationSettings: !!formData.generationSettings
    }
  });
  
  try {
    // Dispatch to appropriate model provider with the selected model ID
    switch (modelProvider) {
      case 'openai':
        console.log('[MODEL_SERVICE] 使用 OpenAI 模型');
        const openaiResult = await generateSelfIntro(formData, apiKey, modelId || 'gpt-4o');
        console.log('[MODEL_SERVICE] 生成結果', { 
          success: !openaiResult.error,
          hasContent: !!openaiResult.content,
          contentLength: openaiResult.content?.length || 0,
          hasPrompt: !!openaiResult.prompt,
          errorMessage: openaiResult.error
        });
        return {
          content: openaiResult.content || '',
          prompt: openaiResult.prompt,
          error: openaiResult.error
        };
        
      case 'gemini':
        console.log('[MODEL_SERVICE] 使用 Gemini 模型');
        const geminiResult = await generateGeminiSelfIntro(formData, apiKey, modelId || 'gemini-1.5-pro');
        console.log('[MODEL_SERVICE] 生成結果', { 
          success: !geminiResult.error,
          hasContent: !!geminiResult.content,
          contentLength: geminiResult.content?.length || 0,
          hasPrompt: !!geminiResult.prompt,
          errorMessage: geminiResult.error
        });
        return {
          content: geminiResult.content || '',
          prompt: geminiResult.prompt,
          error: geminiResult.error
        };
        
      default:
        console.log('[MODEL_SERVICE] 錯誤：未支援的模型提供者', { modelProvider });
        return {
          content: '',
          error: `未支援的模型提供者: ${modelProvider}`
        };
    }
  } catch (error) {
    console.error('[MODEL_SERVICE] 生成自我介紹時出錯:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : '未知錯誤'
    };
  }
}; 