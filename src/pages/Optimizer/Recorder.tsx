import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, 
  faStop, 
  faPause, 
  faPlay, 
  faTrash, 
  faUpload, 
  faSave, 
  faArrowLeft, 
  faCog,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

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
  optimizationResults?: {
    optimizedAudioUrl?: string;
    report?: {
      speechRate: number;
      clarity: number;
      confidence: number;
      improvements: string[];
    }
  };
}

const Recorder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('id');
  
  const [project, setProject] = useState<OptimizerProject | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioVisualData, setAudioVisualData] = useState<number[]>(Array(50).fill(5));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
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
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [projectId, navigate]);
  
  // Set up audio visualization
  const setupAudioVisualization = (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyzerRef.current = audioContextRef.current.createAnalyser();
    analyzerRef.current.fftSize = 256;
    source.connect(analyzerRef.current);
    
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateAudioVisual = () => {
      if (!analyzerRef.current || !isRecording) return;
      
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Convert frequency data to visual representation
      const visualData = Array.from({ length: 50 }, (_, i) => {
        const index = Math.floor(i * (bufferLength / 50));
        // Scale value to 5-100 range for visualization
        return 5 + (dataArray[index] / 255) * 95;
      });
      
      setAudioVisualData(visualData);
      animationFrameIdRef.current = requestAnimationFrame(updateAudioVisual);
    };
    
    updateAudioVisual();
  };
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      // Set up audio visualization
      setupAudioVisualization(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks from the stream
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('無法啟動錄音功能，請確認已授權使用麥克風');
    }
  };
  
  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current!);
      setIsPaused(true);
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      setIsPaused(false);
      
      // Resume visualization
      if (analyzerRef.current) {
        const updateAudioVisual = () => {
          if (!analyzerRef.current || !isRecording) return;
          
          const bufferLength = analyzerRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyzerRef.current.getByteFrequencyData(dataArray);
          
          const visualData = Array.from({ length: 50 }, (_, i) => {
            const index = Math.floor(i * (bufferLength / 50));
            return 5 + (dataArray[index] / 255) * 95;
          });
          
          setAudioVisualData(visualData);
          animationFrameIdRef.current = requestAnimationFrame(updateAudioVisual);
        };
        
        updateAudioVisual();
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
  };
  
  // Handle upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validAudioTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
    if (!validAudioTypes.includes(file.type) && !file.type.startsWith('audio/')) {
      setError('請上傳有效的音檔格式（MP3, WAV, OGG）');
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('檔案大小不得超過10MB');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    // Clear previous recording
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setLoading(false);
      
      // Get audio duration
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setRecordingTime(Math.floor(audio.duration));
      };
    };
    
    reader.onerror = () => {
      setError('讀取檔案時發生錯誤');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
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
  
  // Save recorded/uploaded audio
  const saveAudio = async () => {
    if (!projectId || !audioBlob || !project) return;
    
    try {
      setLoading(true);
      
      // In a real app, you'd upload the file to a server here
      // For now, we'll store it in localStorage using Base64
      
      // Get audio duration
      const audio = new Audio(audioUrl!);
      await new Promise((resolve) => {
        audio.onloadedmetadata = resolve;
        audio.onerror = resolve; // Handle load errors
      });
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64Audio = reader.result as string;
        
        // Update project with audio data
        const updatedProject: OptimizerProject = {
          ...project,
          status: 'recorded',
          lastEdited: new Date().toLocaleDateString(),
          audioFile: {
            name: `recording_${new Date().toISOString()}.wav`,
            size: audioBlob!.size,
            duration: Math.floor(audio.duration || recordingTime),
            url: base64Audio
          }
        };
        
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
        setLoading(false);
        
        // Navigate to optimize page
        navigate(`/optimizer/optimize?id=${projectId}`);
      };
      
      reader.onerror = () => {
        setError('處理音檔時發生錯誤');
        setLoading(false);
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (err) {
      console.error('Error saving audio:', err);
      setError('儲存音檔時發生錯誤');
      setLoading(false);
    }
  };
  
  // Delete current recording/upload
  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };
  
  // Navigate back
  const handleBack = () => {
    navigate('/optimizer');
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
            {project ? project.title : '錄製自我介紹'}
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
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">錄製或上傳您的自我介紹</h2>
            <p className="text-gray-600">請錄製您的自我介紹音檔，或上傳已經準備好的音檔，系統將幫助您分析並提供改善建議。</p>
          </div>
          
          {/* Recording Visualization */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700">
                {isRecording ? (isPaused ? '已暫停' : '正在錄製...') : audioUrl ? '錄製完成' : '準備開始'}
              </span>
              <span className="text-lg font-medium text-gray-700">
                {formatTime(recordingTime)}
              </span>
            </div>
            
            <div className="h-24 flex items-center justify-center">
              {isRecording || audioUrl ? (
                <div className="w-full h-20 flex items-center space-x-1">
                  {audioVisualData.map((height, index) => (
                    <div 
                      key={index}
                      className={`w-1.5 rounded-full ${isRecording && !isPaused ? 'bg-purple-600' : 'bg-gray-400'}`}
                      style={{
                        height: `${isRecording && !isPaused ? height : 5}%`,
                        transition: 'height 0.1s ease'
                      }}
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <FontAwesomeIcon icon={faMicrophone} className="text-4xl mb-2" />
                  <p>點擊下方按鈕開始錄製</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recording Controls */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition flex items-center"
              >
                <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
                開始錄製
              </button>
            )}
            
            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faPause} className="mr-2" />
                  暫停
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faStop} className="mr-2" />
                  停止
                </button>
              </>
            )}
            
            {isRecording && isPaused && (
              <>
                <button
                  onClick={resumeRecording}
                  className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  繼續
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faStop} className="mr-2" />
                  停止
                </button>
              </>
            )}
            
            {audioUrl && !isRecording && (
              <>
                <button
                  onClick={toggleAudio}
                  className={`${isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-3 rounded-full transition flex items-center`}
                >
                  <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="mr-2" />
                  {isPlaying ? '暫停' : '播放'}
                </button>
                <button
                  onClick={deleteAudio}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  刪除
                </button>
                <button
                  onClick={saveAudio}
                  disabled={loading}
                  className={`bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {loading ? '保存中...' : '保存並繼續'}
                </button>
              </>
            )}
          </div>
          
          {/* Upload Option */}
          {!isRecording && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-center">
                <span className="text-gray-500">或者</span>
              </div>
              <div className="mt-4 text-center">
                <label className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition cursor-pointer">
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  上傳音檔
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isRecording || loading}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">支援格式：MP3, WAV, OGG（最大10MB）</p>
              </div>
            </div>
          )}
          
          {/* Audio Player (hidden) */}
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          )}
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <div className="flex">
            <FontAwesomeIcon icon={faCog} className="mt-1 mr-3" />
            <div>
              <h4 className="font-medium">小提示</h4>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>請在安靜的環境中錄製以獲得最佳效果</li>
                <li>自我介紹時間建議在1-2分鐘左右</li>
                <li>聲音清晰且語速適中會得到更好的分析結果</li>
                <li>可以先練習幾次再進行正式錄製</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recorder; 