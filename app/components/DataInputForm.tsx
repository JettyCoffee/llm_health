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
  Snackbar
} from '@mui/material';
import Webcam from 'react-webcam';
import axios from 'axios';

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
  const [heartRate, setHeartRate] = useState('');
  const [voiceData, setVoiceData] = useState('');
  const [facialImage, setFacialImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoadingLocal] = useState(false);

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

  // 提交数据进行分析
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facialImage) {
      setError('请先拍摄面部照片');
      return;
    }
    
    try {
      setIsLoadingLocal(true);
      setIsLoading(true);
      
      const response = await axios.post('/api/llm', {
        userId,
        facialData: facialImage,
        voiceData,
        heartRateData: heartRate
      });
      
      onAnalysisComplete(response.data);
    } catch (error: any) {
      console.error('分析请求错误:', error);
      setError(error.response?.data?.error || '分析请求失败，请稍后重试');
    } finally {
      setIsLoadingLocal(false);
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                面部数据采集
              </Typography>
              
              {!facialImage ? (
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
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                其他健康数据
              </Typography>
              
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
                sx={{ mb: 3 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="voiceData"
                label="声音特征描述"
                name="voiceData"
                multiline
                rows={4}
                value={voiceData}
                onChange={(e) => setVoiceData(e.target.value)}
                helperText="请描述声音特征，如音调、清晰度、有无颤抖等"
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
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