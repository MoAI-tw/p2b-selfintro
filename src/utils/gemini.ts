import { FormData } from '../context/FormContext';

// This function reuses the same prompt generation logic from openai.ts
import { generatePrompt } from './openai';

/**
 * 生成自我介紹文本 - 使用 Google Gemini API
 * @param formData 用戶填寫的表單數據
 * @param apiKey Google Gemini API Key
 * @param modelId 選擇的 Gemini 模型 ID
 * @returns 生成的自我介紹文本或錯誤消息
 */
export const generateGeminiSelfIntro = async (
  formData: FormData,
  apiKey: string,
  modelId: string = 'gemini-2.0-flash'
) => {
  try {
    // 檢查 API Key 是否提供
    if (!apiKey) {
      return { error: 'Gemini API Key 未提供。請在設置中配置您的 API Key。' };
    }

    // 獲取用戶提示
    const prompt = generatePrompt(formData);
    
    // 構建 API URL，根據模型 ID 選擇正確的端點
    let apiUrl: string;
    
    // 為不同的 Gemini 版本選擇正確的 API 端點
    if (modelId.startsWith('gemini-2.0')) {
      // Gemini 2.0 系列使用最新的 v1beta API
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else if (modelId.startsWith('gemini-1.5') || modelId.startsWith('gemini-1.0')) {
      // Gemini 1.5 和 1.0 系列使用標準 v1 API
      apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
    } else if (modelId.startsWith('gemma-3')) {
      // Gemma 3 模型使用 v1beta API
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else {
      // 預設情況下使用 v1 API
      apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
    }
    
    // 獲取最大標記限制（如果環境變量中有設置）
    const maxTokens = parseInt(import.meta.env.VITE_MAX_TOKENS || '1500', 10);

    // 準備請求體
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: maxTokens,
        stopSequences: []
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ],
      systemInstruction: {
        role: 'system',
        parts: [{
          text: '你是一位專業的自我介紹撰寫助手，可以根據用戶提供的個人資料、教育背景、工作經驗和技能，生成優質的自我介紹。請確保內容流暢、專業，並突出用戶的優勢和能力。'
        }]
      }
    };

    // 發送 API 請求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // 處理響應
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API 錯誤:', errorData);
      return { 
        error: `Gemini API 錯誤: ${errorData.error?.message || '未知錯誤'}` 
      };
    }

    const result = await response.json();
    
    // 根據 API 響應的結構解析生成的文本
    let generatedText = '';
    
    // Gemini API 的響應結構可能根據版本不同而略有差異
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text;
      }
    } else if (result.promptFeedback && result.promptFeedback.blockReason) {
      // 處理可能的安全過濾
      return { 
        error: `提示被 Gemini 的安全過濾器阻止: ${result.promptFeedback.blockReason}`
      };
    }
    
    if (!generatedText) {
      return { error: '無法從 Gemini API 獲取生成的文本' };
    }

    return { content: generatedText, prompt };
  } catch (error) {
    console.error('調用 Gemini API 時發生錯誤:', error);
    return { 
      error: error instanceof Error ? error.message : '調用 Gemini API 時發生未知錯誤'
    };
  }
}; 