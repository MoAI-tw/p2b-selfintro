import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, 
  faChevronDown, 
  faChevronUp, 
  faEye, 
  faTrash, 
  faClipboard, 
  faInfoCircle,
  faFileAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useFormContext, GenerationRecord } from '../context/FormContext';
import { useToast } from './ToastContainer';
import Modal from './Modal';

interface GenerationHistoryProps {
  onSelectRecord?: (record: GenerationRecord) => void;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ onSelectRecord }) => {
  const { getGenerationRecords, deleteGenerationRecord } = useFormContext();
  const { showToast } = useToast();
  const records = getGenerationRecords();
  
  const [selectedRecord, setSelectedRecord] = useState<GenerationRecord | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  
  // Load project names when component mounts
  useEffect(() => {
    // Get project data from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        const projects = JSON.parse(storedProjects);
        // Create a map of project IDs to project names
        const nameMap: Record<string, string> = {};
        projects.forEach((project: any) => {
          nameMap[project.id.toString()] = project.title;
        });
        setProjectNames(nameMap);
      } catch (error) {
        console.error('Error parsing stored projects:', error);
      }
    }
  }, []);

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Get project name based on project ID
  const getProjectName = (projectId: string | number) => {
    const id = String(projectId);
    return projectNames[id] || id || '未命名專案';
  };
  
  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Format model name for display
  const formatModelName = (provider: string, modelId: string) => {
    return `${provider === 'openai' ? 'OpenAI' : 'Gemini'} - ${modelId}`;
  };

  // Handle selecting a record
  const handleSelectRecord = (record: GenerationRecord) => {
    if (onSelectRecord) {
      onSelectRecord(record);
    }
  };
  
  // Show prompt details in modal
  const viewPromptDetails = (record: GenerationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRecord(record);
    setShowPromptModal(true);
  };
  
  // Copy prompt to clipboard
  const copyPromptToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      showToast('已複製到剪貼簿', 'success');
    }).catch(err => {
      console.error('無法複製到剪貼簿:', err);
      showToast('複製失敗，請再試一次', 'error');
    });
  };

  // Show delete confirmation modal
  const handleDeleteClick = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(recordId);
    setShowDeleteModal(true);
  };

  // Confirm record deletion
  const confirmDelete = () => {
    if (recordToDelete) {
      const recordToDeleteData = records.find(record => record.id === recordToDelete);
      const projectName = recordToDeleteData ? getProjectName(recordToDeleteData.projectId) : '';
      
      deleteGenerationRecord(recordToDelete);
      setShowDeleteModal(false);
      
      // Show success toast notification
      showToast(`已成功刪除「${projectName}」的生成記錄`, 'success');
      
      // Check if we need to adjust current page after deletion
      const newTotalPages = Math.ceil((records.length - 1) / recordsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faHistory} className="mr-2 text-indigo-600" />
          生成歷史記錄
        </h2>
        <span className="text-sm text-gray-500">{records.length} 筆記錄</span>
      </div>
      
      {records.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時間
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    專案名稱
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    職位
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    關鍵詞
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    語言/時長
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    模型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提示詞
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectRecord(record)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getProjectName(record.projectId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.formData.industrySettings.specificPosition}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.formData.personalInfo.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {record.formData.industrySettings.keywords.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {keyword}
                          </span>
                        ))}
                        {record.formData.industrySettings.keywords.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{record.formData.industrySettings.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.formData.generationSettings.language}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.formData.generationSettings.duration}秒
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatModelName(record.modelProvider, record.modelId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={(e) => viewPromptDetails(record, e)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="查看提示詞"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        onClick={(e) => copyPromptToClipboard(record.actualPrompt, e)}
                        className="text-gray-600 hover:text-gray-900"
                        title="複製提示詞"
                      >
                        <FontAwesomeIcon icon={faClipboard} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/result?record=${record.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={(e) => e.stopPropagation()}
                        title="查看結果"
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                      </Link>
                      <button
                        onClick={(e) => handleDeleteClick(record.id, e)}
                        className="text-red-600 hover:text-red-900"
                        title="刪除記錄"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                上一頁
              </button>
              <button
                onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                下一頁
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  顯示 <span className="font-medium">{indexOfFirstRecord + 1}</span> 至 <span className="font-medium">
                    {Math.min(indexOfLastRecord, records.length)}
                  </span> 筆，共 <span className="font-medium">{records.length}</span> 筆記錄
                </p>
              </div>
              <div>
                {totalPages > 1 && (
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">上一頁</span>
                      <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === number
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">下一頁</span>
                      <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
                    </button>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>尚無生成記錄</p>
          <p className="text-sm mt-2">產生自我介紹後，相關記錄將會顯示在此處</p>
        </div>
      )}
      
      {/* Prompt Details Modal */}
      {showPromptModal && selectedRecord && (
        <Modal
          isOpen={showPromptModal}
          onClose={() => setShowPromptModal(false)}
          title="提示詞詳情"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">提示詞模板</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                {selectedRecord.promptTemplate}
              </div>
              <button 
                onClick={(e) => copyPromptToClipboard(selectedRecord.promptTemplate, e)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FontAwesomeIcon icon={faClipboard} className="mr-1" />
                複製到剪貼簿
              </button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">實際提示詞</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                {selectedRecord.actualPrompt}
              </div>
              <button 
                onClick={(e) => copyPromptToClipboard(selectedRecord.actualPrompt, e)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FontAwesomeIcon icon={faClipboard} className="mr-1" />
                複製到剪貼簿
              </button>
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <div>
                <span className="font-medium">Token估計: </span>
                {selectedRecord.estimatedTokens}
              </div>
              <div>
                <span className="font-medium">成本估計: </span>
                ${selectedRecord.estimatedCost.toFixed(5)} USD
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="確認刪除"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">您確定要刪除此生成記錄嗎？此操作無法還原。</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              刪除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GenerationHistory; 