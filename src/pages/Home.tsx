import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUserEdit, faBriefcase, faMagic, faGlobe, faMicrophone, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');
  const productsRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const content = {
    en: {
      headline: "Professional Self-Introduction Tools",
      subheading: "Generate perfect self-introductions or optimize your speech with our AI-powered tools",
      getStarted: "Get Started",
      learnMore: "Learn More",
      howToUse: "Our Products",
      product1Title: "Self-Introduction Generator",
      product1Text: "Create tailored self-introductions for job interviews, career development, or social occasions",
      product1Button: "Create Now",
      product2Title: "Self-Introduction Optimizer",
      product2Text: "Upload your recording and get AI feedback to improve your self-introduction speech",
      product2Button: "Optimize Now",
      ctaTitle: "Start Creating Your Professional Self-Introduction Now",
      ctaText: "No registration required, use our basic features for free",
      home: "Home",
      features: "Features",
      examples: "Examples",
      faq: "FAQ"
    },
    zh: {
      headline: "專業自我介紹工具",
      subheading: "生成完美的自我介紹內容或是優化您的口語表達，全由AI智能助力",
      getStarted: "立即開始",
      learnMore: "了解更多",
      howToUse: "我們的產品",
      product1Title: "自我介紹生成器",
      product1Text: "為求職面試、職涯發展或社交場合創建量身定制的自我介紹內容",
      product1Button: "立即創建",
      product2Title: "自我介紹優化器",
      product2Text: "上傳您的錄音，獲取AI反饋以改進您的自我介紹演講",
      product2Button: "立即優化",
      ctaTitle: "立即開始打造您的專業自我介紹",
      ctaText: "無需註冊，免費使用我們的基礎功能",
      home: "首頁",
      features: "功能介紹",
      examples: "使用案例",
      faq: "常見問題"
    }
  };

  const t = content[language];

  return (
    <div className="bg-gray-50">
      {/* 首頁專用導航欄 */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FontAwesomeIcon icon={faUserTie} className="text-indigo-600 text-2xl mr-2" />
                <span className="font-bold text-xl text-indigo-600">自介達人</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-indigo-600 font-medium">{t.home}</Link>
              <Link to="features" className="text-gray-600 hover:text-indigo-600 font-medium">{t.features}</Link>
              <Link to="use-cases" className="text-gray-600 hover:text-indigo-600 font-medium">{t.examples}</Link>
              <Link to="faq" className="text-gray-600 hover:text-indigo-600 font-medium">{t.faq}</Link>
            </div>
            <div className="flex items-center">
              <a 
                href="#products" 
                onClick={scrollToProducts} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 cursor-pointer flex items-center group"
              >
                <span>{t.getStarted}</span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="ml-2 transform group-hover:translate-y-1 transition-transform duration-300" 
                />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="flex items-center bg-white px-3 py-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <FontAwesomeIcon icon={faGlobe} className="text-indigo-600 mr-2" />
          <span className="text-gray-700 font-medium">{language === 'en' ? '中文' : 'English'}</span>
        </button>
      </div>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.headline}</h1>
              <p className="text-xl mb-8">{t.subheading}</p>
              <div className="flex space-x-4">
                <a 
                  href="#products" 
                  onClick={scrollToProducts} 
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300 cursor-pointer flex items-center group"
                >
                  <span>{t.getStarted}</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className="ml-2 transform group-hover:translate-y-1 transition-transform duration-300" 
                  />
                </a>
                <a 
                  href="#products" 
                  onClick={scrollToProducts} 
                  className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-all duration-300 cursor-pointer"
                >
                  {t.learnMore}
                </a>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Interviewer" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" ref={productsRef} className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.howToUse}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            {/* Product 1: Self-Introduction Generator */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserEdit} className="text-indigo-600 text-6xl" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.product1Title}</h3>
                <p className="text-gray-600 mb-6">{t.product1Text}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">3 {language === 'en' ? 'steps' : '步驟'}</span>
                  <Link to="/projects" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                    {t.product1Button}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Product 2: Self-Introduction Optimizer */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-purple-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faMicrophone} className="text-purple-600 text-6xl" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.product2Title}</h3>
                <p className="text-gray-600 mb-6">{t.product2Text}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">3 {language === 'en' ? 'steps' : '步驟'}</span>
                  <Link to="/optimizer" className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition">
                    {t.product2Button}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">{t.ctaText}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/projects" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition">{t.product1Button}</Link>
            <Link to="/optimizer" className="bg-purple-700 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-purple-800 transition">{t.product2Button}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 