import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faRobot, 
  faPencilAlt, 
  faSyncAlt, 
  faSave, 
  faLanguage, 
  faClock, 
  faFileAlt,
  faLightbulb,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const Features = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page title */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">自介達人的核心功能</h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            我們的AI自我介紹生成器提供多種功能，幫助您創建量身定制的專業自我介紹
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Key features section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-12 text-center">關鍵功能</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faRobot} className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">AI智能生成</h3>
              <p className="text-gray-600 text-center">
                基於先進的自然語言處理技術，根據您的個人資料和行業需求，智能生成專業且有說服力的自我介紹
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faPencilAlt} className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">個性化定制</h3>
              <p className="text-gray-600 text-center">
                提供多種參數設置，包括風格、語調、結構等，讓您能夠完全客制化自我介紹，以適應不同場合
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faSyncAlt} className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">多版本管理</h3>
              <p className="text-gray-600 text-center">
                同時保存多個自我介紹版本，以便您針對不同的應用場景進行管理和優化，提高求職或演講的準備效率
              </p>
            </div>
          </div>
        </div>

        {/* Detailed feature list */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-12 text-center">詳細功能列表</h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 flex-shrink-0 flex justify-center mb-4 md:mb-0">
                    <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faSave} className="text-indigo-600 text-3xl" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">專案管理系統</h3>
                    <p className="text-gray-600 mb-4">
                      創建並管理多個自我介紹專案，每個專案可以針對不同的職位、場合或目標進行優化。系統允許您輕鬆地查看、編輯、複製或刪除現有專案。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">同時管理多個自介版本，適合不同場合使用</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">一鍵複製現有專案，快速創建新版本</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">詳細記錄每個版本的編輯歷史和使用場景</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 flex-shrink-0 flex justify-center mb-4 md:mb-0">
                    <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faLanguage} className="text-indigo-600 text-3xl" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">多語言支持</h3>
                    <p className="text-gray-600 mb-4">
                      支持中文和英文自我介紹的生成，以適應不同的工作環境和國際化需求。未來將支持更多語言，以滿足全球用戶的需求。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">中英文雙語支持，適應不同工作環境</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">專業翻譯品質，確保語言表達準確到位</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">優化跨文化表達方式，提高溝通效果</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 flex-shrink-0 flex justify-center mb-4 md:mb-0">
                    <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-indigo-600 text-3xl" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">時間管控功能</h3>
                    <p className="text-gray-600 mb-4">
                      根據您預設的時間限制，生成最適合的自我介紹內容，確保您的表達既充分又簡潔，適合不同的面試或演講時間要求。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">自定義時間長度，從30秒到5分鐘不等</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">智能內容優先級排序，確保重點內容優先呈現</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">提供朗讀計時參考，幫助掌握實際演講節奏</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 flex-shrink-0 flex justify-center mb-4 md:mb-0">
                    <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileAlt} className="text-indigo-600 text-3xl" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">自定義模板</h3>
                    <p className="text-gray-600 mb-4">
                      提供多種專業模板，根據不同行業和場景優化。您也可以自定義生成提示詞，進一步控制生成內容的結構和重點。
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">針對不同行業的專業模板，突出行業關鍵能力</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">自定義提示詞功能，精確控制生成內容</span>
                      </li>
                      <li className="flex items-start">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2" />
                        <span className="text-gray-700">內容結構調整，按照您的偏好組織信息</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use suggestions */}
        <div className="bg-indigo-50 rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <FontAwesomeIcon icon={faLightbulb} className="text-indigo-600 text-3xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">使用建議</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              為了獲得最佳自我介紹效果，我們建議您詳細填寫個人資料並嘗試不同的生成設置
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">內容豐富度</h3>
              <p className="text-gray-600 mb-2">
                填寫更多的經歷、技能和成就，讓AI有更多素材可以選擇。特別是與目標職位相關的經驗和成就，應當盡可能詳細描述。
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">針對性定制</h3>
              <p className="text-gray-600 mb-2">
                根據不同的目標職位和場合，調整產業設置和關鍵詞，讓生成的內容更加針對性強，突出您最相關的優勢。
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">嘗試不同版本</h3>
              <p className="text-gray-600 mb-2">
                生成多個不同風格和結構的自我介紹，進行比較和選擇，或者從中提取最適合的部分組合使用。
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">練習與調整</h3>
              <p className="text-gray-600 mb-2">
                生成的自我介紹可以作為基礎，建議您實際朗讀並計時，根據實際情況進行調整和練習，使表達更自然流暢。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">立即開始使用自介達人</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            免費體驗我們的核心功能，創建您的第一個專業自我介紹
          </p>
          <Link to="/projects" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition inline-block">
            開始創建
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features; 