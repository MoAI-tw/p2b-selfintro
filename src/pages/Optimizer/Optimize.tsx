import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMagic, 
  faArrowLeft, 
  faWandMagicSparkles, 
  faExclamationTriangle,
  faInfoCircle,
  faCheck,
  faPlay,
  faPause,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useApiKey } from '../../context/ApiKeyContext';
import { useOptimizerPrompt } from '../../context/OptimizerPromptContext';
import { 
  analyzeAudio, 
  AudioAnalysisRequest, 
  OptimizerSettings, 
  generateOptimizationGuidance,
  generateAudioAnalysisPrompt,
  generateAudioOptimizationPrompt
} from '../../utils/optimizer/promptService';

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
    promptTemplate?: {
      id: string;
      name: string;
      description: string;
      analysisTemplate: string;
      guidanceTemplate: string;
    };
  };
}

interface OptimizationParams {
  improveClarity: boolean;
  improveConfidence: boolean;
  adjustSpeed: boolean;
  enhanceStructure: boolean;
  reduceFillers: boolean;
}

const defaultParams: OptimizationParams = {
  improveClarity: true,
  improveConfidence: true,
  adjustSpeed: true,
  enhanceStructure: false,
  reduceFillers: false
};

const Optimize = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('id');
  
  const [project, setProject] = useState<OptimizerProject | null>(null);
  const [params, setParams] = useState<OptimizationParams>(defaultParams);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const { apiKey, geminiApiKey, modelProvider, selectedModel } = useApiKey();
  const { currentTemplate, useCustomPrompt } = useOptimizerPrompt();

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
              
              // If project has an audio file, set it up for playback
              if (currentProject.audioFile && currentProject.audioFile.url) {
                setAudioUrl(currentProject.audioFile.url);
              } else {
                setError('此專案沒有音檔，請先錄製或上傳音檔');
                setTimeout(() => {
                  navigate(`/optimizer/recorder?id=${projectId}`);
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
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [projectId, navigate]);

  // Handle parameter changes
  const handleParamChange = (param: keyof OptimizationParams, value: any) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // Play/pause audio
  const toggleAudio = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('播放音檔時發生錯誤');
      });
    }
  };

  // Audio play/pause event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current]);

  // Start optimization
  const startOptimization = async () => {
    if (!project || !project.audioFile) return;
    
    setOptimizing(true);
    setProgress(0);
    
    // Simulate optimization process with progress updates
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          return 100;
        }
        return prev + 2;
      });
    }, 300);
    
    try {
      // Get API key from context based on provider
      const currentApiKey = modelProvider === 'openai' ? apiKey : geminiApiKey;
      
      if (!currentApiKey) {
        setError(`請設定 ${modelProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} API key 才能使用此功能。`);
        setOptimizing(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        return;
      }
      
      // Log the model and prompt template information
      console.log("Using model provider:", modelProvider);
      console.log("Selected model:", selectedModel);
      console.log("Current template:", currentTemplate);
      console.log("Using custom prompt:", useCustomPrompt);
      
      // Prepare analysis request
      const analysisRequest: AudioAnalysisRequest = {
        audioFile: project.audioFile,
        transcript: project.transcript || undefined,
        settings: params as OptimizerSettings,
        customTemplate: useCustomPrompt && currentTemplate ? {
          useCustom: true,
          analysisTemplate: currentTemplate.analysisTemplate,
          guidanceTemplate: currentTemplate.guidanceTemplate
        } : undefined
      };
      
      // Call the audio analysis service
      setProgress(30); // Update progress
      const analysisResult = await analyzeAudio(
        analysisRequest,
        currentApiKey,
        selectedModel.id,
        modelProvider
      );
      
      // Generate detailed guidance
      setProgress(60); // Update progress
      const detailedGuidance = await generateOptimizationGuidance(
        analysisRequest,
        analysisResult,
        currentApiKey,
        selectedModel.id,
        modelProvider
      );
      
      // Prepare the prompt template info
      const promptTemplateInfo = useCustomPrompt && currentTemplate 
        ? { 
            id: currentTemplate.id,
            name: currentTemplate.name,
            description: currentTemplate.description,
            analysisTemplate: currentTemplate.analysisTemplate,
            guidanceTemplate: currentTemplate.guidanceTemplate
          } 
        : { 
            id: 'default',
            name: '預設模板',
            description: '系統預設的分析模板',
            analysisTemplate: generateAudioAnalysisPrompt(analysisRequest),
            guidanceTemplate: generateAudioOptimizationPrompt(analysisRequest, analysisResult)
          };
          
      // Log prompt template info before saving
      console.log("Prompt template to be saved:", promptTemplateInfo);
      
      // Update project with optimization results
      const updatedProject: OptimizerProject = {
        ...project,
        status: 'optimized',
        lastEdited: new Date().toLocaleDateString(),
        optimizationResults: {
          optimizedAudioUrl: project.audioFile.url, // In a real app, this might be a different URL
          report: analysisResult,
          detailedGuidance, // Add detailed guidance to results
          promptTemplate: promptTemplateInfo
        }
      };
      
      // Log the updated project with optimization results
      console.log("Updated project with optimization results:", updatedProject.optimizationResults);
      
      // Update localStorage
      const storedProjects = localStorage.getItem('optimizerProjects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.map((p: OptimizerProject) => 
          p.id === projectId ? updatedProject : p
        );
        
        localStorage.setItem('optimizerProjects', JSON.stringify(updatedProjects));
      }
      
      setProject(updatedProject);
      
      // Force progress to 100% when complete
      setProgress(100);
      
      // Navigate to results page after a short delay
      setTimeout(() => {
        navigate(`/optimizer/result?id=${projectId}`);
      }, 1000);
      
    } catch (err) {
      console.error('Error during optimization:', err);
      setError('優化過程中發生錯誤，請稍後再試');
      setOptimizing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  // Navigate back
  const handleBack = () => {
    navigate(`/optimizer/recorder?id=${projectId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-600 hover:text-gray-800"
            disabled={optimizing}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {project ? `優化 "${project.title}"` : '優化自我介紹'}
          </h1>
          
          {!optimizing && (
            <Link
              to="/optimizer/prompt-editor"
              className="ml-auto text-purple-600 hover:text-purple-800 flex items-center"
              title="編輯提示詞"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-1" />
              <span className="hidden sm:inline">編輯提示詞</span>
            </Link>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {optimizing ? (
          // Optimization in progress view
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-600 mb-4">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-4xl animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">優化進行中</h2>
              <p className="text-gray-600">請稍候，我們正在處理您的音檔並生成優化結果</p>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-purple-600 h-4 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>處理中...</span>
                <span>{progress}%</span>
              </div>
            </div>
            
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>優化過程可能需要幾分鐘時間，請勿關閉或重新整理此頁面</p>
              <p className="mt-2">完成後將自動跳轉至結果頁面</p>
            </div>
          </div>
        ) : (
          // Optimization setup view
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">優化您的自我介紹</h2>
              <p className="text-gray-600">選擇以下優化選項，系統將根據您的選擇進行優化處理</p>
              
              {useCustomPrompt && currentTemplate && (
                <div className="mt-2 bg-purple-50 border-l-4 border-purple-500 text-purple-700 p-3 rounded">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    <span>目前使用自定義提示詞模板: <strong>{currentTemplate.name}</strong></span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preview Original Audio */}
            {audioUrl && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">原始錄音</h3>
                <div className="flex items-center">
                  <button 
                    onClick={toggleAudio}
                    className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-3 rounded-full mr-4`}
                  >
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                  </button>
                  <div className="flex-grow">
                    <div className="h-3 bg-blue-100 rounded-full">
                      {audioRef.current && (
                        <div 
                          className="h-3 bg-blue-500 rounded-full"
                          style={{ 
                            width: `${audioRef.current.currentTime / audioRef.current.duration * 100 || 0}%`,
                            transition: 'width 0.1s linear'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    className="hidden"
                    onTimeUpdate={() => {
                      // Force a re-render to update the progress bar
                      setIsPlaying(prevState => prevState);
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Optimization Options */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">優化選項</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="improveClarity"
                      type="checkbox"
                      checked={params.improveClarity}
                      onChange={e => handleParamChange('improveClarity', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="improveClarity" className="font-medium text-gray-700">提升清晰度</label>
                    <p className="text-gray-500">增強發音清晰度，使聽眾更容易理解內容</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="improveConfidence"
                      type="checkbox"
                      checked={params.improveConfidence}
                      onChange={e => handleParamChange('improveConfidence', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="improveConfidence" className="font-medium text-gray-700">增強自信感</label>
                    <p className="text-gray-500">調整語調和節奏，讓您的自我介紹聽起來更有自信</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="adjustSpeed"
                      type="checkbox"
                      checked={params.adjustSpeed}
                      onChange={e => handleParamChange('adjustSpeed', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="adjustSpeed" className="font-medium text-gray-700">調整語速</label>
                    <p className="text-gray-500">調整語速至最佳水平，使聽眾能夠清楚理解您的訊息</p>
                  </div>
                </div>
                
                {params.adjustSpeed && (
                  <div className="ml-8 mt-2 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          id="enhanceStructure"
                          type="checkbox"
                          checked={params.enhanceStructure}
                          onChange={e => handleParamChange('enhanceStructure', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="enhanceStructure" className="ml-2 text-sm text-gray-700">改善結構</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="reduceFillers"
                          type="checkbox"
                          checked={params.reduceFillers}
                          onChange={e => handleParamChange('reduceFillers', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="reduceFillers" className="ml-2 text-sm text-gray-700">減少填充詞</label>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="generateAnalysisReport"
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="generateAnalysisReport" className="font-medium text-gray-700">生成分析報告</label>
                    <p className="text-gray-500">提供詳細的分析報告和改進建議</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-yellow-700">優化過程可能需要幾分鐘時間，完成後您將能夠：</p>
                  <ul className="list-disc list-inside mt-1 text-sm text-yellow-700">
                    <li>聆聽優化後的自我介紹</li>
                    <li>查看詳細的改善建議</li>
                    <li>比較優化前後的差異</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={startOptimization}
                disabled={loading || optimizing}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition flex items-center"
              >
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                {loading ? '處理中...' : '開始優化'}
              </button>
            </div>
          </div>
        )}
        
        {!optimizing && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
            <div className="flex">
              <FontAwesomeIcon icon={faCheck} className="mt-1 mr-3" />
              <div>
                <h4 className="font-medium">優化過程說明</h4>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>系統將分析您的口語表達習慣，包括語速、語調變化、清晰度等</li>
                  <li>根據選擇的優化選項生成改善後的音檔</li>
                  <li>提供詳細的改善建議，幫助您在下次自我介紹時更加出色</li>
                  <li>所有資料均保密處理，僅用於優化您的自我介紹</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Optimize; 