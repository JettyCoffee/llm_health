'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  TextField, 
  Typography,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Stack
} from '@mui/material';
import { PhotoCamera, Upload as UploadIcon, Mic, Stop } from '@mui/icons-material';
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
  
  // 将数据转换为 base64
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(wavData.buffer))));
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

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
    
    try {
      setIsLoadingLocal(true);
      setIsLoading(true);
      
      // 压缩图片
      const compressedImage = await compressImage(currentFacialImage);
      
      // 准备心率数据
      let heartRateData = '';
      if (heartRateSource === 'manual') {
        heartRateData = heartRate;
      } else if (heartRateFile) {
        // 读取心率文件内容
        const reader = new FileReader();
        heartRateData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsText(heartRateFile);
        });
      }

      // 处理音频数据
      let voiceData = '';
      if (audioBlob) {
        voiceData = await processAudioData(audioBlob);
      }
      
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          facialData: compressedImage,
          voiceData,
          heartRateData
        })
      });
      
      if (!response.ok) {
        throw new Error('分析请求失败');
      }
      
      const data = await response.json();
      onAnalysisComplete(data);
    } catch (error: any) {
      console.error('分析请求错误:', error);
      setError(error.message || '分析请求失败，请稍后重试');
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {/* 面部数据采集 */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                面部数据采集
              </Typography>
              
              <ToggleButtonGroup
                value={facialImageSource}
                exclusive
                onChange={handleImageSourceChange}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="camera">
                  <PhotoCamera sx={{ mr: 1 }} />
                  实时拍摄
                </ToggleButton>
                <ToggleButton value="upload">
                  <UploadIcon sx={{ mr: 1 }} />
                  上传照片
                </ToggleButton>
              </ToggleButtonGroup>
              
              {facialImageSource === 'camera' ? (
                !facialImage ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 480,
                        height: 480,
                        facingMode: "user"
                      }}
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        marginBottom: '16px' 
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={captureFacialImage}
                      fullWidth
                    >
                      拍摄照片
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box 
                      component="img" 
                      src={facialImage} 
                      alt="面部照片"
                      sx={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        marginBottom: '16px' 
                      }}
                    />
                    <Button 
                      variant="outlined" 
                      onClick={retakeFacialImage}
                      fullWidth
                    >
                      重新拍摄
                    </Button>
                  </Box>
                )
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  {!uploadedImage ? (
                    <label htmlFor="image-upload" style={{ width: '100%' }}>
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        startIcon={<UploadIcon />}
                      >
                        选择图片
                      </Button>
                    </label>
                  ) : (
                    <>
                      <Box 
                        component="img" 
                        src={uploadedImage} 
                        alt="上传的照片"
                        sx={{ 
                          width: '100%', 
                          borderRadius: '8px', 
                          marginBottom: '16px' 
                        }}
                      />
                      <label htmlFor="image-upload" style={{ width: '100%' }}>
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                        >
                          重新选择
                        </Button>
                      </label>
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* 其他健康数据 */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                其他健康数据
              </Typography>
              
              {/* 录音控件 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  声音录制
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  {!audioBlob ? (
                    <Button
                      variant="contained"
                      color={isRecording ? "error" : "primary"}
                      startIcon={isRecording ? <Stop /> : <Mic />}
                      onClick={isRecording ? stopRecording : startRecording}
                      fullWidth
                    >
                      {isRecording ? "停止录音" : "开始录音"}
                    </Button>
                  ) : (
                    <>
                      <audio src={audioUrl!} controls style={{ width: '100%' }} />
                      <IconButton onClick={resetRecording} color="primary">
                        <UploadIcon />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </Box>
              
              {/* 心率数据输入 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  心率数据
                </Typography>
                <ToggleButtonGroup
                  value={heartRateSource}
                  exclusive
                  onChange={handleHeartRateSourceChange}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="manual">
                    手动输入
                  </ToggleButton>
                  <ToggleButton value="file">
                    上传文件
                  </ToggleButton>
                </ToggleButtonGroup>
                
                {heartRateSource === 'manual' ? (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="heartRate"
                    label="心率数据 (BPM)"
                    name="heartRate"
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                  />
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <input
                      accept=".csv,.txt"
                      style={{ display: 'none' }}
                      id="heart-rate-file"
                      type="file"
                      onChange={handleHeartRateFileUpload}
                    />
                    <label htmlFor="heart-rate-file" style={{ width: '100%' }}>
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        startIcon={<UploadIcon />}
                      >
                        {heartRateFile ? heartRateFile.name : '选择心率数据文件'}
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '提交分析'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 