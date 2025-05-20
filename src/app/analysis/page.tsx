'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Paper, Stepper, Step, StepLabel, CircularProgress, StepConnector, StepIconProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Step1Consent from './components/Step1Consent';
import Step2Record from './components/Step2Record';
import Step3Review from './components/Step3Review';
import { analyzeData } from './utils/analyzeData';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { 
  PageTransition, 
  FadeIn, 
  SlideUp, 
  AnimatedBackground,
  PopIn
} from '@/components/Animations';
import ToolbarSpacer from '@/components/ToolbarSpacer';

// 导入AnalysisResult类型
import type { AnalysisResult } from './utils/analyzeData';

// 自定义步进器样式
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-alternativeLabel`]: {
    top: 10,
  },
  [`&.MuiStepConnector-active`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: 'linear-gradient(95deg, var(--primary) 0%, var(--secondary) 100%)',
    },
  },
  [`&.MuiStepConnector-completed`]: {
    [`& .MuiStepConnector-line`]: {
      backgroundImage: 'linear-gradient(95deg, var(--primary) 0%, var(--secondary) 100%)',
    },
  },
  [`& .MuiStepConnector-line`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: 'var(--primary)',
    }),
    '& .QontoStepIcon-completedIcon': {
      color: 'var(--primary)',
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className, icon } = props;

  let StepIcon: React.ElementType;
  switch (icon) {
    case 1:
      StepIcon = AssignmentIcon;
      break;
    case 2:
      StepIcon = VideocamIcon;
      break;
    case 3:
      StepIcon = CheckCircleIcon;
      break;
    default:
      StepIcon = CheckIcon;
  }

  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <motion.div
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          <CheckIcon className="QontoStepIcon-completedIcon" />
        </motion.div>
      ) : (
        <motion.div
          animate={active ? { scale: [0.8, 1.2, 1], rotate: [0, 10, 0, -10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <StepIcon color={active ? "primary" : "disabled"} />
        </motion.div>
      )}
    </QontoStepIconRoot>
  );
}

const steps = [
  '采集说明',
  '视频录制',
  '状态自述'
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
  const [userFeedback, setUserFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string>('等待中');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalyzingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setAnalyzingProgress(0);
    }
  }, [isAnalyzing]);

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

  const handleStep3Complete = async (feedback: string) => {
    if (!recordedVideo) {
      return;
    }
    
    // 保存用户输入的反馈
    setUserFeedback(feedback);

    setIsAnalyzing(true);
    setAnalyzeStatus('正在分析视频并生成心理分析报告...');
    
    try {
      // 一次性完成视频分析和报告生成
      const result = await analyzeData({
        video: recordedVideo,
        userFeedback: feedback
      });
      setAnalysisResult(result);
      console.log('分析和报告结果:', result);
      
      setAnalyzeStatus('分析完成，准备跳转到报告页面...');
      setAnalyzingProgress(100);
      
      // 添加一点延迟以显示完成状态
      setTimeout(() => {
        if (result?.time !== undefined) {
          // 保存报告URL到cookie
          const reportUrl = `/final_report/${result.time}`;
          Cookies.set('lastReportUrl', reportUrl, { expires: 30 }); // 保存30天
          
          // 直接跳转到最终报告页面
          router.push(reportUrl);
        } else {
          throw new Error('无法获取报告ID');
        }
      }, 1000);
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
        return <FadeIn><Step1Consent onAgree={handleStep1Complete} /></FadeIn>;
      case 1:
        return <SlideUp><Step2Record onComplete={handleStep2Complete} onBack={() => setActiveStep(0)} /></SlideUp>;
      case 2:
        return recordedVideo ? (
          <PopIn>
            <Step3Review
              video={recordedVideo}
              onRestart={handleStep3Restart}
              onConfirm={handleStep3Complete}
            />
          </PopIn>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <AnimatedBackground>
        <ToolbarSpacer />
        <Container 
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 4
          }}
        >
            <FadeIn delay={0.4}>
              <Paper 
                elevation={6}
                sx={{ 
                  p: 4, 
                  borderRadius: 'var(--radius-large)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px var(--card-shadow)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '4px',
                    background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                    backgroundSize: '200% 100%',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                />
                
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel 
                  connector={<QontoConnector />}
                  sx={{ mb: 4 }}
                >
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel StepIconComponent={QontoStepIcon}>
                        <Typography 
                          sx={{ 
                            fontWeight: activeStep === index ? 'bold' : 'normal',
                            color: activeStep === index ? 'var(--primary)' : 'inherit'
                          }}
                        >
                          {label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                <Box sx={{ mt: 4 }}>
                  {getStepContent(activeStep)}
                </Box>
                
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ 
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 9999
                    }}>
                      <PopIn>
                        <Paper 
                          elevation={24}
                          sx={{ 
                            p: 4, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 3,
                            borderRadius: 'var(--radius-large)',
                            minWidth: 300,
                            background: 'var(--card-bg)',
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              display: 'inline-flex',
                              mb: 1
                            }}
                          >
                            <CircularProgress 
                              variant="determinate" 
                              value={analyzingProgress} 
                              size={80} 
                              thickness={4}
                              sx={{ color: 'var(--primary)' }} 
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {`${Math.round(analyzingProgress)}%`}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            {analyzeStatus}
                          </Typography>
                          
                          <Box className="loading-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </Box>
                        </Paper>
                      </PopIn>
                    </Box>
                  </motion.div>
                )}
              </Paper>
            </FadeIn>
          </Container>
      </AnimatedBackground>
    </PageTransition>
  );
} 