import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faMagic, faHistory, faGlobe } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects';
  const isFeaturePage = location.pathname === '/features';
  const isUseCasePage = location.pathname === '/use-cases';
  const isFaqPage = location.pathname === '/faq';
  
  // 檢查是否為特殊頁面（功能介紹、使用案例、常見問題）
  const isSpecialPage = isFeaturePage || isUseCasePage || isFaqPage;
  
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
  
  // 其他頁面使用標準導航欄
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
            <Link to="/projects" className={location.pathname === '/projects' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>我的專案</Link>
            <Link to="/history" className={location.pathname === '/history' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>
              <FontAwesomeIcon icon={faHistory} className="mr-1" />
              生成歷史
            </Link>
            <Link to="/prompt-editor" className={location.pathname === '/prompt-editor' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>
              <FontAwesomeIcon icon={faMagic} className="mr-1" />
              提示詞編輯
            </Link>
            {/* 在專案頁面不顯示這些連結，僅在首頁和其他頁面顯示 */}
            {!isProjectsPage && (
              <>
                <Link to="/features" className={location.pathname === '/features' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>功能介紹</Link>
                <Link to="/use-cases" className={location.pathname === '/use-cases' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>使用案例</Link>
                <Link to="/faq" className={location.pathname === '/faq' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>常見問題</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 