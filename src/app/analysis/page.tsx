'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Paper, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import Step1Consent from './components/Step1Consent';
import Step2Record from './components/Step2Record';
import Step3Preview from './components/Step3Preview';
import { analyzeData } from './utils/analyzeData';
import { useRouter } from 'next/navigation';

// 导入AnalysisResult类型
import type { AnalysisResult } from './utils/analyzeData';

const steps = [
  '数据采集说明',
  '录制视频',
  '确认数据'
];

interface ReportResult {
  reportId?: number;
  report?: Record<string, unknown>;
  success?: boolean;
  error?: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string>('等待中');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStep1Complete = () => {
    setActiveStep(1);
  };

  const handleStep2Complete = (video: File) => {
    setRecordedVideo(video);
    setActiveStep(2);
  };

  const handleStep3Restart = () => {
    setActiveStep(1);
  };

  const handleStep3Complete = async () => {
    if (!recordedVideo) {
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeStatus('正在分析视频并生成心理分析报告...');
    
    try {
      // 一次性完成视频分析和报告生成
      const result = await analyzeData({
        video: recordedVideo
      });
      setAnalysisResult(result);
      console.log('分析和报告结果:', result);
      
      if (result?.time !== undefined) {
        // 直接跳转到最终报告页面
        router.push(`/final_report/${result.time}`);
      } else {
        throw new Error('无法获取报告ID');
      }
    } catch (error) {
      console.error('处理错误:', error);
      setAnalyzeStatus(`处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTimeout(() => {
      setIsAnalyzing(false);
      }, 2000);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <Step1Consent onAgree={handleStep1Complete} />;
      case 1:
        return <Step2Record onComplete={handleStep2Complete} />;
      case 2:
        return recordedVideo ? (
          <Step3Preview
            video={recordedVideo}
            onRestart={handleStep3Restart}
            onConfirm={handleStep3Complete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          准备分析
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 2 }}>
            {getStepContent(activeStep)}
          </Box>
          
          {isAnalyzing && (
            <Box sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography>{analyzeStatus}</Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 