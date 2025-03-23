import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPlus, faPen, faEye, faTrash, faSearch, faUpload, faHistory } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';

// 定義優化專案數據結構
interface OptimizerProject {
  id: string;
  title: string;
  status: string;
  lastEdited: string;
  description: string;
  audioFile?: {
    name: string;
    size: number;
    duration: number;
    url: string;
  };
  optimizationResults?: {
    optimizedAudioUrl?: string;
    report?: {
      speechRate: number;
      clarity: number;
      confidence: number;
      improvements: string[];
    }
  };
}

const Optimizer = () => {
  const [projects, setProjects] = useState<OptimizerProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
      const storedProjects = localStorage.getItem('optimizerProjects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        // 確保解析後的資料是陣列
        if (Array.isArray(parsedProjects)) {
          setProjects(parsedProjects);
        } else {
          console.error('Stored optimizer projects is not an array, resetting to empty array');
          setProjects([]);
          localStorage.setItem('optimizerProjects', JSON.stringify([]));
        }
      } else {
        // Initialize with empty array if no saved projects
        setProjects([]);
        localStorage.setItem('optimizerProjects', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error parsing stored optimizer projects:', error);
      // 發生錯誤時重置為空陣列
      setProjects([]);
      localStorage.setItem('optimizerProjects', JSON.stringify([]));
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
  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此優化專案嗎？此操作無法撤銷。')) {
      const updatedProjects = projects.filter(project => project.id !== id);
      
      // 立即保存到localStorage，確保數據一致性
      localStorage.setItem('optimizerProjects', JSON.stringify(updatedProjects));
      
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
    const projectTitle = '新優化專案';
    let uniqueTitle = projectTitle;
    let counter = 1;
    
    while (projects.some(project => project.title === uniqueTitle)) {
      uniqueTitle = `${projectTitle} ${counter}`;
      counter++;
    }
    
    // Create a new project
    const newProject: OptimizerProject = {
      id: uuidv4(), // Generate a unique ID
      title: uniqueTitle,
      status: 'draft',
      lastEdited: new Date().toLocaleDateString(),
      description: '自我介紹優化專案'
    };
    
    // Add to projects array
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Save to localStorage
    localStorage.setItem('optimizerProjects', JSON.stringify(updatedProjects));
    
    // Navigate to recorder page with the new project ID
    navigate(`/optimizer/recorder?id=${newProject.id}`);
  };

  // Pagination controls
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const pageCount = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">自我介紹優化專案</h1>
          <div className="flex gap-2">
            <Link
              to="/optimizer/history"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center"
            >
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              優化歷史
            </Link>
            <button 
              onClick={handleAddProject}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              新增專案
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="搜尋專案..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            : project.status === 'optimized'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status === 'completed' ? '已完成' : 
                           project.status === 'optimized' ? '已優化' : '草稿'}
                        </span>
                        <span className="text-gray-500 text-sm ml-3">最後編輯: {project.lastEdited}</span>
                        
                        {/* Display audio information if available */}
                        {project.audioFile && (
                          <span className="text-gray-500 text-sm ml-3">
                            音檔: {project.audioFile.name} ({(project.audioFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/optimizer/recorder?id=${project.id}`}
                        className="inline-flex items-center text-purple-600 hover:text-purple-700 px-3 py-1 border border-purple-600 rounded-md transition"
                      >
                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                        {project.audioFile ? '重新錄製' : '錄製'}
                      </Link>
                      {project.audioFile ? (
                        <Link 
                          to={`/optimizer/result?id=${project.id}`} 
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-600 rounded-md transition"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          查看結果
                        </Link>
                      ) : (
                        <button 
                          className="inline-flex items-center px-3 py-1 border border-gray-400 rounded-md text-gray-400 cursor-not-allowed"
                          disabled
                          title="請先錄製或上傳音檔"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          查看結果
                        </button>
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
              <FontAwesomeIcon icon={faMicrophone} className="text-gray-300 text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">尚無優化專案</h2>
            <p className="text-gray-600 mb-6">點擊「新增專案」按鈕開始創建您的第一個自我介紹優化專案</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleAddProject} 
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                創建專案
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 mx-1 rounded ${
                  currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                上一頁
              </button>
              
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-8 h-8 mx-1 rounded ${
                    currentPage === index + 1
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount}
                className={`p-2 mx-1 rounded ${
                  currentPage === pageCount
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                下一頁
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimizer; 