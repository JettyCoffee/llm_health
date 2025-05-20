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
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          隐私保护声明：
        </Typography>
        <Typography component="div">
          <Typography variant="body1">
            我们高度重视您的隐私安全，请放心使用本系统：
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • 所有数据仅用于本次情绪分析，不会用于其他目的
            • 分析完成后，您可以选择删除所有原始采集数据
            • 我们采用加密技术保护您的数据传输和存储安全
            • 分析报告仅供您个人查看，不会与任何第三方共享
          </Typography>
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={onAgree}
        >
          我已了解并同意开始
        </Button>
      </Box>
    </Box>
  );
}
