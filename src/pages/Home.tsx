import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUserEdit, faBriefcase, faMagic, faGlobe } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');

  const content = {
    en: {
      headline: "Create Perfect Self-Introductions in 3 Steps",
      subheading: "Whether it's for job interviews, career development, or social occasions, let AI help you craft professional and compelling self-introductions",
      getStarted: "Get Started",
      learnMore: "Learn More",
      howToUse: "How It Works",
      steps: "Three simple steps to create your customized self-introduction",
      step1Title: "1. Fill in Your Profile",
      step1Text: "Enter your experience, education, skills, and professional background",
      step2Title: "2. Select Your Industry",
      step2Text: "Specify the industry and position you're applying for to make the content more targeted",
      step3Title: "3. Generate & Optimize",
      step3Text: "Generate self-introduction content with one click, save multiple versions and fine-tune",
      ctaTitle: "Start Creating Your Professional Self-Introduction Now",
      ctaText: "No registration required, use our basic features for free",
      home: "Home",
      features: "Features",
      examples: "Examples",
      faq: "FAQ"
    },
    zh: {
      headline: "三步驟產生完美的自我介紹",
      subheading: "無論是求職面試、職涯發展還是社交場合，讓AI助你打造專業且有感染力的自我介紹",
      getStarted: "立即開始",
      learnMore: "了解更多",
      howToUse: "如何使用",
      steps: "三個簡單步驟，打造專屬自我介紹",
      step1Title: "1. 填寫個人資料",
      step1Text: "輸入您的經歷、學歷、技能和專業背景等相關資訊",
      step2Title: "2. 選擇應徵產業",
      step2Text: "指定您想要應徵的產業和職位，讓內容更具針對性",
      step3Title: "3. 生成與優化",
      step3Text: "一鍵生成自我介紹內容，可保存多個版本並進行微調",
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
              <Link to="/projects" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">{t.getStarted}</Link>
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
                <Link to="/projects" className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">{t.getStarted}</Link>
                <a href="#how-it-works" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition">{t.learnMore}</a>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Interviewer" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.howToUse}</h2>
            <p className="text-xl text-gray-600">{t.steps}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faUserEdit} className="text-indigo-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step1Title}</h3>
              <p className="text-gray-600">{t.step1Text}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faBriefcase} className="text-indigo-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step2Title}</h3>
              <p className="text-gray-600">{t.step2Text}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faMagic} className="text-indigo-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.step3Title}</h3>
              <p className="text-gray-600">{t.step3Text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">{t.ctaText}</p>
          <Link to="/projects" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition inline-block">{t.getStarted}</Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 