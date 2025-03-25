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
  faExclamationTriangle,
  faRedo,
  faDownload,
  faArrowRight
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
                setRecordingTime(currentProject.audioFile.duration || 0);
                
                // Create a blob from the base64 data for download and other operations
                try {
                  // Extract the base64 data part from the data URL
                  const base64Data = currentProject.audioFile.url.split(',')[1];
                  const binaryString = window.atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const blob = new Blob([bytes.buffer], { type: 'audio/wav' });
                  setAudioBlob(blob);
                } catch (error) {
                  console.error('Error creating blob from audio data:', error);
                }
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
  
  // Set up playback visualization
  const setupPlaybackVisualization = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Create a new audio context if needed
    const audioContext = audioContextRef.current;
    
    // Create audio source from the audio element
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    // Create analyzer
    if (!analyzerRef.current) {
      analyzerRef.current = audioContext.createAnalyser();
      analyzerRef.current.fftSize = 256;
    }
    
    // Connect source to analyzer and then to destination (speakers)
    source.connect(analyzerRef.current);
    analyzerRef.current.connect(audioContext.destination);
    
    const updatePlaybackVisual = () => {
      if (!analyzerRef.current || !isPlaying) {
        // Keep requesting animation frames as long as playing
        if (isPlaying) {
          animationFrameIdRef.current = requestAnimationFrame(updatePlaybackVisual);
        }
        return;
      }
      
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Convert frequency data to visual representation
      const visualData = Array.from({ length: 50 }, (_, i) => {
        const index = Math.floor(i * (bufferLength / 50));
        // Scale value to 5-100 range for visualization
        return 5 + (dataArray[index] / 255) * 95;
      });
      
      setAudioVisualData(visualData);
      animationFrameIdRef.current = requestAnimationFrame(updatePlaybackVisual);
    };
    
    return updatePlaybackVisual;
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
      
      // The onstop handler is now managed in the useEffect hook
      
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
      // End the recording process first
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Check if recording is too short - needs to happen after stop
      if (recordingTime < 10) {
        setError('錄音時間過短，請至少錄製10秒鐘的自我介紹');
        
        // Reset the audio data to prevent playback
        setTimeout(() => {
          if (audioChunksRef.current.length > 0) {
            audioChunksRef.current = [];
          }
          
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
          }
          
          setAudioBlob(null);
        }, 0);
      }
    }
  };
  
  // MediaRecorder onstop handler
  useEffect(() => {
    // Create a custom onstop handler that checks for recording duration
    const handleRecordingStop = () => {
      if (recordingTime >= 10) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
      
      // Stop all tracks from the stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
    
    // Attach the handler to mediaRecorder when it's created
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = handleRecordingStop;
    }
    
    return () => {
      // Clean up
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
      }
    };
  }, [mediaRecorderRef.current, recordingTime, audioUrl]);
  
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
      const url = URL.createObjectURL(blob);
      
      // Get audio duration before setting state
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        const duration = Math.floor(audio.duration);
        setRecordingTime(duration);
        
        // Only set audio blob and URL if duration is sufficient
        if (duration < 10) {
          setError('上傳的音檔過短，請提供至少10秒鐘的自我介紹');
          URL.revokeObjectURL(url);
          setAudioBlob(null);
          setAudioUrl(null);
        } else {
          setAudioBlob(blob);
          setAudioUrl(url);
          setError(null);
        }
        
        setLoading(false);
      };
      
      audio.onerror = () => {
        setError('無法讀取音檔，請確認檔案格式正確');
        URL.revokeObjectURL(url);
        setLoading(false);
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
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('播放音檔時發生錯誤');
      });
      
      // Start visualization when playing
      const updatePlaybackVisual = setupPlaybackVisualization();
      if (updatePlaybackVisual) {
        updatePlaybackVisual();
      }
    }
  };
  
  // Audio play/pause event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => {
      console.log('Audio play event');
      setIsPlaying(true);
      
      // Start visualization when playing
      const updatePlaybackVisual = setupPlaybackVisualization();
      if (updatePlaybackVisual) {
        updatePlaybackVisual();
      }
    };
    
    const handlePause = () => {
      console.log('Audio pause event');
      setIsPlaying(false);
      
      // Stop visualization
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
    
    const handleEnded = () => {
      console.log('Audio ended event');
      setIsPlaying(false);
      
      // Stop visualization
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      // Reset visualization to flat state
      setAudioVisualData(Array(50).fill(5));
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      
      // Clean up audio context connections when unmounting
      if (audioContextRef.current) {
        try {
          if (analyzerRef.current) {
            analyzerRef.current.disconnect();
          }
        } catch (err) {
          console.error('Error disconnecting audio nodes:', err);
        }
      }
    };
  }, [audioRef.current]);
  
  // Save recorded/uploaded audio
  const saveAudio = async () => {
    if (!projectId || !audioBlob || !project) return;
    
    try {
      // Check for minimum recording length (10 seconds)
      if (recordingTime < 10) {
        setError('錄音時間過短，請至少錄製10秒鐘的自我介紹');
        return;
      }
      
      setLoading(true);
      setError(null);
      
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

  // Add a function to restart audio playback from the beginning
  const restartAudio = () => {
    if (audioRef.current) {
      // Stop any existing animation
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('播放音檔時發生錯誤');
      });
      
      // Start visualization
      const updatePlaybackVisual = setupPlaybackVisualization();
      if (updatePlaybackVisual) {
        updatePlaybackVisual();
      }
    }
  };

  // Handle re-recording
  const startNewRecording = () => {
    // Clean up existing audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Reset state
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    // Start recording
    startRecording();
  };

  // Download the recorded audio
  const downloadAudio = () => {
    if (!audioBlob) return;
    
    // Create a temporary anchor element for download
    const a = document.createElement('a');
    const url = URL.createObjectURL(audioBlob);
    a.href = url;
    a.download = `self_intro_${new Date().toISOString().slice(0, 10)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                      className={`w-1.5 rounded-full ${isRecording && !isPaused ? 'bg-purple-600' : isPlaying ? 'bg-blue-500' : 'bg-gray-400'}`}
                      style={{
                        height: `${(isRecording && !isPaused) || isPlaying ? height : 5}%`,
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
                className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                title="開始錄製"
              >
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            )}
            
            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="暫停"
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="停止"
                >
                  <FontAwesomeIcon icon={faStop} />
                </button>
              </>
            )}
            
            {isRecording && isPaused && (
              <>
                <button
                  onClick={resumeRecording}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="繼續"
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="停止"
                >
                  <FontAwesomeIcon icon={faStop} />
                </button>
              </>
            )}
            
            {audioUrl && !isRecording && (
              <>
                <button
                  onClick={toggleAudio}
                  className={`${isPlaying ? 'bg-gray-800' : 'bg-gray-700'} text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center`}
                  title={isPlaying ? '暫停播放' : '開始播放'}
                  aria-label={isPlaying ? '暫停播放' : '開始播放'}
                >
                  <FontAwesomeIcon 
                    icon={isPlaying ? faPause : faPlay}
                    data-testid="playback-icon"
                  />
                </button>
                <button
                  onClick={restartAudio}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="從頭播放"
                  aria-label="從頭播放"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </button>
                <button
                  onClick={deleteAudio}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="刪除"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={downloadAudio}
                  className="bg-gray-700 text-white w-12 h-12 rounded-full hover:bg-gray-800 transition flex items-center justify-center"
                  title="下載錄音"
                >
                  <FontAwesomeIcon icon={faDownload} />
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
                <label className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition cursor-pointer" title="上傳音檔">
                  <FontAwesomeIcon icon={faUpload} />
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
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              className="hidden" 
              onTimeUpdate={() => {
                // Force re-render to update UI
                setIsPlaying(prevState => prevState);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
        
        {/* Next Step button above the tips section */}
        {audioUrl && !isRecording && (
          <div className="w-full mb-6 flex justify-end">
            <button
              onClick={saveAudio}
              disabled={loading || !audioBlob || recordingTime < 10}
              className={`
                flex items-center justify-center gap-2 
                bg-gray-800 hover:bg-gray-900 text-white 
                px-6 py-3 rounded-full shadow-md transition 
                ${(loading || !audioBlob || recordingTime < 10) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={
                !audioBlob ? '請先錄製或上傳音檔' : 
                recordingTime < 10 ? '錄音時間過短，請至少錄製10秒鐘的自我介紹' :
                loading ? '處理中...' : '前往下一步進行分析'
              }
            >
              <span className="font-medium">下一步</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        )}
        
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