import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faMagic, faHistory, faGlobe, faKey } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import ApiKeySettings from './ApiKeySettings';
import DraggableModal from './DraggableModal';

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects';
  const isHistoryPage = location.pathname === '/history';
  const isPromptEditorPage = location.pathname === '/prompt-editor';
  const isFeaturePage = location.pathname === '/features';
  const isUseCasePage = location.pathname === '/use-cases';
  const isFaqPage = location.pathname === '/faq';
  const isIndustryPage = location.pathname.startsWith('/industry');
  const isSettingsPage = location.pathname.startsWith('/settings');
  const isProfilePage = location.pathname.startsWith('/profile');
  
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // 檢查是否為特殊頁面（功能介紹、使用案例、常見問題）
  const isSpecialPage = isFeaturePage || isUseCasePage || isFaqPage;
  
  // 檢查是否為應用頁面（我的專案、生成歷史、提示詞編輯）或產業設定、基本資料和生成設定頁面
  const isAppPage = isProjectsPage || isHistoryPage || isPromptEditorPage || isIndustryPage || isSettingsPage || isProfilePage;
  
  // 在控制台打印路徑和頁面狀態信息，用於調試
  console.log('Current path:', location.pathname);
  console.log('isProfilePage:', isProfilePage);
  console.log('isAppPage:', isAppPage);
  
  // 如果是首頁，不顯示導航欄，因為Home組件已經有自己的導航元素
  if (isHomePage) {
    return null;
  }
  
  // 特殊頁面使用簡化版導航欄，類似首頁的樣式
  if (isSpecialPage) {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <FontAwesomeIcon icon={faUserTie} className="text-indigo-600 text-2xl mr-2" />
                <span className="font-bold text-xl text-indigo-600">自介達人</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={location.pathname === '/' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>首頁</Link>
              <Link to="/features" className={isFeaturePage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>功能介紹</Link>
              <Link to="/use-cases" className={isUseCasePage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>使用案例</Link>
              <Link to="/faq" className={isFaqPage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>常見問題</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/projects" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">立即開始</Link>
              <button className="flex items-center text-gray-700">
                <FontAwesomeIcon icon={faGlobe} className="text-indigo-600 mr-1" />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  // 應用頁面和其他頁面使用標準導航欄
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon icon={faUserTie} className="text-indigo-600 text-2xl mr-2" />
              <span className="font-bold text-xl text-indigo-600">自介達人</span>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={location.pathname === '/' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>首頁</Link>
              <Link to="/projects" className={isProjectsPage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>我的專案</Link>
              <Link to="/history" className={isHistoryPage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>
                <FontAwesomeIcon icon={faHistory} className="mr-1" />
                生成歷史
              </Link>
              <Link to="/prompt-editor" className={isPromptEditorPage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>
                <FontAwesomeIcon icon={faMagic} className="mr-1" />
                提示詞編輯
              </Link>
              {/* 僅在非應用頁面顯示這些連結 */}
              {!isAppPage && (
                <>
                  <Link to="/features" className={isFeaturePage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>功能介紹</Link>
                  <Link to="/use-cases" className={isUseCasePage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>使用案例</Link>
                  <Link to="/faq" className={isFaqPage ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>常見問題</Link>
                </>
              )}
            </div>
            
            {/* API設定按鈕 */}
            {(isIndustryPage || isSettingsPage || isProfilePage) && (
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="ml-4 px-4 py-1.5 rounded-full flex items-center text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                API 設定
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* API Key Modal */}
      <DraggableModal 
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="AI 模型設定"
        maxWidth="max-w-2xl"
      >
        <ApiKeySettings onClose={() => setShowApiKeyModal(false)} />
      </DraggableModal>
    </nav>
  );
};

export default Navbar; 