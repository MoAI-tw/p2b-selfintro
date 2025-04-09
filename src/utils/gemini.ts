import { FormData } from '../context/FormContext';

// This function reuses the same prompt generation logic from openai.ts
import { generatePrompt } from './openai';

/**
 * Generates a self-introduction by calling the Google Gemini API
 */
export const generateGeminiSelfIntro = async (
  formData: FormData, 
  apiKey: string,
  modelId: string = 'gemini-pro',
  maxTokens: number = 1500
): Promise<string> => {
  try {
    // Use the same prompt generation logic as OpenAI
    const prompt = generatePrompt(formData);
    
    // 獲取系統提示詞
    let systemPrompt = '你是一個專業的人力資源專家，專注於協助面試者撰寫、改善及優化他們「面試時使用」的「自我介紹講稿」。';
    
    // 如果使用自定義提示詞模板並且有設定系統提示詞，則使用自定義的系統提示詞
    if (formData.generationSettings.useCustomPrompt && 
        formData.generationSettings.activePromptId && 
        formData.generationSettings.promptTemplates[formData.generationSettings.activePromptId]?.systemPrompt) {
      systemPrompt = formData.generationSettings.promptTemplates[formData.generationSettings.activePromptId].systemPrompt || systemPrompt;
    }
    
    // 組合系統提示詞和用戶提示詞
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    // Determine the API endpoint based on the model ID
    let endpoint = '';
    if (modelId === 'gemini-pro') {
      endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    } else if (modelId === 'gemini-1.5-pro' || modelId === 'gemini-1.5-flash') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else if (modelId === 'gemini-2.0-flash' || modelId === 'gemini-2.0-flash-lite') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else {
      throw new Error(`不支持的 Gemini 模型: ${modelId}`);
    }
    
    // Set safety settings
    const safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ];
    
    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
          topP: 0.95,
          topK: 64
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API 錯誤: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract content from response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('生成的內容為空');
    }
    
    return generatedText;
  } catch (error) {
    // If there's a network error or API error
    throw new Error(`Gemini 生成失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 