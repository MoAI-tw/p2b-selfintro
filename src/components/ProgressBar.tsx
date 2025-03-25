import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ProgressBarProps {
  currentStep: number;
  projectName?: string;
}

const ProgressBar = ({ currentStep, projectName }: ProgressBarProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlProjectName = searchParams.get('project_name');
  const projectId = searchParams.get('id');
  
  // Use the projectName prop if provided, otherwise use the one from URL
  const effectiveProjectName = projectName || urlProjectName || '';
  
  // Generate the URL with either project_name or id parameter
  const getUrl = (path: string) => {
    if (projectId) {
      return `${path}?id=${projectId}`;
    } else if (effectiveProjectName) {
      return `${path}?project_name=${encodeURIComponent(effectiveProjectName)}`;
    }
    return path;
  };

  return (
    <div className="bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="w-full flex items-center">
            <Link 
              to={getUrl("/profile")}
              className={`flex items-center ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium hidden sm:inline">基本資料</span>
            </Link>
            
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            
            <Link 
              to={getUrl("/industry")}
              className={`flex items-center ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">產業設定</span>
            </Link>
            
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            
            <Link 
              to={getUrl("/settings")}
              className={`flex items-center ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium hidden sm:inline">生成設定</span>
            </Link>
            
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            
            <Link 
              to={getUrl("/result")}
              className={`flex items-center ${currentStep >= 4 ? 'text-indigo-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
              </div>
              <span className="ml-2 font-medium hidden sm:inline">生成結果</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar; 