'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '70vh' // 确保内容在视口中垂直居中
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          欢迎使用健康智能分析平台
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          通过先进的多模态AI技术，深入了解您的身心健康状况。
        </Typography>
        <Typography variant="body1" sx={{mb: 4}}>
          上传您的面部表情、声音片段和心率数据，我们将为您提供专业的分析报告和个性化建议。
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={Link} 
          href="/dashboard"
          sx={{ py: 1.5, px: 4, fontSize: '1.2rem' }}
        >
          开始分析
        </Button>
      </Box>
    </Container>
  );
} 