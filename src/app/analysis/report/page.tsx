'use client';

import { useEffect, useState } from 'react';
import AnalysisReport from '../components/AnalysisReport';
import { Typography, Box, CircularProgress } from '@mui/material';

export default function ReportPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysisData() {
      try {
        // 从我们的API端点获取最新的分析结果
        const response = await fetch('/api/analysis/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError('获取分析数据时出错，请稍后重试');
      }
    }

    fetchAnalysisData();
  }, []);

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!analysisData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AnalysisReport
      customText1={analysisData.customText1 || ""}
      customText2={analysisData.customText2 || ""}
      analysisData={analysisData}
    />
  );
} 