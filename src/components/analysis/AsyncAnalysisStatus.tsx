'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, LinearProgress, Button, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getAnalysisTaskStatus } from '@/app/analysis/utils/analyzeData';
import { AnalysisResult } from '@/app/analysis/utils/analyzeData';
import { useRouter } from 'next/navigation';

interface AsyncAnalysisStatusProps {
  taskId: string;
  onComplete?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
}

// 定义不同分析阶段的描述
const ANALYSIS_STAGES = [
  { progress: 10, label: '准备分析' },
  { progress: 20, label: '视频预处理' },
  { progress: 40, label: '执行视频分析' },
  { progress: 60, label: '生成心理报告' },
  { progress: 80, label: '保存分析结果' },
  { progress: 100, label: '分析完成' }
];

export const AsyncAnalysisStatus: React.FC<AsyncAnalysisStatusProps> = ({ 
  taskId, 
  onComplete,
  onError
}) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentStage, setCurrentStage] = useState('准备分析...');
  const router = useRouter();

  // 确定当前阶段
  useEffect(() => {
    const stage = ANALYSIS_STAGES.find(stage => progress <= stage.progress) || ANALYSIS_STAGES[0];
    setCurrentStage(stage.label);
  }, [progress]);

  // 轮询任务状态
  useEffect(() => {
    // 开始轮询
    const startPolling = () => {
      const interval = setInterval(async () => {
        try {
          const taskStatus = await getAnalysisTaskStatus(taskId);
          
          setStatus(taskStatus.status);
          setProgress(taskStatus.progress);
          
          // 如果任务完成或失败，停止轮询
          if (taskStatus.status === 'completed') {
            if (taskStatus.result) {
              setResult(taskStatus.result);
              onComplete?.(taskStatus.result);
            }
            clearInterval(interval);
            setPollingInterval(null);
          } else if (taskStatus.status === 'failed') {
            setError(taskStatus.error || '分析失败，请重试');
            onError?.(taskStatus.error || '分析失败，请重试');
            clearInterval(interval);
            setPollingInterval(null);
          }
        } catch (err) {
          console.error('轮询任务状态失败:', err);
          // 轮询失败，但不停止轮询，继续尝试
        }
      }, 2000); // 每2秒轮询一次
      
      return interval;
    };

    // 如果没有正在轮询且任务未完成，开始轮询
    if (!pollingInterval && (status === 'pending' || status === 'processing')) {
      const interval = startPolling();
      setPollingInterval(interval);
    }

    // 清理函数
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [taskId, status, pollingInterval, onComplete, onError]);

  // 跳转到报告页面
  const viewReport = () => {
    if (result?.id) {
      router.push(`/final_report/${result.id}`);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          分析状态{status === 'completed' ? '：已完成' : status === 'failed' ? '：失败' : ''}
        </Typography>
        
        {(status === 'pending' || status === 'processing') && (
          <>
            <CircularProgress size={60} sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentStage}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }} 
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              请耐心等待，分析处理可能需要1-3分钟
            </Typography>
          </>
        )}
        
        {status === 'completed' && result && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, my: 2 }} />
            <Typography variant="body1" gutterBottom>
              分析已完成！您可以查看详细报告。
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={viewReport}
              sx={{ mt: 2 }}
            >
              查看分析报告
            </Button>
          </Box>
        )}
        
        {status === 'failed' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, my: 2 }} />
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error || '分析过程中出现错误，请重试'}
            </Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
            >
              重新开始
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AsyncAnalysisStatus;
