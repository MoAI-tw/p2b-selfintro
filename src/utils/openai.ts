import { FormData } from '../context/FormContext';

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get environment variables with defaults
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo';
const MAX_TOKENS = parseInt(import.meta.env.VITE_MAX_TOKENS || '1500', 10);

// Function to generate prompt based on form data
export const generatePrompt = (formData: FormData): string => {
  const { personalInfo, industrySettings, generationSettings } = formData;
  
  // Map degree values to readable text
  const degreeMap: Record<string, string> = {
    'high_school': '高中',
    'associate': '專科',
    'bachelor': '學士',
    'master': '碩士',
    'phd': '博士'
  };
  
  // Map skill level values to readable text
  const skillLevelMap: Record<string, string> = {
    'beginner': '入門',
    'intermediate': '中級',
    'advanced': '進階',
    'expert': '專家'
  };

  // Format education information
  const educationText = personalInfo.education
    .filter(edu => edu.school.trim() !== '')
    .map(edu => {
      const degree = degreeMap[edu.degree] || edu.degree;
      return `${edu.school}${edu.major ? `，${edu.major}` : ''}${degree ? `，${degree}` : ''}${edu.graduationYear ? `，${edu.graduationYear}年畢業` : ''}`;
    })
    .join('；');

  // Format work experience information
  const workExperienceText = personalInfo.workExperience
    .filter(work => work.company.trim() !== '')
    .map(work => {
      const period = work.startDate ? 
        `${work.startDate.replace('-', '年')}月至${work.isCurrent ? '現在' : work.endDate ? work.endDate.replace('-', '年') + '月' : ''}` : '';
      return `${work.company}，${work.position}${period ? `，${period}` : ''}${work.description ? `，${work.description}` : ''}`;
    })
    .join('；');

  // Format skills information
  const skillsText = personalInfo.skills
    .filter(skill => skill.name.trim() !== '')
    .map(skill => {
      const level = skillLevelMap[skill.level] || skill.level;
      return skill.level ? `${skill.name}（${level}）` : skill.name;
    })
    .join('、');

  // Build base prompt
  let prompt = '';
  
  if (generationSettings.useCustomPrompt && generationSettings.promptTemplate) {
    // Use custom prompt template if specified
    prompt = generationSettings.promptTemplate
      .replace('{duration}', generationSettings.customDuration || generationSettings.duration)
      .replace('{language}', generationSettings.language)
      .replace('{style}', generationSettings.style)
      .replace('{industry}', industrySettings.industry || '')
      .replace('{job_position}', industrySettings.specificPosition || '')
      .replace('{keywords}', industrySettings.keywords.join('、'));
  } else {
    // Build standard prompt
    prompt = `請根據以下資訊生成一份專業的${industrySettings.specificPosition || ''}自我介紹，`;
    
    // Time duration
    prompt += `時間約為${generationSettings.customDuration || generationSettings.duration}秒，`;
    
    // Language
    prompt += `使用${generationSettings.language}，`;
    
    // Style and tone
    prompt += `風格為${generationSettings.style}，語調${generationSettings.tone}，`;
    
    // Focus areas
    if (industrySettings.focusAreas && industrySettings.focusAreas.length > 0) {
      prompt += `重點突出${industrySettings.focusAreas.join('、')}，`;
    }
    
    // Keywords
    if (industrySettings.keywords && industrySettings.keywords.length > 0) {
      prompt += `並強調以下關鍵詞：${industrySettings.keywords.join('、')}。`;
    }
    
    // Structure
    prompt += `\n\n自我介紹結構要求：`;
    switch (generationSettings.structure) {
      case 'skills_first':
        prompt += '先介紹專業技能和經驗，再提及學歷背景。';
        break;
      case 'education_first':
        prompt += '先介紹學歷背景，再提及專業技能和經驗。';
        break;
      case 'chronological':
        prompt += '按時間順序介紹學歷和經驗。';
        break;
      case 'achievement_focused':
        prompt += '以成就和項目為主要結構。';
        break;
      default:
        prompt += '結構合理，重點突出。';
    }
    
    // Output length
    prompt += `\n輸出長度：${generationSettings.outputLength}。`;
    
    // Additional requirements
    if (generationSettings.highlightStrengths) {
      prompt += '\n請特別強調我的優勢和特長。';
    }
    if (generationSettings.includeCallToAction) {
      prompt += '\n在結尾加入呼籲行動的語句。';
    }
    if (generationSettings.focusOnRecentExperience) {
      prompt += '\n請著重於我最近的經驗。';
    }
  }
  
  // Add personal information
  prompt += `\n\n個人資料：
姓名：${personalInfo.name}
${personalInfo.age ? `年齡：${personalInfo.age}` : ''}
${educationText ? `學歷：${educationText}` : ''}
${workExperienceText ? `工作經驗：${workExperienceText}` : ''}
${skillsText ? `專業技能：${skillsText}` : ''}
${personalInfo.projects ? `項目經歷：${personalInfo.projects}` : ''}
${personalInfo.awards ? `獲獎記錄：${personalInfo.awards}` : ''}
${personalInfo.interests ? `興趣愛好：${personalInfo.interests}` : ''}`;

  // Add industry context
  if (industrySettings.industry || industrySettings.jobCategory || industrySettings.specificPosition) {
    prompt += `\n\n目標產業和職位：
${industrySettings.industry ? `產業：${industrySettings.industry}` : ''}
${industrySettings.jobCategory ? `職業類別：${industrySettings.jobCategory}` : ''}
${industrySettings.jobSubcategory ? `職業細類：${industrySettings.jobSubcategory}` : ''}
${industrySettings.specificPosition ? `特定職位：${industrySettings.specificPosition}` : ''}
${industrySettings.occasionType ? `場合類型：${industrySettings.occasionType}` : ''}`;
  }
  
  return prompt;
};

// Function to call OpenAI API to generate self-introduction
export const generateSelfIntro = async (
  formData: FormData, 
  apiKey?: string,
  modelId: string = 'gpt-4o'
): Promise<{ content: string; prompt?: string; error?: string }> => {
  try {
    // Use provided API key or fall back to environment variable
    const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!key) {
      return {
        content: '',
        error: 'OpenAI API Key 未設定。請聯繫管理員或在環境變數中設定 VITE_OPENAI_API_KEY。'
      };
    }
    
    const prompt = generatePrompt(formData);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: '你是一位專業的自我介紹生成助手，能夠根據個人資料和目標職位生成量身訂製的自我介紹。請確保內容符合用戶的目標場景和風格要求。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API 請求失敗');
    }

    return { 
      content: data.choices[0].message.content.trim(),
      prompt: prompt 
    };
  } catch (error) {
    console.error('生成自我介紹時出錯：', error);
    return { 
      content: '', 
      error: error instanceof Error ? error.message : '未知錯誤' 
    };
  }
}; 