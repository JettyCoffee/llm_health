'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress, LinearProgress } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopIcon from '@mui/icons-material/Stop';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import useVideoProcessor from '../utils/useVideoProcessor';

interface Step2RecordProps {
  onComplete: (video: File) => void;
}

// 最大录制时长（秒）
const MAX_RECORDING_TIME = 30;
// 最大文件大小（字节）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Step2Record({ onComplete }: Step2RecordProps) {
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
      <Typography paragraph>
        请对着摄像头录制视频（最长 {MAX_RECORDING_TIME} 秒），或上传MP4格式的视频文件。
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
        {/* 左侧：朗读文字区域 */}
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', flex: { xs: '1', md: '0.45' }, height: 'fit-content' }}>
          <Typography 
            paragraph 
            sx={{ 
              p: 2, 
              bgcolor: '#fff', 
              fontWeight: 'medium',
              lineHeight: 1.8,
              maxHeight: '450px',
              overflowY: 'auto'
            }}
          >
            今天的天气很好，阳光明媚，让人心情愉快。我感到平静而满足，就像在宁静的湖边散步一样。
            
            想象一下，当我得知自己考试通过的那一刻，我简直太激动了！我立刻拿起手机，激动地告诉了所有朋友！这是我付出那么多努力后终于得到的回报，我感到无比自豪和兴奋！这种成就感真是难以言表！我恨不得马上冲出去大声喊出来，让全世界都知道我成功了！这一切的努力都是值得的！
            
            回到现实，我深呼吸，慢慢平静下来。生活中有起有落，这很正常。我学会了接受失败，也懂得了欣赏成功的喜悦。无论遇到什么困难，我都会坦然面对，理性分析，寻找解决方案。平静和耐心是我面对挑战的态度。这些经历让我成长，让我更加坚强。
            
            总的来说，我希望通过这次测试了解自己的情绪状态，获得有价值的反馈，并从中获得成长。
          </Typography>
        </Paper>

        {/* 右侧：视频录制区域 */}
        <Paper sx={{ p: 2, mb: 2, flex: { xs: '1', md: '0.55' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 640, height: 'auto', bgcolor: '#f0f0f0', borderRadius: 1, position: 'relative' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
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

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {!isRecording ? (
              <>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={startRecording}
                  disabled={!!recordedVideo || !!compressionStatus}
                  startIcon={<VideocamIcon />}
                >
                  开始录制
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!recordedVideo || !!compressionStatus || isRecording}
                  startIcon={<FileUploadIcon />}
                >
                  上传MP4视频
                </Button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="video/mp4"
                  onChange={handleFileUpload}
                />
              </>
            ) : (
              <Button 
                variant="contained" 
                color="error"
                onClick={stopRecording}
                startIcon={<StopIcon />}
              >
                停止录制
              </Button>
            )}
          </Box>

          {recordingError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {recordingError}
            </Alert>
          )}
          
          {compressionStatus && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', mt: 2 }}>
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
          
          {recordedVideo && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <Alert severity="success">
                视频{recordedVideo.name.includes('recording') ? '录制' : '上传'}完成，
                格式: {recordedVideo.type}, 
                大小: {(recordedVideo.size / (1024 * 1024)).toFixed(2)}MB
              </Alert>
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleNextStep}
                >
                  下一步
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        </Paper>
      </Box>
    </Box>
  );
} 