import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faMagic, faHistory } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // 如果是首頁，不顯示導航欄，因為Home組件已經有自己的導航元素
  if (isHomePage) {
    return null;
  }
  
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
            <Link to="/features" className={location.pathname === '/features' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>功能介紹</Link>
            <Link to="/use-cases" className={location.pathname === '/use-cases' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>使用案例</Link>
            <Link to="/faq" className={location.pathname === '/faq' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600 font-medium'}>常見問題</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 