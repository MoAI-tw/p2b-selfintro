import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">自介達人</h3>
            <p className="text-gray-400">幫助用戶快速產生專業、有說服力的自我介紹</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">快速連結</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">首頁</Link></li>
              <li><Link to="#" className="hover:text-white">功能介紹</Link></li>
              <li><Link to="#" className="hover:text-white">使用案例</Link></li>
              <li><Link to="#" className="hover:text-white">常見問題</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">法律資訊</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="#" className="hover:text-white">隱私政策</Link></li>
              <li><Link to="#" className="hover:text-white">使用條款</Link></li>
              <li><Link to="#" className="hover:text-white">Cookie政策</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">聯絡我們</h3>
            <ul className="space-y-2 text-gray-400">
              <li><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> support@selfintro.com</li>
              <li><FontAwesomeIcon icon={faPhone} className="mr-2" /> +886 2 1234 5678</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} 自介達人. 保留所有權利。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 