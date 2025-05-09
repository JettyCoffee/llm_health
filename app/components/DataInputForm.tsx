'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  CardHeader,
  CircularProgress, 
  Grid, 
  TextField, 
  Typography,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  LinearProgress,
  Divider,
  useTheme,
  Paper,
  alpha
} from '@mui/material';
import { 
  PhotoCamera, 
  Upload as UploadIcon, 
  Mic, 
  Stop,
  ExpandMore,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  CameraAlt,
  FaceRetouchingNatural,
  MicNone,
  HeartBroken,
  HealthAndSafety,
  Favorite,
  Send
} from '@mui/icons-material';
import Webcam from 'react-webcam';

// 图片压缩函数
async function compressImage(imageDataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // 如果图片宽度大于最大宽度，按比例缩放
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width));
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx!.drawImage(img, 0, 0, width, height);
      
      // 压缩为 JPEG 格式，质量 0.8
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
}

// 音频压缩和转换函数
async function processAudioData(audioBlob: Blob): Promise<string> {
  // 将音频转换为 WAV 格式，采样率 16000Hz，单声道
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
  
  // 创建新的 AudioBuffer（降采样）
  const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  
  const renderedBuffer = await offlineCtx.startRendering();
  
  // 将 AudioBuffer 转换为 WAV 格式
  const wavData = new Float32Array(renderedBuffer.length);
  renderedBuffer.copyFromChannel(wavData, 0);
  
  // 将数据分块处理，避免栈溢出
  const chunkSize = 1024;
  let binary = '';
  const bytes = new Uint8Array(wavData.buffer);
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  // 将二进制数据转换为 base64
  const base64 = btoa(binary);
  return `data:audio/wav;base64,${base64}`;
}

