import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlay, 
  faPause,
  faExclamationTriangle,
  faDownload,
  faRedo,
  faChartBar,
  faLightbulb,
  faVolumeUp,
  faClock,
  faMicrophone
} from '@fortawesome/free-solid-svg-icons';
import { parse } from 'marked';

interface OptimizerProject {
  id: string;
  title: string;
  status: string;
  lastEdited: string;
  description: string;
  audioFile?: {
    name: string;
    size: number;
    duration: number;
    url: string;
  };
  transcript?: string;
  optimizationResults?: {
    optimizedAudioUrl?: string;
    report?: {
      speechRate: number;
      clarity: number;
      confidence: number;
      improvements: string[];
    };
    detailedGuidance?: string;
  };
}

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('id');
  
  const [project, setProject] = useState<OptimizerProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [optimizedAudioUrl, setOptimizedAudioUrl] = useState<string | null>(null);
  const [isOriginalPlaying, setIsOriginalPlaying] = useState(false);
  const [isOptimizedPlaying, setIsOptimizedPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'report' | 'detailed'>('comparison');
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const optimizedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load project data
  useEffect(() => {
    if (projectId) {
      const loadProjectData = () => {
        try {
          const storedProjects = localStorage.getItem('optimizerProjects');
          if (storedProjects) {
            const projects = JSON.parse(storedProjects);
            const currentProject = projects.find((p: OptimizerProject) => p.id === projectId);
            
            if (currentProject) {
              setProject(currentProject);
              
              // Set audio URLs for playback
              if (currentProject.audioFile && currentProject.audioFile.url) {
                setOriginalAudioUrl(currentProject.audioFile.url);
              }
              
              if (currentProject.optimizationResults && currentProject.optimizationResults.optimizedAudioUrl) {
                setOptimizedAudioUrl(currentProject.optimizationResults.optimizedAudioUrl);
                
                // Save to optimization history
                saveToHistory(currentProject);
              } else {
                setError('找不到優化結果，請先進行優化');
                setTimeout(() => {
                  navigate(`/optimizer/optimize?id=${projectId}`);
                }, 2000);
              }
            } else {
              setError('找不到專案資料');
              setTimeout(() => {
                navigate('/optimizer');
              }, 2000);
            }
          } else {
            setError('找不到專案資料');
            setTimeout(() => {
              navigate('/optimizer');
            }, 2000);
          }
        } catch (err) {
          console.error('Error loading project data:', err);
          setError('載入專案資料時發生錯誤');
        }
      };
      
      loadProjectData();
    } else {
      setError('未提供專案ID');
      setTimeout(() => {
        navigate('/optimizer');
      }, 2000);
    }
    
    return () => {
      // Cleanup audio elements
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
      }
      if (optimizedAudioRef.current) {
        optimizedAudioRef.current.pause();
      }
    };
  }, [projectId, navigate]);

  // Save to optimization history
  const saveToHistory = (currentProject: OptimizerProject) => {
    try {
      // Create a unique ID for this history record
      const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the history record
      const historyRecord = {
        id: historyId,
        projectId: currentProject.id,
        projectTitle: currentProject.title,
        timestamp: Date.now(),
        audioFile: currentProject.audioFile,
        optimizationResults: currentProject.optimizationResults
      };
      
      // Get existing history records
      const existingRecordsStr = localStorage.getItem('optimizerHistoryRecords');
      let historyRecords = [];
      
      if (existingRecordsStr) {
        try {
          const parsedRecords = JSON.parse(existingRecordsStr);
          if (Array.isArray(parsedRecords)) {
            historyRecords = parsedRecords;
          }
        } catch (e) {
          console.error('Error parsing history records:', e);
        }
      }
      
      // Check if this project result is already in history (avoid duplicates)
      const isDuplicate = historyRecords.some(
        record => record.projectId === currentProject.id && 
                 record.timestamp > Date.now() - 5000 // Only consider records from the last 5 seconds
      );
      
      if (!isDuplicate) {
        // Add new record
        historyRecords.push(historyRecord);
        
        // Save updated records
        localStorage.setItem('optimizerHistoryRecords', JSON.stringify(historyRecords));
      }
    } catch (e) {
      console.error('Error saving to history:', e);
    }
  };

  // Toggle original audio playback
  const toggleOriginalAudio = () => {
    if (!originalAudioRef.current || !originalAudioUrl) return;
    
    // Pause optimized audio if playing
    if (optimizedAudioRef.current && isOptimizedPlaying) {
      optimizedAudioRef.current.pause();
    }
    
    if (isOriginalPlaying) {
      originalAudioRef.current.pause();
    } else {
      originalAudioRef.current.play().catch(err => {
        console.error('Error playing original audio:', err);
        setError('播放原始音檔時發生錯誤');
      });
    }
  };

  // Toggle optimized audio playback
  const toggleOptimizedAudio = () => {
    if (!optimizedAudioRef.current || !optimizedAudioUrl) return;
    
    // Pause original audio if playing
    if (originalAudioRef.current && isOriginalPlaying) {
      originalAudioRef.current.pause();
    }
    
    if (isOptimizedPlaying) {
      optimizedAudioRef.current.pause();
    } else {
      optimizedAudioRef.current.play().catch(err => {
        console.error('Error playing optimized audio:', err);
        setError('播放優化音檔時發生錯誤');
      });
    }
  };

  // Audio play/pause event handlers
  useEffect(() => {
    // Original audio
    const originalAudio = originalAudioRef.current;
    if (originalAudio) {
      const handlePlay = () => setIsOriginalPlaying(true);
      const handlePause = () => setIsOriginalPlaying(false);
      const handleEnded = () => setIsOriginalPlaying(false);
      
      originalAudio.addEventListener('play', handlePlay);
      originalAudio.addEventListener('pause', handlePause);
      originalAudio.addEventListener('ended', handleEnded);
      
      return () => {
        originalAudio.removeEventListener('play', handlePlay);
        originalAudio.removeEventListener('pause', handlePause);
        originalAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [originalAudioRef.current]);

  // Audio play/pause event handlers for optimized audio
  useEffect(() => {
    // Optimized audio
    const optimizedAudio = optimizedAudioRef.current;
    if (optimizedAudio) {
      const handlePlay = () => setIsOptimizedPlaying(true);
      const handlePause = () => setIsOptimizedPlaying(false);
      const handleEnded = () => setIsOptimizedPlaying(false);
      
      optimizedAudio.addEventListener('play', handlePlay);
      optimizedAudio.addEventListener('pause', handlePause);
      optimizedAudio.addEventListener('ended', handleEnded);
      
      return () => {
        optimizedAudio.removeEventListener('play', handlePlay);
        optimizedAudio.removeEventListener('pause', handlePause);
        optimizedAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [optimizedAudioRef.current]);

  // Download optimized audio
  const downloadOptimizedAudio = () => {
    if (!optimizedAudioUrl) return;
    
    // Create temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = optimizedAudioUrl;
    anchor.download = `optimized_self_intro_${new Date().toISOString().slice(0, 10)}.wav`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Start new optimization
  const startNewOptimization = () => {
    navigate(`/optimizer/optimize?id=${projectId}`);
  };

  // Navigate back
  const handleBack = () => {
    navigate('/optimizer');
  };

  // Get score color class based on value
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get report title based on report metrics
  const getReportTitle = () => {
    if (!project?.optimizationResults?.report) return '自我介紹評估';
    
    const { clarity, confidence, speechRate } = project.optimizationResults.report;
    const avgScore = (clarity + confidence) / 2;
    
    if (avgScore >= 90) return '出色的自我介紹';
    if (avgScore >= 80) return '很好的自我介紹';
    if (avgScore >= 70) return '良好的自我介紹';
    if (avgScore >= 60) return '中等的自我介紹';
    return '需要改進的自我介紹';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {project ? `${project.title} 的優化結果` : '優化結果'}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {project && project.optimizationResults && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'comparison'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('comparison')}
              >
                對比聆聽
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'report'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('report')}
              >
                改善報告
              </button>
              {project.optimizationResults?.detailedGuidance && (
                <button
                  className={`py-2 px-4 font-medium text-sm border-b-2 ${
                    activeTab === 'detailed'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('detailed')}
                >
                  詳細指導
                </button>
              )}
            </div>
            
            {activeTab === 'comparison' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">對比聆聽</h2>
                  <p className="text-gray-600">比較原始錄音與優化後的結果，聽出差異</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original Audio */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faMicrophone} className="text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">原始錄音</h3>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <button 
                        onClick={toggleOriginalAudio}
                        className={`${isOriginalPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-3 rounded-full mr-4`}
                      >
                        <FontAwesomeIcon icon={isOriginalPlaying ? faPause : faPlay} />
                      </button>
                      <div className="flex-grow">
                        <div className="h-3 bg-blue-100 rounded-full">
                          {originalAudioRef.current && (
                            <div 
                              className="h-3 bg-blue-500 rounded-full"
                              style={{ 
                                width: `${originalAudioRef.current.currentTime / originalAudioRef.current.duration * 100 || 0}%`,
                                transition: 'width 0.1s linear'
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {originalAudioRef.current && (
                        <span>
                          {Math.floor(originalAudioRef.current.currentTime / 60)}:
                          {Math.floor(originalAudioRef.current.currentTime % 60).toString().padStart(2, '0')} / 
                          {Math.floor(originalAudioRef.current.duration / 60)}:
                          {Math.floor(originalAudioRef.current.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    
                    <audio 
                      ref={originalAudioRef} 
                      src={originalAudioUrl || undefined} 
                      className="hidden"
                      onTimeUpdate={() => {
                        // Force a re-render to update the progress bar
                        setIsOriginalPlaying(prev => prev);
                      }}
                    />
                  </div>
                  
                  {/* Optimized Audio */}
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faVolumeUp} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-medium text-purple-700">優化後</h3>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <button 
                        onClick={toggleOptimizedAudio}
                        className={`${isOptimizedPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'} text-white p-3 rounded-full mr-4`}
                      >
                        <FontAwesomeIcon icon={isOptimizedPlaying ? faPause : faPlay} />
                      </button>
                      <div className="flex-grow">
                        <div className="h-3 bg-purple-100 rounded-full">
                          {optimizedAudioRef.current && (
                            <div 
                              className="h-3 bg-purple-500 rounded-full"
                              style={{ 
                                width: `${optimizedAudioRef.current.currentTime / optimizedAudioRef.current.duration * 100 || 0}%`,
                                transition: 'width 0.1s linear'
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {optimizedAudioRef.current && (
                        <span>
                          {Math.floor(optimizedAudioRef.current.currentTime / 60)}:
                          {Math.floor(optimizedAudioRef.current.currentTime % 60).toString().padStart(2, '0')} / 
                          {Math.floor(optimizedAudioRef.current.duration / 60)}:
                          {Math.floor(optimizedAudioRef.current.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    
                    <audio 
                      ref={optimizedAudioRef} 
                      src={optimizedAudioUrl || undefined} 
                      className="hidden"
                      onTimeUpdate={() => {
                        // Force a re-render to update the progress bar
                        setIsOptimizedPlaying(prev => prev);
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={downloadOptimizedAudio}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    下載優化音檔
                  </button>
                  <button
                    onClick={startNewOptimization}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faRedo} className="mr-2" />
                    重新優化
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'report' && project.optimizationResults.report && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{getReportTitle()}</h2>
                  <p className="text-gray-600">以下是對您自我介紹的詳細分析報告，包含優勢和改進建議</p>
                </div>
                
                {/* Overall Scores */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Speech Rate */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mx-auto mb-3">
                      <FontAwesomeIcon icon={faClock} className="text-2xl" />
                    </div>
                    <h3 className="font-medium text-gray-700 mb-1">語速評分</h3>
                    <div className={`text-2xl font-bold ${
                      project.optimizationResults.report.speechRate >= 4 ? 'text-green-600' : 
                      project.optimizationResults.report.speechRate >= 3 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {project.optimizationResults.report.speechRate.toFixed(1)}
                      <span className="text-sm font-normal text-gray-500">/5</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.optimizationResults.report.speechRate >= 4 ? '適中的語速' : 
                       project.optimizationResults.report.speechRate >= 3 ? '大致適中的語速' : '語速需要調整'}
                    </p>
                  </div>
                  
                  {/* Clarity */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 text-green-600 mx-auto mb-3">
                      <FontAwesomeIcon icon={faVolumeUp} className="text-2xl" />
                    </div>
                    <h3 className="font-medium text-gray-700 mb-1">清晰度</h3>
                    <div className={`text-2xl font-bold ${getScoreColorClass(project.optimizationResults.report.clarity)}`}>
                      {Math.round(project.optimizationResults.report.clarity)}
                      <span className="text-sm font-normal text-gray-500">/100</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.optimizationResults.report.clarity >= 90 ? '非常清晰的口語表達' : 
                       project.optimizationResults.report.clarity >= 75 ? '較為清晰的口語表達' : 
                       project.optimizationResults.report.clarity >= 60 ? '基本清晰的口語表達' : '口語表達清晰度需改進'}
                    </p>
                  </div>
                  
                  {/* Confidence */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 mx-auto mb-3">
                      <FontAwesomeIcon icon={faChartBar} className="text-2xl" />
                    </div>
                    <h3 className="font-medium text-gray-700 mb-1">自信度</h3>
                    <div className={`text-2xl font-bold ${getScoreColorClass(project.optimizationResults.report.confidence)}`}>
                      {Math.round(project.optimizationResults.report.confidence)}
                      <span className="text-sm font-normal text-gray-500">/100</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.optimizationResults.report.confidence >= 90 ? '極具自信的表現' : 
                       project.optimizationResults.report.confidence >= 75 ? '自信的表現' : 
                       project.optimizationResults.report.confidence >= 60 ? '基本自信的表現' : '表現自信度需提升'}
                    </p>
                  </div>
                </div>
                
                {/* Improvement Suggestions */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500 mr-2" />
                    改善建議
                  </h3>
                  
                  <div className="space-y-4">
                    {project.optimizationResults.report.improvements.map((improvement, index) => (
                      <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-gray-700">{improvement}</p>
                      </div>
                    ))}
                    
                    {project.optimizationResults.report.improvements.length === 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <p className="text-gray-700">您的自我介紹表現優異，沒有明顯需要改進的地方！</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    聆聽對比
                  </button>
                  <button
                    onClick={startNewOptimization}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faRedo} className="mr-2" />
                    重新優化
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'detailed' && project.optimizationResults.detailedGuidance && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">詳細優化指導</h2>
                  <p className="text-gray-600">根據您的自我介紹表現，我們提供以下專業指導和練習建議</p>
                </div>
                
                <div className="prose prose-indigo max-w-none">
                  {/* Render markdown content */}
                  <div dangerouslySetInnerHTML={{ 
                    __html: parse(project.optimizationResults.detailedGuidance) 
                  }} />
                </div>
                
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    聆聽對比
                  </button>
                  <button
                    onClick={startNewOptimization}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <FontAwesomeIcon icon={faRedo} className="mr-2" />
                    重新優化
                  </button>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <Link
                to="/optimizer"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                返回專案列表
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Result; 