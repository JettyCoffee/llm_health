'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress, LinearProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FeaturedVideoIcon from '@mui/icons-material/FeaturedVideo';
import useVideoProcessor from '../utils/useVideoProcessor';

interface Step2RecordProps {
  onComplete: (video: File) => void;
  onBack?: () => void;
}

// 最大录制时长（秒）
const MAX_RECORDING_TIME = 30;
// 最大文件大小（字节）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Step2Record({ onComplete, onBack }: Step2RecordProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 使用 VideoProcessor 钩子来处理 WebM 到 MP4 的转换
  const videoProcessor = useVideoProcessor();

  useEffect(() => {
    // 在组件卸载时停止并清理所有媒体流
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 如果正在录制，设置计时器
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startVideoStream = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 22050
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('无法访问摄像头或麦克风:', err);
      setRecordingError('无法访问摄像头或麦克风，请确保已授予权限。');
      return null;
    }
  };

  const compressVideo = async (videoBlob: Blob): Promise<File> => {
    // 使用 ffmpeg.wasm 进行 WebM 到 MP4 的转换
    setCompressionStatus('处理视频中...');
    
    try {
      // 进度更新
      const progressInterval = setInterval(() => {
        if (videoProcessor.state.progress > 0) {
          setConversionProgress(videoProcessor.state.progress);
          setCompressionStatus(videoProcessor.state.statusMessage || '处理视频中...');
        }
      }, 100);
      
      // 执行转换
      const convertedFile = await videoProcessor.convertWebmToMp4(videoBlob);
      
      // 清理进度更新
      clearInterval(progressInterval);
      
      if (!convertedFile) {
        console.warn('视频转换失败，使用原始格式', videoProcessor.state.error);
        setRecordingError('视频转换到MP4格式失败: ' + (videoProcessor.state.error || '未知错误') + 
                       '。将使用原始WebM格式继续。');
        // 回退到原始WebM文件
        return new File([videoBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      }
      
      setCompressionStatus(null);
      setConversionProgress(0);
      
      return convertedFile;
    } catch (error) {
      console.error('视频转换错误:', error);
      setRecordingError('视频处理失败: ' + (error as Error).message);
      setCompressionStatus(null);
      setConversionProgress(0);
      
      // 如果转换失败，回退到原始 WebM 文件
      return new File([videoBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
    }
  };

  const startRecording = async () => {
    setRecordingTime(0);
    const stream = await startVideoStream();
    if (!stream) return;

    chunksRef.current = [];
    // 尝试使用 MP4 容器格式，但大多数浏览器可能只支持 WebM
    // 如果浏览器不支持 MP4 录制，会回退到 WebM
    const mimeTypes = [
      'video/mp4;codecs=avc1',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];
    
    let options = {};
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        options = { mimeType: type };
        console.log('使用的视频格式:', type);
        break;
      }
    }
    
    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
  
      mediaRecorder.onstop = async () => {
        // 释放摄像头
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        videoRef.current!.srcObject = null;
        
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        
        // 检查文件大小
        if (blob.size > MAX_FILE_SIZE) {
          setRecordingError(`视频文件太大 (${(blob.size / (1024 * 1024)).toFixed(2)}MB)，请录制更短的视频或降低画质。`);
          return;
        }
        
        try {
          // 处理视频
          const file = await compressVideo(blob);
          setRecordedVideo(file);
        } catch (error) {
          console.error('视频处理失败:', error);
          setRecordingError('视频处理失败，请重试。');
        }
      };
  
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
    } catch (error) {
      console.error('录制启动失败:', error);
      setRecordingError('录制启动失败，请检查您的浏览器是否支持视频录制。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNextStep = () => {
    if (recordedVideo) {
      onComplete(recordedVideo);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 检查文件是否为MP4
    if (!file.type.includes('mp4')) {
      setRecordingError('请上传MP4格式的视频文件');
      return;
    }
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      setRecordingError(`文件过大，请上传小于${MAX_FILE_SIZE / (1024 * 1024)}MB的视频文件`);
      return;
    }
    
    setRecordedVideo(file);
    
    // 在视频元素中预览上传的视频
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(file);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: 3,
        position: 'relative'
      }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ 
            position: 'absolute', 
            left: 0,
            borderRadius: 2,
            px: 2
          }}
          onClick={onBack ? onBack : () => window.history.back()}
          startIcon={<ArrowBackIcon />}
        >
          返回上一步
        </Button>
        {!recordedVideo ? (
          <Typography 
            paragraph 
            sx={{ 
              bgcolor: 'primary.light',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 4,
              textAlign: 'center',
              maxWidth: '90%',
              m: 0,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            请阅读左侧的文字，并对着摄像头录制视频或上传视频文件，视频最长 {MAX_RECORDING_TIME} 秒。
          </Typography>
        ) : (
          <Alert 
            severity="success" 
            sx={{ 
              textAlign: 'center',
              maxWidth: '90%',
              m: 0,
              borderRadius: 4,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            视频{recordedVideo.name.includes('recording') ? '录制' : '上传'}完成，请检查预览并确认继续
          </Alert>
        )}
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gridTemplateRows: { md: 'minmax(400px, auto)' }, gap: 2, mb: 2 }}>
        {/* 左侧：朗读文字区域 */}
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%',
        }}>
          <Box sx={{ 
            p: 2, 
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Typography 
              paragraph 
              sx={{ 
                p: 2, 
                bgcolor: '#fff', 
                borderRadius: 1,
                fontWeight: 'medium',
                lineHeight: 1.8,
                overflowY: 'auto',
                m: 0,
                flex: 1
              }}
            >
              今天的天气很好，阳光明媚，让人心情愉快。我感到平静而满足，就像在宁静的湖边散步一样。
              
              想象一下，当我得知自己考试通过的那一刻，我简直太激动了！我立刻拿起手机，激动地告诉了所有朋友！这是我付出那么多努力后终于得到的回报，我感到无比自豪和兴奋！这种成就感真是难以言表！我恨不得马上冲出去大声喊出来，让全世界都知道我成功了！这一切的努力都是值得的！
              
              回到现实，我深呼吸，慢慢平静下来。生活中有起有落，这很正常。我学会了接受失败，也懂得了欣赏成功的喜悦。无论遇到什么困难，我都会坦然面对，理性分析，寻找解决方案。平静和耐心是我面对挑战的态度。这些经历让我成长，让我更加坚强。
              
              总的来说，我希望通过这次测试了解自己的情绪状态，获得有价值的反馈，并从中获得成长。
            </Typography>
          </Box>
        </Box>

        {/* 右侧：视频录制区域 */}
        <Box sx={{ 
          flex: 1, 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FeaturedVideoIcon color="primary" /> 视频录制
            </Typography>
            <Box sx={{ 
              width: '100%', 
              position: 'relative', 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'center',
              flex: 1 
            }}>
              <video 
                ref={videoRef} 
                autoPlay={!recordedVideo}
                playsInline
                muted={!recordedVideo}
                controls={!!recordedVideo}
                style={{ 
                  width: '100%', 
                  maxHeight: '350px', 
                  objectFit: videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight && 
                           videoRef.current.videoWidth < videoRef.current.videoHeight 
                           ? 'contain' : 'cover',
                  borderRadius: '8px' 
                }} 
              />
              {isRecording && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    bgcolor: 'rgba(0, 0, 0, 0.6)', 
                    color: 'white', 
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      bgcolor: 'error.main', 
                      borderRadius: '50%',
                      animation: 'pulse 1s infinite'
                    }} 
                  />
                  {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {!isRecording && !recordedVideo ? (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={startRecording}
                    disabled={!!compressionStatus}
                    startIcon={<VideocamIcon />}
                  >
                    开始录制
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!compressionStatus}
                    startIcon={<FileUploadIcon />}
                  >
                    上传视频
                  </Button>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="video/mp4"
                    onChange={handleFileUpload}
                  />
                </>
              ) : isRecording ? (
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={stopRecording}
                  startIcon={<StopIcon />}
                >
                  停止录制
                </Button>
              ) : recordedVideo && (
                <>
                  <Button 
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setRecordedVideo(null);
                      if (videoRef.current) {
                        videoRef.current.src = "";
                      }
                    }}
                    startIcon={<ReplayIcon />}
                  >
                    重新录制
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleNextStep}
                    endIcon={<ArrowForwardIcon />}
                  >
                    下一步
                  </Button>
                </>
              )}
            </Box>

            {recordingError && (
              <Alert severity="error" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                {recordingError}
              </Alert>
            )}
            
            {compressionStatus && (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <CircularProgress size={24} />
                  <Typography>{compressionStatus}</Typography>
                </Box>
                {conversionProgress > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={conversionProgress * 100} 
                    sx={{ width: '100%', height: 8, borderRadius: 1 }} 
                  />
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 