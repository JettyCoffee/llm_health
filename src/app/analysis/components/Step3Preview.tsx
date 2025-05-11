'use client';

import { useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Step3PreviewProps {
  video: File;
  onRestart: () => void;
  onConfirm: () => void;
}

export default function Step3Preview({ video, onRestart, onConfirm }: Step3PreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (video && videoRef.current) {
      const videoURL = URL.createObjectURL(video);
      videoRef.current.src = videoURL;
      
      return () => {
        URL.revokeObjectURL(videoURL);
      };
    }
  }, [video]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        确认视频
      </Typography>
      <Typography paragraph>
        请确认录制的视频清晰可见，并且声音清晰可听。
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 640 }}>
            <video 
              ref={videoRef} 
              controls
              style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
            />
          </Box>
          
          <Typography variant="subtitle1">
            视频大小: {(video.size / (1024 * 1024)).toFixed(2)} MB
          </Typography>
        </Box>
      </Paper>
      
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<ReplayIcon />}
          onClick={onRestart}
        >
          重新录制
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<CheckCircleOutlineIcon />}
          onClick={onConfirm}
        >
          确认并分析
        </Button>
      </Stack>
    </Box>
  );
} 