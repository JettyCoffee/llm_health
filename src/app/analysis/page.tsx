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

const steps = [
  '数据采集说明',
  '录制视频',
  '确认数据'
];

export default function AnalysisPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string>('等待中');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

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
    if (!recordedVideo) return;

    setIsAnalyzing(true);
    setAnalyzeStatus('正在分析视频...');
    try {
      // 第一步：视频分析
      const result = await analyzeData({
        video: recordedVideo
      });
      setAnalysisResult(result);
      console.log('分析结果:', result);
      
      // 获取分析ID - 增强ID获取逻辑
      let analysisId;
      
      if (result?.id) {
        // 如果有明确的ID字段
        analysisId = result.id;
      } else if (result?.time !== undefined) {
        // 如果有time字段
        analysisId = result.time;
      } else {
        // 尝试获取最新分析结果的ID
        setAnalyzeStatus('正在获取分析结果ID...');
        const latestResponse = await fetch('/api/analysis/latest');
        if (!latestResponse.ok) {
          throw new Error('获取最新分析结果失败');
        }
        const latestData = await latestResponse.json();
        if (latestData && latestData.time !== undefined) {
          analysisId = latestData.time;
          console.log('使用最新分析结果ID:', analysisId);
        } else {
          throw new Error('无法获取分析ID');
        }
      }
      
      // 第二步：生成心理分析报告
      setAnalyzeStatus('正在生成心理分析报告...');
      const reportResponse = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId }),
      });
      
      if (!reportResponse.ok) {
        const errorData = await reportResponse.json();
        throw new Error(errorData.error || '生成报告失败');
      }
      
      const reportResult = await reportResponse.json();
      console.log('报告生成结果:', reportResult);
      
      // 跳转到最终报告页面
      if (reportResult.reportId !== undefined) {
        router.push(`/final_report/${reportResult.reportId}`);
      } else if (reportResult.report && analysisId !== undefined) {
        // 如果没有明确的reportId但有analysisId，使用analysisId+1000作为reportId
        router.push(`/final_report/${analysisId + 1000}`);
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