import { Box, Typography, Button, Alert } from '@mui/material';

interface Step1ConsentProps {
  onAgree: () => void;
}

export default function Step1Consent({ onAgree }: Step1ConsentProps) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        为了更好地分析您的情绪状态，我们需要采集以下数据：
      </Alert>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          需要采集的数据：
        </Typography>
        <Typography component="div" sx={{ mb: 2 }}>
          1. 面部表情数据
          <Typography variant="body2" color="text.secondary">
            • 我们将通过摄像头每3秒采集一张图片
            • 这些图片将用于分析您的面部表情变化
          </Typography>
        </Typography>
        
        <Typography component="div" sx={{ mb: 2 }}>
          2. 语音数据
          <Typography variant="body2" color="text.secondary">
            • 我们将记录您朗读指定文本时的声音
            • 这些数据将用于分析您的语气和情绪变化
          </Typography>
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        所有数据仅用于本次分析，不会被永久存储或用于其他用途。
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onAgree}
        >
          我同意并开始录制
        </Button>
      </Box>
    </Box>
  );
} 