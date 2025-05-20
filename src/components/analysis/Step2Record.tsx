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
// 更新导入路径
import useVideoProcessor from '../../app/analysis/utils/useVideoProcessor';

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
    // 清理函数
    return () => {
      stopMediaTracks();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 请求摄像头权限
  const requestCameraPermission = async () => {
    setRecordingError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return stream;
    } catch (err) {
      console.error('摄像头访问错误:', err);
      setRecordingError('无法访问摄像头或麦克风，请确保已授予权限。');
      return null;
    }
  };

  // 停止所有媒体轨道
  const stopMediaTracks = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 开始录制
  const startRecording = async () => {
    const stream = await requestCameraPermission();
    if (!stream) return;
    
    setIsRecording(true);
    setRecordingTime(0);
    chunksRef.current = [];
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
      try {
        // 如果vp9不支持，尝试使用更普遍支持的编码
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e2) {
        try {
          // 最后尝试不指定编码
          mediaRecorderRef.current = new MediaRecorder(stream);
        } catch (e3) {
          setRecordingError('您的浏览器不支持录制功能，请尝试使用Chrome或Firefox最新版本。');
          setIsRecording(false);
          stopMediaTracks();
          return;
        }
      }
    }
    
    // 录制数据可用时的处理
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    // 录制结束时的处理
    mediaRecorderRef.current.onstop = async () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      
      // 检查文件大小
      if (videoBlob.size > MAX_FILE_SIZE) {
        setRecordingError(`视频大小超过了最大限制 (${(MAX_FILE_SIZE/1024/1024).toFixed(1)}MB)，请重新录制或尝试录制更短的视频。`);
        return;
      }
      
      try {
        setCompressionStatus('正在处理视频，请稍候...');
        
        // 使用自定义钩子转换视频格式
        videoProcessor.state.progress = 0;
        setConversionProgress(0);
        
        const intervalId = setInterval(() => {
          setConversionProgress(videoProcessor.state.progress);
        }, 100);
        
        const mp4File = await videoProcessor.convertWebmToMp4(videoBlob);
        
        clearInterval(intervalId);
        setConversionProgress(100);
        
        if (mp4File) {
          setRecordedVideo(mp4File);
          setCompressionStatus(null);
          
          const videoUrl = URL.createObjectURL(mp4File);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = videoUrl;
            videoRef.current.controls = true;
          }
        } else {
          throw new Error('视频处理失败');
        }
      } catch (error) {
        console.error('视频处理错误:', error);
        setRecordingError('视频处理失败，请重试。');
        setCompressionStatus(null);
      }
    };
    
    // 开始录制
    mediaRecorderRef.current.start(1000); // 每1秒保存一次数据块
    
    // 设置计时器
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= MAX_RECORDING_TIME) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return newTime;
      });
    }, 1000);
  };

  // 停止录制
  const stopRecording = () => {
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // 重新录制
  const handleReRecord = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(videoRef.current?.src || '');
    }
    setRecordedVideo(null);
    setRecordingError(null);
    setCompressionStatus(null);
    setConversionProgress(0);
  };

  // 上传视频文件
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      setRecordingError('请上传有效的视频文件（MP4，WebM等格式）');
      return;
    }
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      setRecordingError(`文件大小超过了最大限制 (${(MAX_FILE_SIZE/1024/1024).toFixed(1)}MB)，请选择较小的文件或压缩后上传。`);
      return;
    }
    
    setRecordingError(null);
    setRecordedVideo(file);
    
    // 在视频播放器中预览上传的视频
    const videoUrl = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = videoUrl;
      videoRef.current.controls = true;
    }
  };

  // 完成此步骤
  const handleComplete = () => {
    if (recordedVideo) {
      onComplete(recordedVideo);
    }
  };

  // 返回上一步
  const handleBack = () => {
    if (onBack) onBack();
  };

  // 打开文件选择器
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 录制进度指示器
  const renderProgressIndicator = () => {
    const progress = (recordingTime / MAX_RECORDING_TIME) * 100;
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          color={recordingTime > MAX_RECORDING_TIME * 0.8 ? "error" : "primary"}
        />
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
          {recordingTime} / {MAX_RECORDING_TIME} 秒
        </Typography>
      </Box>
    );
  };

  // 渲染视频处理进度
  const renderConversionProgress = () => {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={conversionProgress} 
        />
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
          处理进度: {Math.round(conversionProgress)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box>      <Alert severity="info" sx={{ mb: 3 }}>
        请录制一段视频，朗读以下文字：<br />
        <Typography component="span" sx={{ fontWeight: 'medium', display: 'block', mt: 1, px: 2 }}>
          &ldquo;今天的天气真不错，阳光明媚，微风轻拂。我感觉心情愉快，希望能与朋友分享这美好的时刻。&rdquo;
        </Typography>
      </Alert>
      
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            aspectRatio: '16/9',
            backgroundColor: '#000',
            mb: 2,
            overflow: 'hidden',
            position: 'relative' 
          }}
        >
          <video 
            ref={videoRef}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            muted={isRecording} // 录制时静音以防反馈
            playsInline // 在iOS设备上内联播放
          />
          
          {!isRecording && !recordedVideo && !compressionStatus && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                flexDirection: 'column'
              }}
            >
              <FeaturedVideoIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />              <Typography variant="subtitle1">
                准备好后点击下方&ldquo;开始录制&rdquo;按钮
              </Typography>
            </Box>
          )}
          
          {compressionStatus && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                flexDirection: 'column'
              }}
            >
              <CircularProgress color="secondary" sx={{ mb: 2 }} />
              <Typography variant="subtitle1">
                {compressionStatus}
              </Typography>
              {renderConversionProgress()}
            </Box>
          )}
        </Box>
        
        {isRecording && renderProgressIndicator()}
        
        {recordingError && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {recordingError}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!recordedVideo ? (
            <>
              {!isRecording ? (
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<VideocamIcon />}
                  onClick={startRecording}
                  disabled={!!compressionStatus}
                >
                  开始录制
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={stopRecording}
                >
                  停止录制 ({MAX_RECORDING_TIME - recordingTime}秒)
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={triggerFileInput}
                disabled={isRecording || !!compressionStatus}
              >
                上传视频
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="video/*"
                onChange={handleFileUpload}
              />
            </>
          ) : (
            <>
              <Button 
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={handleReRecord}
              >
                重新录制
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={handleComplete}
              >
                使用此视频继续
              </Button>
            </>
          )}
          
          {onBack && (
            <Button 
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={isRecording}
            >
              返回
            </Button>
          )}
        </Box>
      </Paper>
      
      <Typography variant="subtitle2" color="text.secondary" paragraph>
        提示：
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        • 请确保光线充足，面部清晰可见
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        • 语速适中，情绪自然，不必刻意表现
      </Typography>
      <Typography variant="body2" color="text.secondary">
        • 录制时长建议为 15-30 秒
      </Typography>
    </Box>
  );
}
