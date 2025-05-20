import { Box, Typography, Button, Alert } from '@mui/material';

interface Step1ConsentProps {
  onAgree: () => void;
}

export default function Step1Consent({ onAgree }: Step1ConsentProps) {
  return (    
    <Box>
      <Alert severity="info" sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}>
        为了进行有效的情绪状态分析，我们需要您的配合：
      </Alert>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          数据采集要求：
        </Typography>
        <Typography component="div" sx={{ mb: 2 }}>
          <Typography variant="body1">
            我们需要录制一段视频，请您在视频中朗读系统提供的文本内容
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • 视频将捕捉您的面部表情和语音变化
            • 所采集的音视频数据将用于多模态情绪分析
            • 建议您在安静、光线充足的环境中进行录制
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            在最后一步您还可以填写您自己对自己情绪状态的描述
          </Typography>        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}>
        所有录制的数据仅用于本次情绪分析研究，不会被永久存储或用于其他用途。您的隐私安全是我们的首要考虑。
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onAgree}
        >
          我同意并开始数据采集
        </Button>
      </Box>
    </Box>
  );
} 