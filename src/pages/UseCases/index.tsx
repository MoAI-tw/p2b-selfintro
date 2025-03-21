import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faBriefcase, 
  faGraduationCap, 
  faUsers, 
  faMicrophone, 
  faGlobe,
  faQuoteLeft,
  faChartLine,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const UseCases = () => {
  const [activeCategory, setActiveCategory] = useState<string>('job_seeking');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page title */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">使用案例</h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            探索自介達人在各種場景下的應用案例，了解我們如何幫助用戶打造完美的自我介紹
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category tabs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">適用場合</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setActiveCategory('job_seeking')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'job_seeking' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              職場求職
            </button>
            <button 
              onClick={() => setActiveCategory('academic')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'academic' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
              學術交流
            </button>
            <button 
              onClick={() => setActiveCategory('social')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'social' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              社交場合
            </button>
            <button 
              onClick={() => setActiveCategory('presentation')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'presentation' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
              演講開場
            </button>
            <button 
              onClick={() => setActiveCategory('online')}
              className={`px-5 py-2 rounded-full ${
                activeCategory === 'online' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              <FontAwesomeIcon icon={faGlobe} className="mr-2" />
              線上社群
            </button>
          </div>
        </div>

        {/* Job Seeking Case Studies (Only showing this category for now) */}
        <div className={activeCategory === 'job_seeking' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">面試自我介紹</h3>
              <p className="text-gray-600 mb-6">
                求職面試中的開場自我介紹是展現個人專業形象的關鍵時刻。良好的自我介紹能迅速吸引面試官的注意，
                突出您的專業背景和核心能力，為整個面試奠定良好基礎。
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">最佳實踐</h4>
                <ul className="text-gray-600 space-y-2 ml-6 list-disc">
                  <li>控制時間在60-90秒，簡潔有力</li>
                  <li>突出與職位相關的關鍵技能和經驗</li>
                  <li>量化成就，使用具體數據展示能力</li>
                  <li>表達對公司和職位的了解與熱情</li>
                </ul>
              </div>
              
              <div className="flex items-start p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-2xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 italic mb-2">
                    "使用自介達人幫我準備了三個不同版本的面試自我介紹，針對不同的公司進行定制。
                    最終成功獲得了理想公司的軟體工程師職位。AI生成的內容非常專業，節省了我大量準備時間。"
                  </p>
                  <p className="text-gray-600 font-medium">— 陳先生，軟體工程師</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">求職信開頭</h3>
              <p className="text-gray-600 mb-6">
                一份好的求職信需要有引人注目的開頭自我介紹，能夠簡明扼要地說明您是誰、您的專業背景，
                以及為何您適合應徵的職位。強有力的開頭能增加求職信被完整閱讀的機會。
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">最佳實踐</h4>
                <ul className="text-gray-600 space-y-2 ml-6 list-disc">
                  <li>開門見山，直接表明應徵意向</li>
                  <li>簡短介紹自己的專業背景和核心優勢</li>
                  <li>對應職位描述中的關鍵詞和要求</li>
                  <li>表現積極、專業的態度和語氣</li>
                </ul>
              </div>
              
              <div className="flex items-start p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-2xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 italic mb-2">
                    "自介達人幫我優化了求職信的開頭部分，使內容更加專業而有針對性。
                    投遞後的回覆率明顯提高了，最終收到了三家公司的面試邀請。"
                  </p>
                  <p className="text-gray-600 font-medium">— 林小姐，行銷專員</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">團隊介紹</h3>
              <p className="text-gray-600 mb-6">
                加入新團隊時，一個專業得體的自我介紹能幫助您快速融入團隊，建立良好的第一印象。
                這種介紹應當簡潔而全面，包含您的專業背景以及對團隊工作的理解與期望。
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">最佳實踐</h4>
                <ul className="text-gray-600 space-y-2 ml-6 list-disc">
                  <li>簡要介紹專業背景和之前的相關經驗</li>
                  <li>強調團隊合作能力和溝通風格</li>
                  <li>表達對團隊目標和項目的理解與熱情</li>
                  <li>適當分享一些個人興趣，增加親和力</li>
                </ul>
              </div>
              
              <div className="flex items-start p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-2xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 italic mb-2">
                    "剛入職新公司時，使用自介達人生成的團隊介紹讓我在第一次團隊會議上留下了專業的印象。
                    生成的內容既突出了我的專業能力，又展現了我對團隊協作的重視。"
                  </p>
                  <p className="text-gray-600 font-medium">— 王先生，產品經理</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Category - Placeholder */}
        <div className={activeCategory === 'academic' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-indigo-600 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">學術交流場合的自我介紹</h3>
            <p className="text-gray-600 mb-2">學術研討會、專業研究小組、學位答辯等場合的自我介紹。</p>
            <p className="text-gray-600 mb-6">請訪問我們的案例庫查看詳細範例和最佳實踐。</p>
            <Link to="/projects" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              開始創建學術自我介紹
            </Link>
          </div>
        </div>
        
        {/* Social Category - Placeholder */}
        <div className={activeCategory === 'social' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-indigo-600 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">社交場合的自我介紹</h3>
            <p className="text-gray-600 mb-2">社交聚會、商務交流、行業研討會等場合的自我介紹。</p>
            <p className="text-gray-600 mb-6">請訪問我們的案例庫查看詳細範例和最佳實踐。</p>
            <Link to="/projects" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              開始創建社交自我介紹
            </Link>
          </div>
        </div>
        
        {/* Presentation Category - Placeholder */}
        <div className={activeCategory === 'presentation' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faMicrophone} className="text-indigo-600 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">演講開場的自我介紹</h3>
            <p className="text-gray-600 mb-2">公眾演講、專業培訓、工作坊、線上課程等場合的自我介紹。</p>
            <p className="text-gray-600 mb-6">請訪問我們的案例庫查看詳細範例和最佳實踐。</p>
            <Link to="/projects" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              開始創建演講自我介紹
            </Link>
          </div>
        </div>
        
        {/* Online Category - Placeholder */}
        <div className={activeCategory === 'online' ? 'block' : 'hidden'}>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faGlobe} className="text-indigo-600 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">線上社群的自我介紹</h3>
            <p className="text-gray-600 mb-2">LinkedIn、個人網站、社群媒體、專業論壇等平台的自我介紹。</p>
            <p className="text-gray-600 mb-6">請訪問我們的案例庫查看詳細範例和最佳實踐。</p>
            <Link to="/projects" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              開始創建線上自我介紹
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-indigo-600 text-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">使用成效統計</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon icon={faChartLine} className="text-white text-4xl" />
              </div>
              <div className="text-4xl font-bold mb-2">85%</div>
              <p className="opacity-80">用戶表示面試成功率提升</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon icon={faClock} className="text-white text-4xl" />
              </div>
              <div className="text-4xl font-bold mb-2">75%</div>
              <p className="opacity-80">準備時間節省</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-white text-4xl" />
              </div>
              <div className="text-4xl font-bold mb-2">90%</div>
              <p className="opacity-80">用戶對生成內容表示滿意</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">用戶心得分享</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    "將AI生成的自我介紹與我原本準備的版本進行比較，發現AI版本更加有條理且突出了我的關鍵優勢。
                    在實際面試中使用後，收到了面試官的正面評價，最終成功獲得了工作機會。"
                  </p>
                  <p className="text-gray-600 font-medium">— 張先生，資深工程師</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    "作為一名非母語人士，我一直擔心在英文面試中無法清晰表達自己。自介達人幫我生成了專業的英文自我介紹，
                    大大提升了我的信心，也節省了我很多準備時間。"
                  </p>
                  <p className="text-gray-600 font-medium">— 李小姐，國際市場分析師</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    "研究所申請準備時使用了自介達人，生成的內容既專業又能突出我的學術興趣和研究潛力。
                    與其他申請者相比，我的自我介紹更加有說服力，最終獲得了理想學校的錄取。"
                  </p>
                  <p className="text-gray-600 font-medium">— 黃同學，研究所申請者</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faQuoteLeft} className="text-indigo-400 text-xl mr-4 mt-1" />
                <div>
                  <p className="text-gray-700 mb-4">
                    "需要在公司年會上做簡短的自我介紹，但一直不知道該如何組織內容。使用自介達人後，
                    生成的內容既專業又帶有適當的個人風格，讓我在活動中留下了深刻印象。"
                  </p>
                  <p className="text-gray-600 font-medium">— 趙先生，部門主管</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">開始創建您的專業自我介紹</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            無論您需要準備面試、演講還是社交場合的自我介紹，自介達人都能幫助您創建專業、有說服力的內容
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/projects" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
              立即開始使用
            </Link>
            <Link to="/features" className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition">
              了解更多功能
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCases; 