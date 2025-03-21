import { FormData } from '../context/FormContext';
import { mapDegreesToText, mapSkillLevelToText } from './mappings';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generates a prompt for creating a self-introduction based on form data
 */
export const generatePrompt = (formData: FormData): string => {
  // Extract input values from form data
  const { 
    personalInfo = {}, 
    industrySettings = {},
    generationSettings = {} 
  } = formData;
  
  const {
    name = '',
    age = '',
    location = '',
    education = [],
    skills = [],
    workExperience = []
  } = personalInfo;
  
  const { 
    industry = '', 
    jobTitle = '', 
    targetAudience = '', 
    purpose = ''
  } = industrySettings;
  
  const {
    tone = '專業',
    length = '中等',
    language = '繁體中文',
    includeHeader = true,
    focusAreas = []
  } = generationSettings;
  
  // Map education degrees to readable text
  const formattedEducation = education.map(edu => {
    return `- ${edu.degree ? mapDegreesToText(edu.degree) : '學位'}: ${edu.school}${edu.major ? `，專業：${edu.major}` : ''}${edu.year ? `，${edu.year}` : ''}`;
  }).join('\n');
  
  // Map skill levels to readable text
  const formattedSkills = skills.map(skill => {
    return `- ${skill.name}: ${mapSkillLevelToText(skill.level)}`;
  }).join('\n');
  
  // Format work experience
  const formattedWorkExperience = workExperience.map(exp => {
    return `- ${exp.company}${exp.position ? `，職位：${exp.position}` : ''}${exp.duration ? `，時間：${exp.duration}` : ''}${exp.description ? `\n  描述：${exp.description}` : ''}`;
  }).join('\n');
  
  // Construct prompt based on user inputs
  let prompt = `請幫我寫一份${purpose ? `用於${purpose}的` : ''}自我介紹`;
  
  if (jobTitle) {
    prompt += `，應徵職位是${jobTitle}`;
  }
  
  if (industry) {
    prompt += `，目標行業是${industry}`;
  }
  
  prompt += `。\n\n個人資料：`;
  
  if (name) prompt += `\n- 姓名：${name}`;
  if (age) prompt += `\n- 年齡：${age}`;
  if (location) prompt += `\n- 所在地：${location}`;
  
  // Education information
  if (formattedEducation) {
    prompt += `\n\n教育背景：\n${formattedEducation}`;
  }
  
  // Skills information
  if (formattedSkills) {
    prompt += `\n\n技能專長：\n${formattedSkills}`;
  }
  
  // Work experience information
  if (formattedWorkExperience) {
    prompt += `\n\n工作經驗：\n${formattedWorkExperience}`;
  }
  
  // Additional requirements
  prompt += `\n\n要求：`;
  prompt += `\n- 語言：${language}`;
  prompt += `\n- 語調：${tone}`;
  prompt += `\n- 長度：${length}`;
  
  if (targetAudience) {
    prompt += `\n- 目標讀者：${targetAudience}`;
  }
  
  if (includeHeader) {
    prompt += `\n- 需要包含標題`;
  }
  
  if (focusAreas && focusAreas.length > 0) {
    prompt += `\n- 重點突出：${focusAreas.join('、')}`;
  }
  
  prompt += `\n\n請直接給我完整的自我介紹文本，不要包含任何解釋或前言後語。`;
  
  return prompt;
};

/**
 * Generates a self-introduction by calling the OpenAI API
 */
export const generateSelfIntro = async (
  formData: FormData, 
  apiKey: string,
  modelId: string = 'gpt-3.5-turbo',
  maxTokens: number = 1500
): Promise<string> => {
  try {
    const prompt = generatePrompt(formData);
    
    // Get API endpoints
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  
    const response = await fetch(apiEndpoint, {
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
            content: '你是一位專業的自我介紹撰寫專家，可以根據用戶提供的信息撰寫出適合不同場合的自我介紹。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API 錯誤: ${errorData.error?.message || response.statusText}`);
    }
    
    const data: OpenAIResponse = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();
    
    if (!generatedText) {
      throw new Error('生成的內容為空');
    }
    
    return generatedText;
  } catch (error) {
    // If there's a network error or API error
    throw new Error(`OpenAI 生成失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}; 