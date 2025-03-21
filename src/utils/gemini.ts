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
    
    // Determine the API endpoint based on the model ID
    let endpoint = '';
    if (modelId === 'gemini-pro') {
      endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    } else if (modelId === 'gemini-1.5-pro') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
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
                text: prompt
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