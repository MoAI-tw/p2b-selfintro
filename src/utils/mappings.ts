/**
 * Maps degree code values to human-readable text
 */
export const mapDegreesToText = (degree: string): string => {
  const degreeMap: Record<string, string> = {
    'high_school': '高中',
    'associate': '專科',
    'bachelor': '學士',
    'master': '碩士',
    'phd': '博士',
    'other': '其他'
  };
  
  return degreeMap[degree] || degree;
};

/**
 * Maps skill level code values to human-readable text
 */
export const mapSkillLevelToText = (level: string): string => {
  const skillLevelMap: Record<string, string> = {
    'beginner': '入門',
    'intermediate': '中級',
    'advanced': '進階',
    'expert': '專家'
  };
  
  return skillLevelMap[level] || level;
}; 