import { ModelProvider } from '../../context/ApiKeyContext';
import { processAudioAnalysis, processOptimizationGuidance } from './modelService';

/**
 * Interface for audio analysis results
 */
export interface AudioAnalysisResult {
  speechRate: number;  // 3-5 score
  clarity: number;     // 0-100 score
  confidence: number;  // 0-100 score
  improvements: string[];
}

/**
 * Interface for optimizer settings
 */
export interface OptimizerSettings {
  improveClarity: boolean;
  improveConfidence: boolean;
  adjustSpeed: boolean;
  enhanceStructure: boolean;
  reduceFillers: boolean;
}

/**
 * Interface for audio file metadata
 */
export interface AudioFile {
  name: string;
  size: number;
  duration: number;
  url: string;
  transcript?: string;
}

/**
 * Interface for audio analysis request
 */
export interface AudioAnalysisRequest {
  audioFile: AudioFile;
  transcript?: string;
  settings: OptimizerSettings;
}

/**
 * Generate a prompt for analyzing self-introduction audio
 */
export const generateAudioAnalysisPrompt = (request: AudioAnalysisRequest): string => {
  const { audioFile, transcript, settings } = request;
  
  let prompt = `請分析這段自我介紹語音的表現。`;
  
  if (transcript) {
    prompt += `\n\n語音轉錄文本：\n${transcript}`;
  }
  
  prompt += `\n\n需要評估的指標：`;
  prompt += `\n- 語速評分（3-5分）：評估說話速度是否適中，是否有助於聽眾理解。`;
  prompt += `\n- 清晰度（0-100分）：評估發音是否清晰，是否有咬字不清或模糊的情況。`;
  prompt += `\n- 自信度（0-100分）：評估表達是否自信，語調是否堅定有力。`;
  
  // Add specific evaluation areas based on settings
  prompt += `\n\n請特別關注以下方面：`;
  
  if (settings.improveClarity) {
    prompt += `\n- 發音清晰度：評估字詞發音是否清晰，咬字是否準確。`;
  }
  
  if (settings.improveConfidence) {
    prompt += `\n- 自信表現：評估語調是否自信，表達是否流利且有說服力。`;
  }
  
  if (settings.adjustSpeed) {
    prompt += `\n- 語速控制：評估說話速度是否適中，是否有過快或過慢的情況。`;
  }
  
  if (settings.enhanceStructure) {
    prompt += `\n- 結構組織：評估自我介紹的結構是否清晰，重點是否突出。`;
  }
  
  if (settings.reduceFillers) {
    prompt += `\n- 填充詞使用：評估是否過多使用「嗯」、「啊」等填充詞。`;
  }
  
  prompt += `\n\n請提供2-5條具體的改進建議，針對性指出可以提升的地方。`;
  
  prompt += `\n\n請按照以下JSON格式回覆，不要包含任何其他內容：
{
  "speechRate": 數字（3-5之間），
  "clarity": 數字（0-100之間），
  "confidence": 數字（0-100之間），
  "improvements": ["建議1", "建議2", ...]
}`;
  
  return prompt;
};

/**
 * Generate a prompt for optimizing self-introduction audio
 */
export const generateAudioOptimizationPrompt = (request: AudioAnalysisRequest, analysisResult: AudioAnalysisResult): string => {
  const { audioFile, transcript, settings } = request;
  
  let prompt = `請根據以下分析結果，提供優化這段自我介紹的具體建議和指導。`;
  
  if (transcript) {
    prompt += `\n\n語音轉錄文本：\n${transcript}`;
  }
  
  prompt += `\n\n分析結果：`;
  prompt += `\n- 語速評分：${analysisResult.speechRate}/5`;
  prompt += `\n- 清晰度：${analysisResult.clarity}/100`;
  prompt += `\n- 自信度：${analysisResult.confidence}/100`;
  
  prompt += `\n\n改進建議：`;
  analysisResult.improvements.forEach((improvement, index) => {
    prompt += `\n${index + 1}. ${improvement}`;
  });
  
  prompt += `\n\n請提供具體的練習方法和技巧，幫助改善以上問題。針對每個改進建議，提供1-2個實用的練習或技巧。`;
  
  prompt += `\n\n另外，請根據分析結果，重寫一份優化後的自我介紹文稿，作為參考範本。`;
  
  return prompt;
};

/**
 * Process audio analysis using either OpenAI or Gemini API
 */
export const analyzeAudio = async (
  request: AudioAnalysisRequest,
  apiKey: string,
  modelId: string,
  modelProvider: ModelProvider
): Promise<AudioAnalysisResult> => {
  try {
    return await processAudioAnalysis(request, apiKey, modelId, modelProvider);
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw new Error(`音頻分析失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate optimization guidance using either OpenAI or Gemini API
 */
export const generateOptimizationGuidance = async (
  request: AudioAnalysisRequest,
  analysisResult: AudioAnalysisResult,
  apiKey: string,
  modelId: string,
  modelProvider: ModelProvider
): Promise<string> => {
  try {
    return await processOptimizationGuidance(request, analysisResult, apiKey, modelId, modelProvider);
  } catch (error) {
    console.error('Error generating optimization guidance:', error);
    throw new Error(`優化指南生成失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 