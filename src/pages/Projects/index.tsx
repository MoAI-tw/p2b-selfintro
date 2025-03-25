import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faPlus, faPen, faEye, faTrash, faSearch, faClone, faLightbulb, faHistory } from '@fortawesome/free-solid-svg-icons';
import { sampleProjects } from '../../data/sampleProjects';
import { v4 as uuidv4 } from 'uuid';

// 定義專案數據結構
interface Project {
  id: number | string;
  title: string;
  status: string;
  lastEdited: string;
  description: string;
  modelProvider?: string;
  modelId?: string;
  formData?: any;
}

// Mock project data for demonstration
const initialProjects: Project[] = [
];

// 從 sampleProjects.ts 引入型別
interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface SampleProject {
  id: string;
  title: string;
  status: string;
  lastEdited: string;
  description: string;
  formData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      education: string[];
      workExperience: WorkExperience[];
      skills: string[];
      interests: string[];
      additionalInfo?: string;
    };
    industrySettings: {
      jobCategory: string;
      jobSubcategory: string;
      specificPosition?: string;
      keywords: string[];
      focusAreas?: string[];
    };
    generationSettings: {
      tone: string;
      outputLength: string;
      language: string;
      highlightStrengths: boolean;
      includeCallToAction: boolean;
      focusOnRecentExperience: boolean;
    };
  };
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleProjects, setShowSampleProjects] = useState(false);
  const projectsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load projects from localStorage when component mounts or when navigating back to this page
  const loadProjectsFromStorage = () => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        // 確保解析後的資料是陣列
        if (Array.isArray(parsedProjects)) {
          setProjects(parsedProjects);
        } else {
          console.error('Stored projects is not an array, resetting to empty array');
          setProjects([]);
          localStorage.setItem('projects', JSON.stringify([]));
        }
      } else {
        // Initialize with empty array if no saved projects
        setProjects([]);
        localStorage.setItem('projects', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error parsing stored projects:', error);
      // 發生錯誤時重置為空陣列
      setProjects([]);
      localStorage.setItem('projects', JSON.stringify([]));
    }
  };

  // Load projects on initial mount
  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  // Reload projects when the component becomes active after navigation
  useEffect(() => {
    // This will run every time the location changes, which includes
    // when the user navigates back to this page
    loadProjectsFromStorage();
  }, [location]);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current page projects
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  // Delete project
  const handleDelete = (id: number | string) => {
    if (window.confirm('確定要刪除此專案嗎？此操作無法撤銷。')) {
      const updatedProjects = projects.filter(project => project.id !== id);
      
      // 立即保存到localStorage，確保數據一致性
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // 更新React狀態
      setProjects(updatedProjects);
      
      // If there are no more projects on the current page and it's not the first page,
      // go to the previous page
      if (currentProjects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Add new project function
  const handleAddProject = () => {
    // Generate a unique project title
    const projectTitle = '新專案';
    let uniqueTitle = projectTitle;
    let counter = 1;
    
    while (projects.some(project => project.title === uniqueTitle)) {
      uniqueTitle = `${projectTitle} ${counter}`;
      counter++;
    }
    
    // Create a new project
    const newProject = {
      id: Date.now(), // Generate a unique ID based on timestamp
      title: uniqueTitle,
      status: 'draft',
      lastEdited: new Date().toLocaleDateString(),
      description: '自我介紹專案',
      formData: {
        personalInfo: {
          name: '',
          age: '',
          education: [{ school: '', degree: '', major: '', graduationYear: '' }],
          workExperience: [{ company: '', position: '', startDate: '', endDate: '', isCurrent: false, description: '' }],
          skills: [{ name: '', level: '' }],
          projects: '',
          awards: '',
          interests: ''
        },
        industrySettings: {
          industry: '',
          jobCategory: '',
          jobSubcategory: '',
          specificPosition: '',
          keywords: [],
          focusAreas: []
        },
        generationSettings: {
          duration: '60秒',
          customDuration: '',
          language: 'Chinese',
          style: '專業',
          structure: 'skills_first',
          useCustomPrompt: false,
          promptTemplate: '',
          tone: 'Professional',
          outputLength: 'Medium',
          highlightStrengths: true,
          includeCallToAction: false,
          focusOnRecentExperience: false
        }
      }
    };
    
    // Add to projects array
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Save to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Navigate to profile page with the new project ID
    navigate(`/profile?id=${newProject.id}`);
  };

  // Add sample project function
  const handleAddSampleProject = (sampleProject: SampleProject) => {
    console.log('Adding sample project:', sampleProject);
    
    // 創建完整的個人資訊物件，確保欄位符合 FormContext 的預期格式
    const personalInfo = {
      name: sampleProject.formData.personalInfo.name || '',
      email: sampleProject.formData.personalInfo.email || '',
      phone: sampleProject.formData.personalInfo.phone || '',
      location: sampleProject.formData.personalInfo.location || '',
      birthday: '',  // FormContext 需要這個欄位
      
      // 將教育轉換為正確的格式
      education: Array.isArray(sampleProject.formData.personalInfo.education) 
        ? sampleProject.formData.personalInfo.education.map((edu: string) => {
            // 嘗試解析學校名稱和學位
            const parts = edu.match(/(.*)\s(.*)\s(.*)\s\((\d+)-(\d+)\)/);
            return {
              school: parts ? parts[1] : '',
              degree: parts ? parts[2] : '',
              major: parts ? parts[3] : '',
              graduationYear: parts ? parts[5] : ''
            };
          })
        : [{ school: '', degree: '', major: '', graduationYear: '' }],
      
      // 將工作經驗轉換為正確的格式
      workExperience: sampleProject.formData.personalInfo.workExperience.map(exp => {
        const periodParts = exp.period.split(' - ');
        const startDate = periodParts[0] || '';
        const endDate = periodParts.length > 1 ? periodParts[1] : '';
        const isCurrent = endDate.includes('至今');
        
        return {
          company: exp.company || '',
          position: exp.title || '',  // 從 title 映射到 position
          startDate: startDate || '',
          endDate: isCurrent ? '' : (endDate || ''),
          isCurrent: isCurrent,
          description: exp.description || ''
        };
      }),
      
      // 將技能轉換為正確的格式
      skills: Array.isArray(sampleProject.formData.personalInfo.skills)
        ? sampleProject.formData.personalInfo.skills.map((skill: string) => {
            // 根據技能名稱自動判斷熟練程度
            let level = 'intermediate'; // 預設為中級
            
            // 處理技能名稱中可能包含的熟練度標示
            if (skill.toLowerCase().includes('精通') || 
                skill.toLowerCase().includes('專業') || 
                skill.toLowerCase().includes('資深')) {
              level = 'expert'; // 專家
            } else if (skill.toLowerCase().includes('熟練') || 
                       skill.toLowerCase().includes('進階')) {
              level = 'advanced'; // 進階
            } else if (skill.toLowerCase().includes('基礎') || 
                       skill.toLowerCase().includes('入門')) {
              level = 'beginner'; // 入門
            }
            
            return {
              name: skill.replace(/[（(].+[）)]/g, '').trim(), // 移除括號內的描述
              level: level
            };
          })
        : [{ name: '', level: '' }],
        
      // 其他 FormContext 需要的欄位
      projects: sampleProject.formData.personalInfo.additionalInfo || '',
      awards: '',
      interests: Array.isArray(sampleProject.formData.personalInfo.interests) ? 
                sampleProject.formData.personalInfo.interests.join(', ') : ''
    };
    
    console.log('Processed personal info:', personalInfo);
    
    // Create a new project with a unique ID
    const newProject: Project = {
      id: uuidv4(),
      title: sampleProject.title || '',
      status: sampleProject.status || 'draft',
      lastEdited: new Date().toISOString().slice(0, 7),
      description: sampleProject.description || '',
      formData: {
        personalInfo: personalInfo,
        // 保留其他設置
        industrySettings: sampleProject.formData.industrySettings,
        generationSettings: sampleProject.formData.generationSettings
      }
    };

    console.log('Created new project:', newProject);

    // Add the new project
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Save to localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Hide sample projects section
    setShowSampleProjects(false);
    
    // Navigate to the project page for editing
    navigate(`/profile?id=${newProject.id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">我的專案</h1>
          <div className="flex gap-2">
            <Link
              to="/history"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
            >
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              生成歷史
            </Link>
            <button 
              onClick={() => setShowSampleProjects(!showSampleProjects)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
              範例專案
            </button>
            <button 
              onClick={handleAddProject}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              新增專案
            </button>
          </div>
        </div>

        {/* Sample Projects Section */}
        {showSampleProjects && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">範例專案</h2>
              <button 
                onClick={() => setShowSampleProjects(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                關閉
              </button>
            </div>
            <p className="text-gray-600 mb-4">選擇一個範例專案作為起點，您可以根據需要進行修改。</p>
            
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4 mt-4">
              {sampleProjects.map((sample) => (
                <div key={sample.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-indigo-600 mb-1">{sample.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <span className="mr-3">行業: {jobCategoryName(sample.formData.industrySettings.jobCategory)}</span>
                    <span>職位: {sample.formData.industrySettings.specificPosition}</span>
                  </div>
                  <button
                    onClick={() => handleAddSampleProject(sample)}
                    className="w-full mt-2 text-sm bg-gray-100 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faClone} className="mr-1" />
                    使用此範例
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="搜尋專案..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faSearch} />
          </div>
        </div>

        {/* Project list */}
        {currentProjects.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {currentProjects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <h2 className="text-xl font-semibold text-gray-800 mb-1">{project.title}</h2>
                      <div className="flex items-center mb-2">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status === 'completed' ? '已完成' : '草稿'}
                        </span>
                        <span className="text-gray-500 text-sm ml-3">最後編輯: {project.lastEdited}</span>
                        
                        {/* Display model information if available */}
                        {project.modelProvider && project.modelId && (
                          <span className="text-gray-500 text-sm ml-3">
                            模型: {project.modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} - {project.modelId}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/profile?id=${project.id}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 px-3 py-1 border border-indigo-600 rounded-md transition"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                        編輯
                      </Link>
                      {project.status === 'draft' ? (
                        <button 
                          className="inline-flex items-center px-3 py-1 border border-gray-400 rounded-md text-gray-400 cursor-not-allowed"
                          disabled
                          title="請先完成專案資料編輯再進行生成"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          生成
                        </button>
                      ) : (
                        <Link 
                          to={`/result?id=${project.id}`} 
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-600 rounded-md transition"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          生成
                        </Link>
                      )}
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-700 px-3 py-1 border border-red-600 rounded-md transition"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Empty state
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faUserTie} className="text-gray-300 text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">尚無專案</h2>
            <p className="text-gray-600 mb-6">點擊「新增專案」按鈕開始創建您的第一個自我介紹</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowSampleProjects(true)} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                使用範例
              </button>
              <button 
                onClick={handleAddProject} 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                創建專案
              </button>
              <Link
                to="/history"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
              >
                <FontAwesomeIcon icon={faHistory} className="mr-2" />
                查看歷史記錄
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredProjects.length > projectsPerPage && (
          <div className="flex justify-center mt-6">
            <nav>
              <ul className="flex">
                <li>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border ${
                      currentPage === 1 
                      ? 'text-gray-400 border-gray-200' 
                      : 'text-indigo-600 border-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    上一頁
                  </button>
                </li>
                {Array.from({ length: Math.ceil(filteredProjects.length / projectsPerPage) }).map((_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border-t border-b ${
                        currentPage === i + 1
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProjects.length / projectsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredProjects.length / projectsPerPage)}
                    className={`px-3 py-1 rounded-r-md border ${
                      currentPage === Math.ceil(filteredProjects.length / projectsPerPage)
                      ? 'text-gray-400 border-gray-200'
                      : 'text-indigo-600 border-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    下一頁
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

// 取得職業類別名稱
const jobCategoryName = (category: string): string => {
  const categories: {[key: string]: string} = {
    "it": "資訊科技",
    "finance": "金融",
    "marketing": "行銷",
    "management": "管理",
    "design": "設計",
    "research": "研發/醫療"
  };
  
  return categories[category] || category;
};

export default Projects; 