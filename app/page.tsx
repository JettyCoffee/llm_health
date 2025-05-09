'use client';

import { useState } from 'react';
import { Box, Button, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import DataInputForm from './components/DataInputForm';
import AnalysisResults from './components/AnalysisResults';
import HistoryView from './components/HistoryView';

// 模拟用户ID，实际项目中应该通过认证系统获取
const MOCK_USER_ID = 'user-123456';

export default function Home() {
  const [currentTab, setCurrentTab] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setCurrentTab(1); // 自动切换到结果标签页
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          centered
          variant="fullWidth"
        >
          <Tab label="数据输入" />
          <Tab label="分析结果" disabled={!analysisResults} />
          <Tab label="历史记录" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {currentTab === 0 && (
          <DataInputForm 
            userId={MOCK_USER_ID} 
            onAnalysisComplete={handleAnalysisComplete}
            setIsLoading={setIsLoading}
          />
        )}
        
        {currentTab === 1 && analysisResults && (
          <AnalysisResults results={analysisResults} />
        )}
        
        {currentTab === 2 && (
          <HistoryView userId={MOCK_USER_ID} />
        )}
      </Box>
    </Box>
  );
} 