interface DataInputFormProps {
  userId: string;
  onAnalysisComplete: (results: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function DataInputForm({ 
  userId, 
  onAnalysisComplete,
  setIsLoading 
}: DataInputFormProps) {
  const theme = useTheme();
  
  // 面部数据状态
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [facialImageSource, setFacialImageSource] = useState<'camera' | 'upload'>('camera');
  const [facialImage, setFacialImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // 心率数据状态
  const [heartRateSource, setHeartRateSource] = useState<'manual' | 'file'>('manual');
  const [heartRate, setHeartRate] = useState('');
  const [heartRateFile, setHeartRateFile] = useState<File | null>(null);
  
  // 录音状态
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoadingLocal] = useState(false);

  // 面部数据完成状态
  const [facialDataComplete, setFacialDataComplete] = useState(false);
  // 音频数据完成状态
  const [audioDataComplete, setAudioDataComplete] = useState(false);
  // 心率数据完成状态
  const [heartRateDataComplete, setHeartRateDataComplete] = useState(false);
  
  // 当前激活的步骤
  const [activeStep, setActiveStep] = useState<'facial' | 'audio' | 'heartRate' | 'review'>('facial');
  
  // 监控数据状态变化
  useEffect(() => {
    setFacialDataComplete(!!facialImage || !!uploadedImage);
  }, [facialImage, uploadedImage]);
  
  useEffect(() => {
    setAudioDataComplete(!!audioUrl);
  }, [audioUrl]);
  
  useEffect(() => {
    if (heartRateSource === 'manual') {
      setHeartRateDataComplete(!!heartRate && !isNaN(Number(heartRate)));
    } else {
      setHeartRateDataComplete(!!heartRateFile);
    }
  }, [heartRate, heartRateFile, heartRateSource]);
  
  // 下一步
  const handleNext = () => {
    if (activeStep === 'facial') {
      setActiveStep('audio');
    } else if (activeStep === 'audio') {
      setActiveStep('heartRate');
    } else if (activeStep === 'heartRate') {
      setActiveStep('review');
    }
  };
  
  // 上一步
  const handleBack = () => {
    if (activeStep === 'audio') {
      setActiveStep('facial');
    } else if (activeStep === 'heartRate') {
      setActiveStep('audio');
    } else if (activeStep === 'review') {
      setActiveStep('heartRate');
    }
  };

  // 处理图像来源切换
  const handleImageSourceChange = (event: React.MouseEvent<HTMLElement>, newSource: 'camera' | 'upload') => {
    if (newSource !== null) {
      setFacialImageSource(newSource);
      setFacialImage(null);
      setUploadedImage(null);
    }
  };

  // 处理心率数据来源切换
  const handleHeartRateSourceChange = (event: React.MouseEvent<HTMLElement>, newSource: 'manual' | 'file') => {
    if (newSource !== null) {
      setHeartRateSource(newSource);
      setHeartRate('');
      setHeartRateFile(null);
    }
  };

  // 捕获面部图像
  const captureFacialImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFacialImage(imageSrc);
    }
  }, [webcamRef]);

  // 重新拍照
  const retakeFacialImage = useCallback(() => {
    setFacialImage(null);
  }, []);

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理心率数据文件上传
  const handleHeartRateFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHeartRateFile(file);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        
        // 检查音频大小（限制为 10MB）
        if (audioBlob.size > 10 * 1024 * 1024) {
          setError('录音文件过大，请录制更短的音频');
          return;
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      // 设置录音时长限制（30秒）
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
          setError('已自动停止录音（最大录音时长为30秒）');
        }
      }, 30000);

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('录音失败:', err);
      setError('无法访问麦克风');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // 停止所有音轨
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // 重新录音
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl); // 释放 URL 对象
    }
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // 提交数据进行分析
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentFacialImage = facialImageSource === 'camera' ? facialImage : uploadedImage;
    
    if (!currentFacialImage) {
      setError('请提供面部图像');
      return;
    }
    
    if (!audioBlob) {
      setError('请录制语音样本');
      return;
    }
    
    if (heartRateSource === 'manual' && (!heartRate || isNaN(Number(heartRate)))) {
      setError('请输入有效的心率数值');
      return;
    } else if (heartRateSource === 'file' && !heartRateFile) {
      setError('请上传心率数据文件');
      return;
    }
    
    try {
      // 开始加载
      setIsLoadingLocal(true);
      setIsLoading(true);
      
      // 压缩图像
      const compressedImage = await compressImage(currentFacialImage);
      
      // 处理音频
      const processedAudio = await processAudioData(audioBlob);
      
      // 准备心率数据
      let heartRateData = '';
      if (heartRateSource === 'manual') {
        heartRateData = heartRate;
      } else if (heartRateFile) {
        // 读取文件内容
        const text = await heartRateFile.text();
        heartRateData = text;
      }
      
      // 发送数据到API
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          facialData: compressedImage,
          voiceData: processedAudio,
          heartRateData: heartRateData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`分析请求失败: ${response.statusText}`);
      }
      
      const results = await response.json();
      
      // 回调通知父组件分析完成
      onAnalysisComplete(results);
      
    } catch (err: any) {
      console.error('分析失败:', err);
      setError(`分析失败: ${err.message}`);
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };
  
  // 渲染面部数据收集界面
  const renderFacialDataSection = () => (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: activeStep === 'facial' ? 'scale(1)' : 'scale(0.98)',
        opacity: activeStep === 'facial' ? 1 : 0.7,
      }}
    >
      <CardHeader
        avatar={<FaceRetouchingNatural color="primary" />}
        title={
          <Typography variant="h6">
            面部数据采集
            {facialDataComplete && (
              <CheckCircle 
                fontSize="small" 
                color="success" 
                sx={{ ml: 1, verticalAlign: 'middle' }} 
              />
            )}
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            选择数据采集方式:
          </Typography>
          <ToggleButtonGroup
            value={facialImageSource}
            exclusive
            onChange={handleImageSourceChange}
            aria-label="面部数据来源"
            sx={{ 
              mb: 2,
              '& .MuiToggleButton-root': {
                borderRadius: '8px',
                mr: 1,
                px: 3,
                py: 1
              }
            }}
          >
            <ToggleButton value="camera" aria-label="相机捕获">
              <CameraAlt sx={{ mr: 1 }} />
              使用相机
            </ToggleButton>
            <ToggleButton value="upload" aria-label="上传图像">
              <UploadIcon sx={{ mr: 1 }} />
              上传图像
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {facialImageSource === 'camera' && (
          <Box sx={{ mt: 2 }}>
            {!showCamera && !facialImage && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setShowCamera(true)}
                startIcon={<CameraAlt />}
                sx={{ mb: 2 }}
              >
                打开相机
              </Button>
            )}
            
            {showCamera && !facialImage && (
              <Box 
                sx={{ 
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[2],
                  mb: 2
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{ facingMode: "user" }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 0, 
                    right: 0, 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <IconButton
                    onClick={captureFacialImage}
                    color="primary"
                    sx={{ 
                      bgcolor: 'white', 
                      '&:hover': { bgcolor: 'white' },
                      boxShadow: theme.shadows[4],
                      p: 2
                    }}
                  >
                    <PhotoCamera fontSize="large" />
                  </IconButton>
                </Box>
              </Box>
            )}
            
            {facialImage && (
              <Box>
                <Box 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    boxShadow: theme.shadows[1],
                  }}
                >
                  <img 
                    src={facialImage} 
                    alt="面部图像" 
                    style={{ width: '100%', display: 'block' }} 
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={retakeFacialImage}
                    startIcon={<CameraAlt />}
                  >
                    重新拍摄
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}
        
        {facialImageSource === 'upload' && (
          <Box sx={{ mt: 2 }}>
            {!uploadedImage && (
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                选择图像
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            )}
            
            {uploadedImage && (
              <Box>
                <Box 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: theme.shadows[1],
                  }}
                >
                  <img 
                    src={uploadedImage} 
                    alt="已上传图像" 
                    style={{ width: '100%', display: 'block' }} 
                  />
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  更换图像
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!facialDataComplete} 
          endIcon={<ArrowForward />}
          onClick={handleNext}
        >
          下一步
        </Button>
      </CardActions>
    </Card>
  );

  // 渲染语音数据收集界面
  const renderAudioSection = () => (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: activeStep === 'audio' ? 'scale(1)' : 'scale(0.98)',
        opacity: activeStep === 'audio' ? 1 : 0.7,
      }}
    >
      <CardHeader
        avatar={<MicNone color="primary" />}
        title={
          <Typography variant="h6">
            语音数据采集
            {audioDataComplete && (
              <CheckCircle 
                fontSize="small" 
                color="success" 
                sx={{ ml: 1, verticalAlign: 'middle' }} 
              />
            )}
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            请录制一段语音（朗读以下内容）:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" gutterBottom>
              今天天气很好，阳光明媚。我感觉心情不错，希望通过这个健康分析能够了解自己的身体状况。我平时生活规律，喜欢适当运动，饮食也比较均衡。
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          {!isRecording && !audioUrl && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startRecording}
              startIcon={<Mic />}
              sx={{ borderRadius: '24px', px: 3 }}
            >
              开始录音
            </Button>
          )}
          
          {isRecording && (
            <Box sx={{ textAlign: 'center' }}>
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  mb: 2,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}`
                    },
                    '70%': {
                      boxShadow: `0 0 0 15px ${alpha(theme.palette.error.main, 0)}`
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                    }
                  }
                }}
              >
                <Mic fontSize="large" color="error" />
              </Box>
              <Typography variant="subtitle1" color="error" gutterBottom>
                正在录音...
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={stopRecording}
                startIcon={<Stop />}
                sx={{ mt: 1, borderRadius: '24px' }}
              >
                停止录音
              </Button>
            </Box>
          )}
          
          {audioUrl && (
            <Box>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 2
                }}
              >
                <audio controls src={audioUrl} style={{ width: '100%' }} />
              </Box>
              <Button 
                variant="outlined" 
                onClick={resetRecording}
                startIcon={<Mic />}
              >
                重新录音
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          返回
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!audioDataComplete} 
          endIcon={<ArrowForward />}
          onClick={handleNext}
        >
          下一步
        </Button>
      </CardActions>
    </Card>
  );

  // 渲染心率数据收集界面
  const renderHeartRateSection = () => (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: activeStep === 'heartRate' ? 'scale(1)' : 'scale(0.98)',
        opacity: activeStep === 'heartRate' ? 1 : 0.7,
      }}
    >
      <CardHeader
        avatar={<Favorite color="primary" />}
        title={
          <Typography variant="h6">
            心率数据采集
            {heartRateDataComplete && (
              <CheckCircle 
                fontSize="small" 
                color="success" 
                sx={{ ml: 1, verticalAlign: 'middle' }} 
              />
            )}
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            选择数据采集方式:
          </Typography>
          <ToggleButtonGroup
            value={heartRateSource}
            exclusive
            onChange={handleHeartRateSourceChange}
            aria-label="心率数据来源"
            sx={{ 
              mb: 3,
              '& .MuiToggleButton-root': {
                borderRadius: '8px',
                mr: 1,
                px: 3,
                py: 1
              }
            }}
          >
            <ToggleButton value="manual" aria-label="手动输入">
              手动输入
            </ToggleButton>
            <ToggleButton value="file" aria-label="上传文件">
              <UploadIcon sx={{ mr: 1 }} />
              上传文件
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {heartRateSource === 'manual' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="静息心率 (BPM)"
              type="number"
              fullWidth
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              helperText="请输入您的静息心率（每分钟心跳次数）"
              InputProps={{
                startAdornment: (
                  <Favorite color="error" sx={{ mr: 1 }} />
                ),
              }}
            />
          </Box>
        )}
        
        {heartRateSource === 'file' && (
          <Box sx={{ mt: 2 }}>
            {!heartRateFile ? (
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                上传心率数据文件
                <input
                  type="file"
                  hidden
                  accept=".csv,.txt"
                  onChange={handleHeartRateFileUpload}
                />
              </Button>
            ) : (
              <Box sx={{ 
                p: 2, 
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  已上传: {heartRateFile.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                >
                  更换文件
                  <input
                    type="file"
                    hidden
                    accept=".csv,.txt"
                    onChange={handleHeartRateFileUpload}
                  />
                </Button>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              支持的格式: CSV 或 TXT 文件，包含心率数据
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          返回
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!heartRateDataComplete} 
          endIcon={<ArrowForward />}
          onClick={handleNext}
        >
          下一步
        </Button>
      </CardActions>
    </Card>
  );

  // 渲染审核和提交界面
  const renderReviewSection = () => (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: activeStep === 'review' ? 'scale(1)' : 'scale(0.98)',
        opacity: activeStep === 'review' ? 1 : 0.7,
      }}
    >
      <CardHeader
        avatar={<HealthAndSafety color="primary" />}
        title={
          <Typography variant="h6">
            数据确认和提交
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            请确认您的数据:
          </Typography>
          
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.7) }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <FaceRetouchingNatural color="primary" fontSize="small" />
              <Typography variant="subtitle2">
                面部数据
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 'auto', 
                  bgcolor: 'success.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 8,
                  fontWeight: 'bold'
                }}
              >
                已完成
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <MicNone color="primary" fontSize="small" />
              <Typography variant="subtitle2">
                语音数据
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 'auto', 
                  bgcolor: 'success.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 8,
                  fontWeight: 'bold'
                }}
              >
                已完成
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Favorite color="primary" fontSize="small" />
              <Typography variant="subtitle2">
                心率数据
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 'auto', 
                  bgcolor: 'success.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 8,
                  fontWeight: 'bold'
                }}
              >
                已完成
              </Typography>
            </Stack>
          </Paper>
          
          <Alert 
            severity="info" 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: theme.palette.primary.main
              }
            }}
          >
            点击"开始分析"后，系统将处理您的数据并生成健康评估结果。这可能需要几秒钟时间。
          </Alert>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          返回
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
        >
          {isLoading ? '分析中...' : '开始分析'}
        </Button>
      </CardActions>
    </Card>
  );
  
  const renderProgressStepper = () => (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 2,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {[
          { id: 'facial', label: '面部', icon: <FaceRetouchingNatural />, complete: facialDataComplete },
          { id: 'audio', label: '语音', icon: <MicNone />, complete: audioDataComplete },
          { id: 'heartRate', label: '心率', icon: <Favorite />, complete: heartRateDataComplete },
          { id: 'review', label: '提交', icon: <Send />, complete: false },
        ].map((step, index) => (
          <Box 
            key={step.id} 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              width: '25%',
              zIndex: 1
            }}
          >
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 
                  activeStep === step.id 
                    ? theme.palette.primary.main 
                    : step.complete 
                      ? alpha(theme.palette.success.main, 0.2)
                      : alpha(theme.palette.grey[300], 0.5),
                color: 
                  activeStep === step.id 
                    ? 'white' 
                    : step.complete 
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                mb: 1,
                transition: 'all 0.3s ease',
                border: step.complete && activeStep !== step.id ? `2px solid ${theme.palette.success.main}` : 'none',
              }}
            >
              {step.icon}
            </Box>
            <Typography 
              variant="caption" 
              color={activeStep === step.id ? 'primary' : 'text.secondary'}
              fontWeight={activeStep === step.id ? 'bold' : 'normal'}
            >
              {step.label}
            </Typography>
            
            {index < 3 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 24,
                  left: '60%',
                  width: '80%',
                  height: 2,
                  bgcolor: step.complete ? theme.palette.success.main : theme.palette.grey[300],
                  zIndex: -1
                }}
              />
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
  
  return (
    <Box sx={{ mt: 2 }}>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {renderProgressStepper()}
      
      <Box sx={{ position: 'relative' }}>
        {renderFacialDataSection()}
        {renderAudioSection()}
        {renderHeartRateSection()}
        {renderReviewSection()}
      </Box>
    </Box>
  );
} 