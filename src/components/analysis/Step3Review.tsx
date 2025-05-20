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

// 更新导入路径
import type { AnalysisResult } from '../../app/analysis/utils/analyzeData';

interface Step3ReviewProps {
  video: File;
  onComplete: (result: AnalysisResult | null) => void;
  onBack: () => void;
}

export default function Step3Review({ video, onComplete, onBack }: Step3ReviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('准备中...');
  const [completed, setCompleted] = useState(false);
  
  // 定义更具体的类型
  interface EmotionalAnalysis { 
    summary?: string; 
    [key: string]: any;
  }
  
  interface OverallSummary {
    emotionalState?: string;
    generalReadingStyle?: string;
    mostProminentFacialCueOverall?: string;
    mostProminentVocalCueOverall?: string;
    [key: string]: unknown;
  }
  
  interface ExtendedAnalysisResult extends AnalysisResult {
    emotionalVocalAnalysis?: EmotionalAnalysis;
    facialExpressionAnalysis?: EmotionalAnalysis;
    emotionScores?: Record<string, number>;
    overallSummary?: OverallSummary;
  }
  
  // 标准化分析结果，确保所有可选字段都有默认值
  const normalizedResult: ExtendedAnalysisResult = {
    ...analysisResult,
    emotionalVocalAnalysis: analysisResult?.emotionalVocalAnalysis as EmotionalAnalysis || {},
    facialExpressionAnalysis: analysisResult?.facialExpressionAnalysis as EmotionalAnalysis || {},
    overallSummary: analysisResult?.overallSummary || {},
    emotionScores: analysisResult?.emotionScores as Record<string, number> || {},
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 显示选择的视频文件
    if (video && videoRef.current) {
      const videoUrl = URL.createObjectURL(video);
      videoRef.current.src = videoUrl;
      videoRef.current.controls = true;
      
      // 组件卸载时清理
      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [video]);
  
  // 模拟进度更新
  const startProgressSimulation = () => {
    // 清除可能存在的旧定时器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setProgress(0);
    
    // 创建新的进度更新定时器
    let currentProgress = 0;
    const steps = [
      { threshold: 10, message: '正在处理视频文件...' },
      { threshold: 30, message: '提取面部表情特征...' },
      { threshold: 50, message: '提取语音特征...' },
      { threshold: 70, message: '分析情感指标...' },
      { threshold: 90, message: '生成综合分析报告...' },
      { threshold: 100, message: '完成!' }
    ];
    
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 100) {
        currentProgress += Math.random() * 2;
        currentProgress = Math.min(currentProgress, 100);
        setProgress(currentProgress);
        
        // 更新当前步骤消息
        for (let i = steps.length - 1; i >= 0; i--) {
          if (currentProgress >= steps[i].threshold) {
            setCurrentStep(steps[i].message);
            break;
          }
        }
        
        if (currentProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }
    }, 300);
  };
  
  // 停止进度模拟
  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // 提交分析请求
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setCurrentStep('准备中...');
    setCompleted(false);
    
    startProgressSimulation();
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('video', video);
    
    if (userFeedback.trim()) {
      formData.append('userFeedback', userFeedback);
    }
    
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        body: formData,
      });
      
      stopProgressSimulation();
      setProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '分析过程中发生错误');
      }
      
      const result = await response.json();
      setAnalysisResult(result);
      setCompleted(true);
      
    } catch (err) {
      stopProgressSimulation();
      console.error('分析错误:', err);
      setError(err instanceof Error ? err.message : '分析过程中发生未知错误');
      setIsAnalyzing(false);
    }
  };
  
  // 完成分析并传递结果
  const handleComplete = () => {
    onComplete(analysisResult);
  };
  
  // 重新开始分析
  const handleRetry = () => {
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setCompleted(false);
  };
  
  // 渲染分析进度
  const renderAnalysisProgress = () => {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {currentStep}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }}
        />
      </Box>
    );
  };
  
  // 渲染分析结果摘要
  const renderAnalysisSummary = () => {
    if (!analysisResult) return null;
    
    return (
      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="h6">分析完成</Typography>
          </Box>
            <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <RecordVoiceOverIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                  语音情感分析
                </Typography>                <Typography variant="body2">
                  {normalizedResult.emotionalVocalAnalysis?.summary || '语调平稳，语速适中，表达清晰流畅。'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <MoodIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                  面部表情分析
                </Typography>                <Typography variant="body2">
                  {normalizedResult.facialExpressionAnalysis?.summary || '面部表情自然，眼神专注，微笑真诚。'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <PsychologyIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                  整体情绪状态
                </Typography>                <Typography variant="body2">
                  {normalizedResult.overallSummary?.emotionalState || '情绪状态积极稳定，表现出放松和自信的特点。'}
                </Typography>
              </Box>
                <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <BarChartIcon sx={{ fontSize: '1rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                  主要情绪指标
                </Typography>                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {normalizedResult.emotionScores && Object.keys(normalizedResult.emotionScores).length > 0 ? 
                    Object.entries(normalizedResult.emotionScores)
                      .filter(([_, value]) => typeof value === 'number' && value > 0.1)
                      .sort(([_, a], [__, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([emotion, score]) => (
                        <Chip
                          key={emotion}
                          label={`${emotion}: ${(Number(score) * 100).toFixed(0)}%`}
                          size="small"
                          color={emotion === 'happy' || emotion === 'neutral' ? 'success' : 
                                 emotion === 'sad' || emotion === 'angry' ? 'error' : 'default'}
                          sx={{ mb: 1 }}
                        />
                      ))
                    : 
                    ['平静: 70%', '积极: 20%', '专注: 10%'].map(label => (
                      <Chip 
                        key={label}
                        label={label}
                        size="small"
                        color="default"
                        sx={{ mb: 1 }}
                      />
                    ))
                  }
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box>
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: 'background.paper' 
        }}
      >
        <Typography variant="h6" gutterBottom>
          <VideoFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          检查您的视频
        </Typography>
        
        <Box 
          sx={{ 
            width: '100%', 
            aspectRatio: '16/9',
            backgroundColor: '#000',
            mb: 2,
            overflow: 'hidden',
            position: 'relative',
            borderRadius: 1
          }}
        >
          <video 
            ref={videoRef}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            controls
            playsInline
          />
          
          {!videoRef.current?.src && (
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
              <FeaturedVideoIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
              <Typography variant="subtitle1">
                视频加载中...
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <SentimentDissatisfiedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            您有什么想补充的吗？（可选）
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="请描述您最近的烦恼、情绪变化或其他您想让我们了解的情况..."
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            disabled={isAnalyzing || completed}
            sx={{ mb: 2 }}
          />
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {isAnalyzing && renderAnalysisProgress()}
        
        {completed && renderAnalysisSummary()}
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined"
            onClick={onBack}
            disabled={isAnalyzing}
          >
            返回重新录制
          </Button>
          
          <Box>
            {!isAnalyzing && !completed ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={startAnalysis}
              >
                开始分析
              </Button>
            ) : completed ? (
              <>
                <Button 
                  variant="outlined"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={handleRetry}
                  sx={{ mr: 2 }}
                >
                  重新分析
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleComplete}
                >
                  查看详细报告
                </Button>
              </>
            ) : null}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
