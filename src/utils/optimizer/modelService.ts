import { ModelProvider } from '../../context/ApiKeyContext';
import { AudioAnalysisRequest, AudioAnalysisResult, generateAudioAnalysisPrompt, generateAudioOptimizationPrompt } from './promptService';

/**
 * Process audio analysis using OpenAI API
 */
const processOpenAIAnalysis = async (
  request: AudioAnalysisRequest,
  apiKey: string,
  modelId: string
): Promise<AudioAnalysisResult> => {
  try {
    const prompt = generateAudioAnalysisPrompt(request);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: '你是一位專業的演講分析師，專門評估自我介紹的表現並提供改進建議。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 錯誤: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('生成的內容為空');
    }
    
    // Parse the JSON response
    try {
      return JSON.parse(content) as AudioAnalysisResult;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('無法解析分析結果');
    }
  } catch (error) {
    console.error('Error processing OpenAI analysis:', error);
    throw new Error(`分析失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Process audio analysis using Gemini API
 */
const processGeminiAnalysis = async (
  request: AudioAnalysisRequest,
  apiKey: string,
  modelId: string
): Promise<AudioAnalysisResult> => {
  try {
    const prompt = generateAudioAnalysisPrompt(request);
    
    // Determine API endpoint based on the model ID
    let endpoint = '';
    if (modelId.startsWith('gemini-1.5')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else if (modelId.startsWith('gemini-2.0')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else {
      endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
    }
    
    // Call Gemini API
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!content) {
      throw new Error('生成的內容為空');
    }
    
    // Parse the JSON response
    try {
      return JSON.parse(content) as AudioAnalysisResult;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      throw new Error('無法解析分析結果');
    }
  } catch (error) {
    console.error('Error processing Gemini analysis:', error);
    throw new Error(`分析失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Process audio analysis based on model provider
 */
export const processAudioAnalysis = async (
  request: AudioAnalysisRequest,
  apiKey: string,
  modelId: string,
  modelProvider: ModelProvider
): Promise<AudioAnalysisResult> => {
  // For development/testing without making actual API calls
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    // Return mock data for testing
    console.log('Using mock data for audio analysis');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
    
    return {
      speechRate: 4.2,
      clarity: 85,
      confidence: 78,
      improvements: [
        '語速適中，但在介紹專業技能時可以稍微放慢，增加重點強調',
        '部分專業術語的發音可以更清晰，特別是在介紹技術背景時',
        '整體表現自信，但可以在結尾部分增加語調變化，展現更多熱情'
      ]
    };
  }
  
  // Call the appropriate API based on the provider
  if (modelProvider === 'openai') {
    return processOpenAIAnalysis(request, apiKey, modelId);
  } else {
    return processGeminiAnalysis(request, apiKey, modelId);
  }
};

/**
 * Generate optimization guidance using OpenAI API
 */
const generateOpenAIGuidance = async (
  request: AudioAnalysisRequest,
  analysisResult: AudioAnalysisResult,
  apiKey: string,
  modelId: string
): Promise<string> => {
  try {
    const prompt = generateAudioOptimizationPrompt(request, analysisResult);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: '你是一位專業的演講教練，專門幫助人們改善自我介紹的表現。請提供詳細且實用的建議和練習方法。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 錯誤: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('生成的內容為空');
    }
    
    return content;
  } catch (error) {
    console.error('Error generating OpenAI guidance:', error);
    throw new Error(`指導生成失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate optimization guidance using Gemini API
 */
const generateGeminiGuidance = async (
  request: AudioAnalysisRequest,
  analysisResult: AudioAnalysisResult,
  apiKey: string,
  modelId: string
): Promise<string> => {
  try {
    const prompt = generateAudioOptimizationPrompt(request, analysisResult);
    
    // Determine API endpoint based on the model ID
    let endpoint = '';
    if (modelId.startsWith('gemini-1.5')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else if (modelId.startsWith('gemini-2.0')) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    } else {
      endpoint = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;
    }
    
    // Call Gemini API
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!content) {
      throw new Error('生成的內容為空');
    }
    
    return content;
  } catch (error) {
    console.error('Error generating Gemini guidance:', error);
    throw new Error(`指導生成失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate optimization guidance based on model provider
 */
export const processOptimizationGuidance = async (
  request: AudioAnalysisRequest,
  analysisResult: AudioAnalysisResult,
  apiKey: string,
  modelId: string,
  modelProvider: ModelProvider
): Promise<string> => {
  // For development/testing without making actual API calls
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    // Return mock data for testing
    console.log('Using mock data for optimization guidance');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API delay
    
    return `
# 自我介紹優化指南

## 評分摘要
- 語速：${analysisResult.speechRate}/5 - 整體良好
- 清晰度：${analysisResult.clarity}/100 - 表現優良
- 自信度：${analysisResult.confidence}/100 - 有提升空間

## 改進建議與練習方法

### 1. ${analysisResult.improvements[0]}
練習方法：
- 朗讀練習：選擇一段專業文章，刻意放慢介紹關鍵概念的部分，使用錄音功能記錄並比較不同語速的效果
- 重點標記：在自我介紹稿中標記需要強調的關鍵詞，在這些詞前稍作停頓

${analysisResult.improvements[1] ? `
### 2. ${analysisResult.improvements[1]}
練習方法：
- 發音練習：列出自我介紹中的專業術語，反覆練習其發音，可使用線上發音工具作為參考
- 錄音回聽：錄下自己說這些術語的聲音，聽出不清晰的部分並加強練習
` : ''}

${analysisResult.improvements[2] ? `
### 3. ${analysisResult.improvements[2]}
練習方法：
- 情感練習：嘗試用不同的情緒（熱情、堅定、親切）朗讀結尾部分，找出最適合的表達方式
- 語調變化：在結尾處增加音調的起伏，強調自己的熱情和對機會的期待
` : ''}

## 優化後的自我介紹範本

您好，我是[姓名]，目前擔任[職位]，擁有[X]年的[領域]經驗。

在我的職業生涯中，我專注於[專業領域]的發展，並在[公司/項目]中取得了[具體成就]。我精通[技能1]和[技能2]，並且熟悉[技能3]。

[中間部分根據原稿調整]

我相信我的專業背景和熱情能為貴公司帶來價值。我期待有機會進一步討論如何將我的經驗與貴公司的需求相結合。謝謝！
    `;
  }
  
  // Call the appropriate API based on the provider
  if (modelProvider === 'openai') {
    return generateOpenAIGuidance(request, analysisResult, apiKey, modelId);
  } else {
    return generateGeminiGuidance(request, analysisResult, apiKey, modelId);
  }
}; 