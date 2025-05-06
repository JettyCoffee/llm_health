'use client';
import React, { useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import DataInputForm from '../(components)/dashboard/DataInputForm';
import AnalysisDisplay from '../(components)/dashboard/AnalysisDisplay';
import type { AnalyzeDataPayload, AnalysisReport } from '@/types';

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisSubmit = async (data: AnalyzeDataPayload) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    console.log("仪表盘提交数据:", data);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `请求失败，状态码: ${response.status}`);
      }

      const result = await response.json() as AnalysisReport;
      setAnalysisResult(result);
      console.log("分析结果:", result);

    } catch (err: any) {
      console.error("分析请求失败:", err);
      setError(err.message || '发生未知错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ my: 2, fontWeight: 'bold' }}>
        健康分析仪表盘
      </Typography>
      
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          输入您的健康数据
        </Typography>
        <DataInputForm onSubmit={handleAnalysisSubmit} isLoading={isLoading} />
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ml: 2, alignSelf: 'center'}}>正在分析中，请稍候...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {analysisResult && !isLoading && (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main'}}>
            您的健康分析报告
          </Typography>
          <AnalysisDisplay report={analysisResult} />
        </Paper>
      )}
    </Container>
  );
} 