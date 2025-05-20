'use client';

import { useRef, useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Stack, 
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import FeaturedVideoIcon from '@mui/icons-material/FeaturedVideo';
import BarChartIcon from '@mui/icons-material/BarChart';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MoodIcon from '@mui/icons-material/Mood';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface Step3ReviewProps {
  video: File;
  onRestart: () => void;
  onConfirm: (userFeedback: string) => void;
}

export default function Step3Review({ video, onRestart, onConfirm }: Step3ReviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState({
    resolution: '',
    frameRate: 0,
    duration: 0,
  });
  const [isTextValid, setIsTextValid] = useState(false);
  
  // 视频元数据检测
  useEffect(() => {
    if (video && videoRef.current) {
      const videoURL = URL.createObjectURL(video);
      videoRef.current.src = videoURL;
      
      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration);
          setVideoMetadata({
            resolution: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
            frameRate: 0, // 浏览器API无法直接获取帧率
            duration: videoRef.current.duration,
          });
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // 监听播放状态
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      };
      
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoRef.current.removeEventListener('play', handlePlay);
          videoRef.current.removeEventListener('pause', handlePause);
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
        URL.revokeObjectURL(videoURL);
      };
    }
  }, [video]);
  
  // 验证文本输入
  useEffect(() => {
    setIsTextValid(userFeedback.trim().length >= 20);
  }, [userFeedback]);
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 处理提交
  const handleSubmit = () => {
    if (isTextValid) {
      onConfirm(userFeedback);
    }
  };  return (    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* 左侧视频区域 */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
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
              <FeaturedVideoIcon color="primary" /> 视频预览
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
                controls
                style={{ 
                  width: '100%', 
                  maxHeight: '350px', 
                  objectFit: videoMetadata.resolution && 
                             parseInt(videoMetadata.resolution.split('x')[0]) < 
                             parseInt(videoMetadata.resolution.split('x')[1]) 
                             ? 'contain' : 'cover',
                  borderRadius: '8px' 
                }}
              />
              
              {/* 视频播放指示器 */}
              {isPlaying && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 36, 
                    right: 10, 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    color: 'white',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Box>
              )}
            </Box>
            
            {/* 视频元数据可视化 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center">
                      文件大小
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'medium' }}>
                      {(video.size / (1024 * 1024)).toFixed(2)} <small>MB</small>
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center">
                      分辨率
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'medium' }}>
                      {videoMetadata.resolution}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ height: '100%', bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center">
                      时长
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'medium' }}>
                      {formatTime(videoMetadata.duration)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>        </Box>
          {/* 右侧用户输入区域 */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper 
            sx={{ 
              p: 3, 
              pb: 2,
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" /> 分享您的心情
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              您的分享对我们很重要，这将帮助更加全面地了解您的情绪状态
            </Alert>              <Box sx={{ mb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1" paragraph>
                请简要描述一下您最近的心情，有什么烦心事或值得分享的经历？
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  icon={<MoodIcon />} 
                  label="我最近感到很愉快，因为..." 
                  color="success" 
                  variant="outlined"
                  onClick={() => setUserFeedback(prev => 
                    prev + (prev ? '\n\n' : '') + '我最近感到很愉快，因为...'
                  )}
                />
                <Chip 
                  icon={<SentimentDissatisfiedIcon />} 
                  label="最近让我烦恼的是..." 
                  color="warning" 
                  variant="outlined"
                  onClick={() => setUserFeedback(prev => 
                    prev + (prev ? '\n\n' : '') + '最近让我烦恼的是...'
                  )}
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="请在这里输入您的想法和感受..."
                variant="outlined"
                sx={{ mb: 1 }}
              />              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" color={isTextValid ? 'success.main' : 'text.secondary'}>
                  {userFeedback.length ? `已输入 ${userFeedback.length} 个字符` : '请至少输入20个字符'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (userFeedback.length / 20) * 100)} 
                  sx={{ width: '100px', height: 6, borderRadius: 3 }}
                  color={isTextValid ? 'success' : 'primary'}
                />
              </Box>
                {/* 按钮区域 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 'auto' }}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={onRestart}
                  size="medium"
                >
                  返回上一步
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleSubmit}
                  disabled={!isTextValid}
                  size="medium"
                >
                  确认并分析
                </Button>
              </Box>
            </Box>
          </Paper>        </Box>
      </Box>
    </Box>
  );
}
