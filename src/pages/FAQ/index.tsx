import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faMagnifyingGlass,
  faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const faqData: FAQItem[] = [
    {
      id: 'faq1',
      question: '自介達人是如何生成專業自我介紹的？',
      answer: '自介達人結合先進的AI語言模型和自然語言處理技術，根據您提供的個人信息和偏好設置（如產業、職位、場合等），智能生成符合特定場景需求的自我介紹。系統會分析大量專業自我介紹範例，確保生成的內容既專業又個性化，突出您的核心優勢和專業特點。',
      category: 'basic'
    },
    {
      id: 'faq2',
      question: '使用自介達人需要提供哪些資料？',
      answer: '基本使用需要提供：個人基本資料（姓名、專業背景、工作經驗等）、目標產業和職位、使用場合（如面試、演講等）。您提供的資料越詳細，生成的自我介紹就越貼合您的實際情況和需求。所有提供的資料將嚴格保密，僅用於生成您的自我介紹內容。',
      category: 'basic'
    },
    {
      id: 'faq3',
      question: '如何修改自介達人生成的內容？',
      answer: '生成內容後，您可以在編輯頁面直接修改文本，也可以透過調整產業設置、場合類型、表達風格等參數重新生成。系統也支持保存多個版本，您可以比較不同版本並選擇最適合的內容。修改歷史會自動保存，方便您隨時回顧和使用之前的版本。',
      category: 'feature'
    },
    {
      id: 'faq4',
      question: '自介達人支持哪些語言？',
      answer: '目前自介達人主要支持中文（繁體和簡體）和英文的自我介紹生成。未來我們計劃擴展支持更多語言，包括日文、韓文和其他主要歐洲語言。您也可以使用第三方翻譯工具將生成的內容翻譯成其他語言。',
      category: 'feature'
    },
    {
      id: 'faq5',
      question: '免費用戶可以創建多少個專案？',
      answer: '免費用戶可以創建最多3個自我介紹專案，每個專案可以生成最多5個版本的內容。升級到專業版後，您將獲得無限專案創建權限和更多高級功能，如高級模板、專業格式建議、優先使用最新AI模型等特權。',
      category: 'account'
    },
    {
      id: 'faq6',
      question: '自介達人如何保護我的個人資料？',
      answer: '我們採用銀行級別的數據加密技術保護您的個人資料。所有資料僅用於生成您的自我介紹內容，不會與第三方共享或用於其他目的。您可以隨時刪除已上傳的資料和生成的內容。更多詳情請參閱我們的隱私政策。',
      category: 'privacy'
    },
    {
      id: 'faq7',
      question: '一份理想的自我介紹應該多長？',
      answer: '理想的自我介紹長度取決於使用場景。一般而言，面試自我介紹建議控制在60-90秒（約150-250字）；書面自我介紹（如求職信）建議200-300字；社交場合30-60秒即可。自介達人允許您設置不同的長度參數，根據特定需求調整生成內容的詳細程度。',
      category: 'basic'
    },
    {
      id: 'faq8',
      question: '有哪些技巧可以讓自我介紹更有效？',
      answer: '有效的自我介紹應：(1) 開門見山，直接切入重點；(2) 強調與場合相關的經驗和能力；(3) 使用具體數據和成就說明價值；(4) 展現個性和專業態度；(5) 根據聽眾調整內容和語調。自介達人會根據您選擇的場景和目標，自動應用這些技巧生成最適合的內容。',
      category: 'basic'
    },
    {
      id: 'faq9',
      question: '可以將生成的自我介紹分享給他人嗎？',
      answer: '是的，生成的自我介紹可以通過多種方式分享。您可以直接複製文本、以PDF格式導出、通過電子郵件分享或生成分享連結（連結可設置訪問期限和密碼保護）。專業版用戶還可以使用團隊協作功能，邀請他人審閱和評論您的自我介紹。',
      category: 'feature'
    },
    {
      id: 'faq10',
      question: '自介達人適合哪些人使用？',
      answer: '自介達人適合需要準備專業自我介紹的各類人群，包括：求職者、職場人士、學生、創業者、自由工作者等。不論您是準備面試、演講、社交活動、學術交流還是線上個人資料，自介達人都能根據您的具體需求生成合適的內容。對於英語非母語使用者，系統也能幫助生成流暢、專業的英文自我介紹。',
      category: 'basic'
    }
  ];

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(faqId => faqId !== id) 
        : [...prev, id]
    );
  };

  const filteredFaqs = faqData.filter(faq => 
    (activeCategory === 'all' || faq.category === activeCategory) &&
    (searchQuery === '' || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page title */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">常見問題</h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            了解關於自介達人的使用方法、功能特色和常見問題解答
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search box */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="搜尋問題..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <FontAwesomeIcon 
              icon={faMagnifyingGlass} 
              className="absolute left-4 top-4 text-gray-400"
            />
          </div>
        </div>
        
        {/* Category tabs */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              所有問題
            </button>
            <button 
              onClick={() => setActiveCategory('basic')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'basic' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              基本使用
            </button>
            <button 
              onClick={() => setActiveCategory('feature')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'feature' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              功能相關
            </button>
            <button 
              onClick={() => setActiveCategory('account')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'account' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              帳號與付費
            </button>
            <button 
              onClick={() => setActiveCategory('privacy')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'privacy' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              隱私與安全
            </button>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-16">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div key={faq.id} className="mb-4">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className={`w-full text-left p-5 rounded-lg flex justify-between items-center ${
                    openFaqs.includes(faq.id) 
                      ? 'bg-indigo-50 border-indigo-200 border' 
                      : 'bg-white shadow-sm hover:bg-gray-50'
                  } transition`}
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <FontAwesomeIcon 
                    icon={openFaqs.includes(faq.id) ? faChevronUp : faChevronDown} 
                    className={`${
                      openFaqs.includes(faq.id) ? 'text-indigo-600' : 'text-gray-500'
                    }`}
                  />
                </button>
                
                {openFaqs.includes(faq.id) && (
                  <div className="p-5 bg-white border border-t-0 border-indigo-200 rounded-b-lg">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <FontAwesomeIcon 
                icon={faCircleQuestion} 
                className="text-5xl text-gray-300 mb-4"
              />
              <p className="text-gray-500 text-lg mb-2">找不到符合您搜尋的問題</p>
              <p className="text-gray-400">請嘗試使用不同的關鍵詞或瀏覽所有類別</p>
            </div>
          )}
        </div>
        
        {/* Not answered */}
        <div className="bg-indigo-50 rounded-lg p-8 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            沒找到您的問題？
          </h3>
          <p className="text-gray-600 mb-6">
            如果以上內容沒有解答您的疑問，歡迎聯繫我們的客服團隊
          </p>
          <a 
            href="mailto:support@zijiemaster.com" 
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg inline-block hover:bg-indigo-700 transition"
          >
            聯繫客服
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 