import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faGraduationCap, faBriefcase, faTools, faStar, faSave, faPlusCircle, faArrowRight, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../components/ProgressBar';
import { useFormContext, Education, WorkExperience, Skill } from '../context/FormContext';
import Autocomplete from '../components/Autocomplete';
import { schools } from '../data/schools';
import { departments } from '../data/departments';
import { companies } from '../data/companies';
import { jobPositions } from '../data/jobPositions';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updatePersonalInfo, addEducation, removeEducation, addWorkExperience, removeWorkExperience, addSkill, removeSkill } = useFormContext();
  const [projectTitle, setProjectTitle] = useState('我的自介專案');
  const [hasChanges, setHasChanges] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  
  // Track changes to enable/disable save button
  useEffect(() => {
    setHasChanges(true);
  }, [formData.personalInfo, projectTitle]);

  // Validate project title when it changes
  useEffect(() => {
    setTitleError(projectTitle.trim() === '');
  }, [projectTitle]);

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...formData.personalInfo.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    updatePersonalInfo({ education: updatedEducation });
  };

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updatedWorkExperience = [...formData.personalInfo.workExperience];
    updatedWorkExperience[index] = { ...updatedWorkExperience[index], [field]: value };
    updatePersonalInfo({ workExperience: updatedWorkExperience });
  };

  const handleSkillChange = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...formData.personalInfo.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    updatePersonalInfo({ skills: updatedSkills });
  };

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setProjectTitle(newTitle);
    setTitleError(newTitle.trim() === '');
  };

  const handleSave = async () => {
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get existing projects from localStorage
      const storedProjects = localStorage.getItem('projects');
      let projects = [];
      
      if (storedProjects) {
        projects = JSON.parse(storedProjects);
      }
      
      // Check if we're editing an existing project
      const searchParams = new URLSearchParams(location.search);
      const projectId = searchParams.get('id');
      let existingProject = null;
      
      if (projectId) {
        existingProject = projects.find((project: { id: number }) => project.id.toString() === projectId);
      }
      
      if (existingProject) {
        // Update existing project
        const updatedProjects = projects.map((project: any) => {
          if (project.id.toString() === projectId) {
            return {
              ...project,
              title: projectTitle,
              lastEdited: new Date().toLocaleDateString(),
              formData: {
                personalInfo: formData.personalInfo,
                industrySettings: project.formData?.industrySettings || formData.industrySettings,
                generationSettings: project.formData?.generationSettings || formData.generationSettings
              }
            };
          }
          return project;
        });
        
        // Save back to localStorage
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        // Alert user
        alert('專案已更新！');
        setHasChanges(false);
      } else {
        // Check for duplicate project titles and generate a unique title if needed
        let uniqueTitle = projectTitle;
        let counter = 1;
        
        while (projects.some((project: { title: string }) => project.title === uniqueTitle)) {
          uniqueTitle = `${projectTitle} (${counter})`;
          counter++;
        }
        
        // If title was modified, update the displayed title
        if (uniqueTitle !== projectTitle) {
          setProjectTitle(uniqueTitle);
        }
        
        // Create a new project with the unique title
        const projectData = {
          id: Date.now(), // Generate a unique ID based on timestamp
          title: uniqueTitle,
          status: 'draft',
          lastEdited: new Date().toLocaleDateString(),
          description: '自我介紹專案',
          formData: {
            personalInfo: formData.personalInfo,
            industrySettings: formData.industrySettings,
            generationSettings: formData.generationSettings
          }
        };
        
        // Add the new project to the array
        projects.push(projectData);
        
        // Save back to localStorage
        localStorage.setItem('projects', JSON.stringify(projects));
        
        // Alert user
        alert('專案已儲存！');
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectTitle.trim() === '') {
      setTitleError(true);
      return;
    }

    // Validate required fields
    const requiredFieldsErrors = [];
    
    // Check personal info
    if (!formData.personalInfo.name.trim()) {
      requiredFieldsErrors.push('姓名');
    }
    
    // Check at least one education entry has required fields
    if (formData.personalInfo.education.length > 0) {
      const hasValidEducation = formData.personalInfo.education.some(
        edu => {
          const schoolValid = edu.school && edu.school.trim && edu.school.trim();
          const degreeValid = edu.degree && edu.degree.trim && edu.degree.trim();
          const majorValid = edu.major && edu.major.trim && edu.major.trim();
          return schoolValid && degreeValid && majorValid;
        }
      );
      
      if (!hasValidEducation) {
        requiredFieldsErrors.push('至少一筆完整的學歷資料（學校、學位、主修）');
      }
    }
    
    // Check at least one work experience has required fields
    if (formData.personalInfo.workExperience.length > 0) {
      const hasValidWorkExperience = formData.personalInfo.workExperience.some(
        exp => {
          const companyValid = exp.company && exp.company.trim && exp.company.trim();
          const positionValid = exp.position && exp.position.trim && exp.position.trim();
          const startDateValid = exp.startDate && exp.startDate.trim && exp.startDate.trim();
          return companyValid && positionValid && (startDateValid || exp.isCurrent);
        }
      );
      
      if (!hasValidWorkExperience) {
        requiredFieldsErrors.push('至少一筆完整的工作經驗（公司、職位、開始日期）');
      }
    }
    
    // Check at least one skill is entered
    if (formData.personalInfo.skills.length > 0) {
      const hasValidSkill = formData.personalInfo.skills.some(
        skill => skill.name && skill.name.trim && skill.name.trim()
      );
      
      if (!hasValidSkill) {
        requiredFieldsErrors.push('至少一項技能');
      }
    }
    
    // If there are validation errors, show them and prevent navigation
    if (requiredFieldsErrors.length > 0) {
      // Set validation errors
      setValidationErrors(requiredFieldsErrors);
      // Show validation error modal
      setShowValidationErrorModal(true);
      return;
    }
    
    navigate(`/industry?project_name=${encodeURIComponent(projectTitle)}`);
  };

  useEffect(() => {
    // 處理 URL 參數載入專案的邏輯
    const searchParams = new URLSearchParams(location.search);
    const nameFromUrl = searchParams.get('project_name');
    const idFromUrl = searchParams.get('id');
    
    if (nameFromUrl) {
      setProjectTitle(nameFromUrl);
    } else if (idFromUrl) {
      // 載入專案邏輯
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        try {
          const projects = JSON.parse(storedProjects);
          const project = projects.find((p: any) => p.id.toString() === idFromUrl);
          
          if (project) {
            console.log('Loading project data:', project);
            setProjectTitle(project.title);
            
            // 載入專案的表單資料
            if (project.formData?.personalInfo) {
              console.log('Found personal info:', project.formData.personalInfo);
              
              // 確保工作經驗欄位都有效
              let personalInfoToUpdate = { ...project.formData.personalInfo };
              
              // 設置基本資料
              updatePersonalInfo(personalInfoToUpdate);
              
              // 如果沒有教育資料，添加一個空的教育經歷
              if (!Array.isArray(personalInfoToUpdate.education) || personalInfoToUpdate.education.length === 0) {
                addEducation();
              }
              
              // 如果沒有工作經驗，添加一個空的工作經驗
              if (!Array.isArray(personalInfoToUpdate.workExperience) || personalInfoToUpdate.workExperience.length === 0) {
                addWorkExperience();
              }
              
              // 如果沒有技能資料，添加一個空的技能
              if (!Array.isArray(personalInfoToUpdate.skills) || personalInfoToUpdate.skills.length === 0) {
                addSkill();
              }
            }
          }
        } catch (error) {
          console.error('Error parsing stored projects:', error);
        }
      }
    }
  }, [location]);

  return (
    <div className="bg-gray-50">
      {/* 頂部導航區 */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative">
                <input 
                  type="text" 
                  id="project_title" 
                  className={`text-xl font-semibold text-gray-800 focus:outline-none border-b border-transparent focus:border-indigo-500 px-1 ${titleError ? 'border-red-500 text-red-500' : ''}`}
                  value={projectTitle}
                  onChange={handleProjectTitleChange}
                  placeholder="請輸入專案名稱"
                />
                {titleError && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-xs flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                    專案名稱不能為空
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                id="save_btn" 
                disabled={!hasChanges || titleError || isSaving}
                onClick={handleSave}
                className={`px-4 py-1.5 rounded-full flex items-center text-sm transition-all duration-200 ${
                  hasChanges && !titleError && !isSaving
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isSaving ? '儲存中...' : '儲存'}
              </button>
              <Link to="/projects" className="text-gray-600 hover:text-indigo-600 flex items-center">
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                關閉
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ProgressBar currentStep={1} />

      {/* 主要內容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">填寫個人資料</h1>
          <p className="text-gray-600 mb-8">請填寫以下資料，以便生成符合您需求的自我介紹</p>
          
          <form onSubmit={handleSubmit}>
            {/* 基本資料 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserCircle} className="text-indigo-600 mr-2" />基本資料
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">姓名 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    value={formData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo({ name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="請輸入您的姓名" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="age" className="block text-gray-700 font-medium mb-2">年齡</label>
                  <input 
                    type="number" 
                    id="age" 
                    value={formData.personalInfo.age}
                    onChange={(e) => updatePersonalInfo({ age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="請輸入您的年齡" 
                  />
                </div>
              </div>
            </div>
            
            {/* 學歷 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600 mr-2" />學歷 <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-4">
                {formData.personalInfo.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <span className="sr-only">移除</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">學校名稱</label>
                        <Autocomplete
                          suggestions={schools}
                          value={edu.school}
                          onChange={(value) => handleEducationChange(index, 'school', value)}
                          placeholder="請輸入學校名稱"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">學位</label>
                        <select 
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">請選擇學位</option>
                          <option value="高中">高中</option>
                          <option value="專科">專科</option>
                          <option value="學士">學士</option>
                          <option value="碩士">碩士</option>
                          <option value="博士">博士</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">科系 / 專業</label>
                        <Autocomplete
                          suggestions={departments}
                          value={edu.major}
                          onChange={(value) => handleEducationChange(index, 'major', value)}
                          placeholder="請輸入科系或專業"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">畢業年份</label>
                        <input 
                          type="number" 
                          value={edu.graduationYear}
                          onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                          placeholder="例：2022" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addEducation}
                  className="text-indigo-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />新增學歷
                </button>
              </div>
            </div>
            
            {/* 工作經驗 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="text-indigo-600 mr-2" />工作經驗 <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-4">
                {formData.personalInfo.workExperience.map((work, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeWorkExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <span className="sr-only">移除</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">公司名稱</label>
                        <Autocomplete
                          suggestions={companies}
                          value={work.company}
                          onChange={(value) => handleWorkExperienceChange(index, 'company', value)}
                          placeholder="請輸入公司名稱"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">職位</label>
                        <Autocomplete
                          suggestions={jobPositions}
                          value={work.position}
                          onChange={(value) => handleWorkExperienceChange(index, 'position', value)}
                          placeholder="請輸入職位名稱"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">開始日期</label>
                        <input 
                          type="month" 
                          value={work.startDate}
                          onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">結束日期</label>
                        <input 
                          type="month" 
                          value={work.endDate}
                          onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled={work.isCurrent} 
                        />
                        <div className="mt-2">
                          <input 
                            type="checkbox" 
                            id={`current_job_${index}`} 
                            checked={work.isCurrent}
                            onChange={(e) => handleWorkExperienceChange(index, 'isCurrent', e.target.checked)}
                            className="mr-2" 
                          />
                          <label htmlFor={`current_job_${index}`} className="text-gray-700">我目前在此工作</label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-700 font-medium mb-2">工作描述</label>
                      <textarea 
                        value={work.description}
                        onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        rows={3} 
                        placeholder="請簡述您的主要職責和成就"
                      ></textarea>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addWorkExperience}
                  className="text-indigo-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />新增工作經驗
                </button>
              </div>
            </div>
            
            {/* 專業技能 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faTools} className="text-indigo-600 mr-2" />專業技能 <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-4">
                {formData.personalInfo.skills.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {index > 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeSkill(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <span className="sr-only">移除</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">技能名稱</label>
                        <input 
                          type="text" 
                          value={skill.name}
                          onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                          placeholder="例：Python 程式設計" 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">熟練程度</label>
                        <select 
                          value={skill.level}
                          onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">請選擇熟練程度</option>
                          <option value="beginner">入門</option>
                          <option value="intermediate">中級</option>
                          <option value="advanced">進階</option>
                          <option value="expert">專家</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addSkill}
                  className="text-indigo-600 flex items-center"
                >
                  <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />新增技能
                </button>
              </div>
            </div>
            
            {/* 選填資訊 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faStar} className="text-indigo-600 mr-2" />其他補充資訊 <span className="text-gray-500 text-sm font-normal ml-2">(選填)</span>
              </h2>
              
              {/* 項目經歷 */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">項目經歷</label>
                <textarea 
                  value={formData.personalInfo.projects}
                  onChange={(e) => updatePersonalInfo({ projects: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  rows={3} 
                  placeholder="請描述您參與過的重要項目，包括您的角色和成果"
                ></textarea>
              </div>
              
              {/* 獲獎記錄 */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">獲獎記錄</label>
                <textarea 
                  value={formData.personalInfo.awards}
                  onChange={(e) => updatePersonalInfo({ awards: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  rows={2} 
                  placeholder="請列出您獲得過的獎項或榮譽"
                ></textarea>
              </div>
              
              {/* 興趣愛好 */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">興趣愛好</label>
                <textarea 
                  value={formData.personalInfo.interests}
                  onChange={(e) => updatePersonalInfo({ interests: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  rows={2} 
                  placeholder="請分享您的興趣愛好，有助於展現個人特色"
                ></textarea>
              </div>
            </div>
            
            {/* 提交按鈕 */}
            <div className="flex justify-between">
              <Link to="/projects" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">取消</Link>
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
              >
                下一步：產業設置
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* 頁腳 */}
      <footer className="bg-gray-100 text-gray-600 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>© 2025 自介達人. 保留所有權利。</p>
          </div>
        </div>
      </footer>

      {/* Add validation error modal */}
      {showValidationErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              個人資料未完成
            </h3>
            <p className="text-gray-600 mb-4">在繼續前，請完成以下必填資料：</p>
            <ul className="list-disc pl-5 mb-4 text-gray-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowValidationErrorModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 