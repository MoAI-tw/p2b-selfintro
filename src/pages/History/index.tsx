import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faSort, faSortUp, faSortDown, faCalendarAlt, faFileAlt, faServer, faTrash, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { useFormContext, GenerationRecord } from '../../context/FormContext';
import { useToast } from '../../components/ToastContainer';
import Modal from '../../components/Modal';

// 格式化時間戳
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 生成歷史頁面
const History: React.FC = () => {
  const navigate = useNavigate();
  const { getGenerationRecords, deleteGenerationRecord } = useFormContext();
  const { showToast } = useToast();
  const [sortField, setSortField] = useState<keyof GenerationRecord>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<GenerationRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
  
  // 獲取所有生成記錄
  const records = getGenerationRecords();
  
  // 排序記錄
  const sortedRecords = [...records].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    } else if (sortField === 'estimatedTokens' || sortField === 'estimatedCost') {
      return sortDirection === 'asc' 
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    } else {
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });
  
  // 切換排序方向
  const toggleSort = (field: keyof GenerationRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 渲染排序圖標
  const renderSortIcon = (field: keyof GenerationRecord) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ml-1 text-indigo-600" />
      : <FontAwesomeIcon icon={faSortDown} className="ml-1 text-indigo-600" />;
  };
  
  // 處理記錄查看
  const handleViewRecord = (record: GenerationRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };
  
  // 關閉模態窗
  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };
  
  // 顯示刪除確認
  const handleDeleteClick = (record: GenerationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(record.id);
    setShowDeleteModal(true);
  };
  
  // 確認刪除記錄
  const confirmDelete = () => {
    if (recordToDelete) {
      const record = records.find(r => r.id === recordToDelete);
      const projectTitle = record?.projectTitle || "未命名專案";
      
      deleteGenerationRecord(recordToDelete);
      setShowDeleteModal(false);
      
      // Show success toast
      showToast(`已成功刪除「${projectTitle}」的生成記錄`, 'success');
    }
  };

  // 複製到剪貼簿
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已複製到剪貼簿', 'success');
    }).catch(err => {
      console.error('無法複製到剪貼簿:', err);
      showToast('複製失敗，請再試一次', 'error');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link 
                to="/projects"
                className="text-gray-600 hover:text-gray-800 flex items-center mr-4"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                返回專案列表
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">生成歷史記錄</h1>
            </div>
          </div>
          
          {records.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('timestamp')}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                          時間
                          {renderSortIcon('timestamp')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('projectTitle')}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                          專案名稱
                          {renderSortIcon('projectTitle')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('modelProvider')}
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faServer} className="mr-2" />
                          使用模型
                          {renderSortIcon('modelProvider')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('estimatedTokens')}
                      >
                        <div className="flex items-center">
                          Token 數
                          {renderSortIcon('estimatedTokens')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('estimatedCost')}
                      >
                        <div className="flex items-center">
                          費用 (USD)
                          {renderSortIcon('estimatedCost')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(record.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.projectTitle || "未命名專案"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} - {record.modelId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.estimatedTokens.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${record.estimatedCost.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleViewRecord(record)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              title="查看詳情"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />
                              查看詳情
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(record, e)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center"
                              title="刪除記錄"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <FontAwesomeIcon icon={faFileAlt} className="text-gray-300 text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">尚無生成記錄</h2>
              <p className="text-gray-600 mb-6">您尚未生成任何自我介紹，請返回專案頁面並點擊「生成」按鈕</p>
              <Link
                to="/projects"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition inline-block"
              >
                返回專案頁面
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* 詳細資訊模態窗 */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">
                生成記錄詳情 - {selectedRecord.projectTitle}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">基本資訊</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="mb-2"><span className="font-medium">生成時間:</span> {formatDate(selectedRecord.timestamp)}</p>
                    <p className="mb-2"><span className="font-medium">專案ID:</span> {selectedRecord.projectId}</p>
                    <p className="mb-2"><span className="font-medium">使用模型:</span> {selectedRecord.modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} - {selectedRecord.modelId}</p>
                    <p className="mb-2"><span className="font-medium">Token 估算:</span> {selectedRecord.estimatedTokens.toLocaleString()}</p>
                    <p><span className="font-medium">費用估算:</span> ${selectedRecord.estimatedCost.toFixed(6)} USD</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">生成設定</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="mb-2"><span className="font-medium">語言:</span> {selectedRecord.formData.generationSettings.language}</p>
                    <p className="mb-2"><span className="font-medium">風格:</span> {selectedRecord.formData.generationSettings.style}</p>
                    <p className="mb-2"><span className="font-medium">時長:</span> {selectedRecord.formData.generationSettings.duration} 秒</p>
                    <p><span className="font-medium">結構:</span> {selectedRecord.formData.generationSettings.structure}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">提示詞模板</h4>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-sm text-gray-700">
                    {selectedRecord.promptTemplate}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(selectedRecord.promptTemplate)}
                    className="absolute top-2 right-2 bg-white p-1 rounded-md shadow-sm hover:bg-gray-100"
                    title="複製到剪貼簿"
                  >
                    <FontAwesomeIcon icon={faClipboard} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">實際提示詞</h4>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-sm text-gray-700">
                    {selectedRecord.actualPrompt}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(selectedRecord.actualPrompt)}
                    className="absolute top-2 right-2 bg-white p-1 rounded-md shadow-sm hover:bg-gray-100"
                    title="複製到剪貼簿"
                  >
                    <FontAwesomeIcon icon={faClipboard} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">生成結果</h4>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-sm text-gray-700">
                    {selectedRecord.generatedText}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(selectedRecord.generatedText)}
                    className="absolute top-2 right-2 bg-white p-1 rounded-md shadow-sm hover:bg-gray-100"
                    title="複製到剪貼簿"
                  >
                    <FontAwesomeIcon icon={faClipboard} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 刪除確認模態窗 */}
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

export default History; 