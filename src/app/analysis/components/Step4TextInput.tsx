import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

interface Step4TextInputProps {
  onComplete: (text: string) => void;
}

export default function Step4TextInput({ onComplete }: Step4TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onComplete(text);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          分享您的心情
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          请告诉我们您最近的心情如何，有什么想要分享的开心或烦恼的事情。
          您的分享对我们很重要，这将帮助我们更好地理解您的情绪状态。
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请在这里输入您的想法..."
          variant="outlined"
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            完成
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 