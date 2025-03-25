import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faEye, 
  faSort, 
  faSortUp, 
  faSortDown, 
  faCalendarAlt, 
  faFileAlt, 
  faTrash, 
  faMicrophone,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
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

// 自我介紹優化歷史記錄類型
interface OptimizationRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  timestamp: number;
  audioFile: {
    name: string;
    size: number;
    duration: number;
  };
  optimizationResults?: {
    optimizedAudioUrl?: string;
    report?: {
      speechRate: number;
      clarity: number;
      confidence: number;
      improvements: string[];
    };
    detailedGuidance?: string;
    promptTemplate?: {
      id: string;
      name: string;
      description: string;
      analysisTemplate: string;
      guidanceTemplate: string;
    };
  };
}

// 自我介紹優化歷史頁面
const OptimizerHistory: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sortField, setSortField] = useState<keyof OptimizationRecord>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<OptimizationRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string>('');
  const [records, setRecords] = useState<OptimizationRecord[]>([]);
  
  // 從 localStorage 讀取優化記錄
  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem('optimizerHistoryRecords');
      if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords);
        if (Array.isArray(parsedRecords)) {
          setRecords(parsedRecords);
        } else {
          console.error('Stored optimizer history records is not an array');
          setRecords([]);
        }
      } else {
        // 初始化空陣列
        setRecords([]);
      }
    } catch (error) {
      console.error('Error parsing stored optimizer history records:', error);
      setRecords([]);
    }
  }, []);
  
  // 排序記錄
  const sortedRecords = [...records].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    } else if (sortField === 'audioFile') {
      const aValue = a.audioFile?.size || 0;
      const bValue = b.audioFile?.size || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });
  
  // 切換排序方向
  const toggleSort = (field: keyof OptimizationRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 查看記錄詳情
  const handleViewRecord = (record: OptimizationRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };
  
  // 關閉模態窗
  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };
  
  // 準備刪除記錄
  const handleDeleteClick = (record: OptimizationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(record.id);
    setShowDeleteModal(true);
  };
  
  // 確認刪除記錄
  const confirmDelete = () => {
    try {
      const newRecords = records.filter(record => record.id !== recordToDelete);
      setRecords(newRecords);
      localStorage.setItem('optimizerHistoryRecords', JSON.stringify(newRecords));
      showToast('優化記錄已刪除', 'success');
    } catch (error) {
      console.error('Error deleting optimizer record:', error);
      showToast('刪除失敗，請重試', 'error');
    }
    setShowDeleteModal(false);
    setRecordToDelete('');
  };
  
  // 渲染排序圖標
  const renderSortIcon = (field: keyof OptimizationRecord) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ml-1 text-indigo-600" />
      : <FontAwesomeIcon icon={faSortDown} className="ml-1 text-indigo-600" />;
  };
  
  // 查看項目詳情
  const viewProjectDetails = (projectId: string) => {
    navigate(`/optimizer/result?id=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link 
                to="/optimizer"
                className="text-gray-600 hover:text-gray-800 flex items-center mr-4"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                返回專案列表
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">自我介紹優化歷史</h1>
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
                          優化時間
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
                          音檔資訊
                        </div>
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">操作</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(record.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{record.projectTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {record.audioFile?.name}
                            <span className="text-gray-500 ml-2">
                              ({Math.round(record.audioFile?.duration || 0)}秒, {Math.round(record.audioFile?.size / 1024)}KB)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => viewProjectDetails(record.projectId)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              title="查看優化結果"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-1" />
                              查看結果
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
                <FontAwesomeIcon icon={faChartBar} className="text-purple-300 text-6xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">尚無優化記錄</h2>
              <p className="text-gray-600 mb-6">您尚未進行任何自我介紹優化，請返回專案頁面並開始優化</p>
              <Link
                to="/optimizer"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition inline-block"
              >
                返回專案頁面
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* 優化詳情模態窗 */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={selectedRecord ? `${selectedRecord.projectTitle} - 優化詳情` : '優化詳情'}
      >
        {selectedRecord && (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">基本資訊</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">優化時間</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRecord.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">音檔資訊</p>
                    <p className="text-base text-gray-900">
                      {selectedRecord.audioFile?.name} ({Math.round(selectedRecord.audioFile?.duration || 0)}秒, {Math.round(selectedRecord.audioFile?.size / 1024)}KB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedRecord.optimizationResults?.report && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">評估結果</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">語速</p>
                      <p className="text-lg font-semibold">{selectedRecord.optimizationResults.report.speechRate.toFixed(1)}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">清晰度</p>
                      <p className="text-lg font-semibold">{Math.round(selectedRecord.optimizationResults.report.clarity)}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">自信度</p>
                      <p className="text-lg font-semibold">{Math.round(selectedRecord.optimizationResults.report.confidence)}/100</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">改進建議</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedRecord.optimizationResults.report.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-gray-800">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {selectedRecord.optimizationResults?.promptTemplate && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">使用的提示詞模板</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">模板名稱</p>
                    <p className="text-base text-gray-900">{selectedRecord.optimizationResults.promptTemplate.name}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">模板描述</p>
                    <p className="text-base text-gray-900">{selectedRecord.optimizationResults.promptTemplate.description}</p>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">分析提示詞</p>
                      <button 
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecord.optimizationResults!.promptTemplate!.analysisTemplate);
                          showToast('已複製分析提示詞', 'success');
                        }}
                      >
                        複製
                      </button>
                    </div>
                    <div className="mt-2 bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedRecord.optimizationResults.promptTemplate.analysisTemplate}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">優化指導提示詞</p>
                      <button 
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRecord.optimizationResults!.promptTemplate!.guidanceTemplate);
                          showToast('已複製優化指導提示詞', 'success');
                        }}
                      >
                        複製
                      </button>
                    </div>
                    <div className="mt-2 bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedRecord.optimizationResults.promptTemplate.guidanceTemplate}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => viewProjectDetails(selectedRecord.projectId)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                查看完整結果
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 刪除確認模態窗 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="確認刪除"
      >
        <div className="p-6">
          <p className="mb-6 text-gray-700">確定要刪除這條優化歷史記錄嗎？此操作無法撤銷。</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              確認刪除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OptimizerHistory; 