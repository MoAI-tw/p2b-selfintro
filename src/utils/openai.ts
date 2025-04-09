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
  // 直接從formData訪問嵌套數據，避免類型錯誤
  
  // 格式化教育背景
  const formattedEducation = formData.personalInfo.education.map(edu => {
    return `- ${edu.degree ? mapDegreesToText(edu.degree) : '學位'}: ${edu.school}${edu.major ? `，專業：${edu.major}` : ''}${edu.graduationYear ? `，${edu.graduationYear}` : ''}`;
  }).join('\n');
  
  // 格式化技能
  const formattedSkills = formData.personalInfo.skills.map(skill => {
    return `- ${skill.name}: ${mapSkillLevelToText(skill.level)}`;
  }).join('\n');
  
  // 格式化工作經驗
  const formattedWorkExperience = formData.personalInfo.workExperience.map(exp => {
    const duration = exp.isCurrent
      ? `${exp.startDate} 至今`
      : `${exp.startDate} - ${exp.endDate}`;
    
    return `- ${exp.company}${exp.position ? `，職位：${exp.position}` : ''}${duration ? `，時間：${duration}` : ''}${exp.description ? `\n  描述：${exp.description}` : ''}`;
  }).join('\n');
  
  // 使用實際職位信息，優先使用specificPosition
  const jobPosition = formData.industrySettings.specificPosition || '';
  
  // 格式化關鍵詞
  const formattedKeywords = formData.industrySettings.keywords && formData.industrySettings.keywords.length > 0 
    ? formData.industrySettings.keywords.join('、') 
    : '';
  
  // 格式化重點領域
  const formattedFocusAreas = formData.industrySettings.focusAreas && formData.industrySettings.focusAreas.length > 0
    ? formData.industrySettings.focusAreas.join('、')
    : '';
  
  // 檢查是否使用自定義提示詞模板
  if (formData.generationSettings.useCustomPrompt && formData.generationSettings.promptTemplate) {
    console.log('[GENERATE_PROMPT] 使用自定義提示詞模板');
    
    // 創建變數映射對象
    const variables: Record<string, string> = {
      'name': formData.personalInfo.name || '',
      'age': formData.personalInfo.birthday ? new Date().getFullYear() - new Date(formData.personalInfo.birthday).getFullYear() + '歲' : '',
      'location': '', // 如果您的表單中有location字段，則添加它
      'education': formattedEducation,
      'skills': formattedSkills,
      'experience': formattedWorkExperience,
      'industry': formData.industrySettings.industry || '',
      'job_position': jobPosition,
      'language': formData.generationSettings.language || 'Chinese',
      'tone': formData.generationSettings.tone || 'Professional',
      'length': formData.generationSettings.outputLength || 'Medium',
      'duration': formData.generationSettings.duration || '60',
      'target_audience': '', // 如果您的表單中有targetAudience字段，則添加它
      'keywords': formattedKeywords,
      'focus_areas': formattedFocusAreas,
      'projects': formData.personalInfo.projects || '',
      'style': formData.generationSettings.style || 'balanced'
    };
    
    console.log('[GENERATE_PROMPT] 使用的模板變數:', {
      industry: formData.industrySettings.industry,
      job_position: jobPosition,
      language: formData.generationSettings.language, 
      duration: formData.generationSettings.duration,
      keywords: formattedKeywords,
      style: formData.generationSettings.style
    });
    
    // 替換模板中的變數
    let finalPrompt = formData.generationSettings.promptTemplate;
    Object.entries(variables).forEach(([key, value]) => {
      finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), value || '');
    });
    
    return finalPrompt;
  }
  
  // 如果沒有使用自定義模板，則使用預設提示詞格式
  let prompt = `請幫我寫一份自我介紹`;
  
  if (jobPosition) {
    prompt += `，應徵職位是${jobPosition}`;
  }
  
  if (formData.industrySettings.industry) {
    prompt += `，目標行業是${formData.industrySettings.industry}`;
  }
  
  prompt += `。\n\n個人資料：`;
  
  if (formData.personalInfo.name) prompt += `\n- 姓名：${formData.personalInfo.name}`;
  // 計算年齡並顯示
  if (formData.personalInfo.birthday) {
    const age = new Date().getFullYear() - new Date(formData.personalInfo.birthday).getFullYear();
    prompt += `\n- 年齡：${age}歲`;
  }
  
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
  prompt += `\n- 語言：${formData.generationSettings.language || 'Chinese'}`;
  prompt += `\n- 語調：${formData.generationSettings.tone || 'Professional'}`;
  prompt += `\n- 長度：${formData.generationSettings.outputLength || 'Medium'}`;
  prompt += `\n- 時長：${formData.generationSettings.duration || '60'} 秒`;
  prompt += `\n- 風格：${formData.generationSettings.style || 'balanced'}`;
  
  if (formattedFocusAreas) {
    prompt += `\n- 重點突出：${formattedFocusAreas}`;
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
    
    // 獲取系統提示詞
    let systemPrompt = '你是一個專業的人力資源專家，專注於協助面試者撰寫、改善及優化他們「面試時使用」的「自我介紹講稿」。你會使用問答的方式，從使用者的回答中獲得你需要的資訊，最後生成一段完整的「面試用自我介紹」。以台灣企業為主，以繁體中文問答。當使用問答模式時，一次只詢問一個問題，避免一次詢問多個問題。';
    
    // 如果使用自定義提示詞模板並且有設定系統提示詞，則使用自定義的系統提示詞
    if (formData.generationSettings.useCustomPrompt && 
        formData.generationSettings.activePromptId && 
        formData.generationSettings.promptTemplates[formData.generationSettings.activePromptId]?.systemPrompt) {
      systemPrompt = formData.generationSettings.promptTemplates[formData.generationSettings.activePromptId].systemPrompt || systemPrompt;
    }
  
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
            content: systemPrompt
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