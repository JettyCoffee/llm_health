'use client';

import { useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Chip, 
  Divider, 
  Grid, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Typography 
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

interface AnalysisResultsProps {
  results: {
    analysisId: string;
    score: {
      facialAnalysis: {
        score: number;
        details: string;
        concerns: string[];
      };
      voiceAnalysis: {
        score: number;
        details: string;
        concerns: string[];
      };
      heartRateAnalysis: {
        score: number;
        details: string;
        concerns: string[];
      };
      overallHealth: {
        score: number;
        details: string;
        recommendations: string[];
      };
    };
    advice: string;
  };
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const radarChartData = {
    labels: ['面部分析', '声音分析', '心率分析', '整体健康'],
    datasets: [
      {
        label: '健康评分',
        data: [
          results.score.facialAnalysis.score,
          results.score.voiceAnalysis.score,
          results.score.heartRateAnalysis.score,
          results.score.overallHealth.score
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 获取评分平均值
  const averageScore = (
    results.score.facialAnalysis.score +
    results.score.voiceAnalysis.score +
    results.score.heartRateAnalysis.score +
    results.score.overallHealth.score
  ) / 4;
  
  const formatAdvice = (text: string) => {
    // 简单的格式化：将文本按段落分隔并增加样式
    return text.split('\n').map((paragraph, index) => (
      <Typography 
        key={index} 
        variant="body1" 
        gutterBottom 
        sx={{ mb: 2 }}
      >
        {paragraph}
      </Typography>
    ));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* 评分卡片 */}
        <Grid item xs={12} md={5}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                健康评分总览
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Radar 
                  data={radarChartData} 
                  options={{
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        ticks: {
                          stepSize: 20
                        }
                      }
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  详细评分
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">面部分析</Typography>
                    <Typography variant="body2">{results.score.facialAnalysis.score}/100</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.score.facialAnalysis.score} 
                    sx={{ my: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">声音分析</Typography>
                    <Typography variant="body2">{results.score.voiceAnalysis.score}/100</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.score.voiceAnalysis.score} 
                    sx={{ my: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">心率分析</Typography>
                    <Typography variant="body2">{results.score.heartRateAnalysis.score}/100</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.score.heartRateAnalysis.score} 
                    sx={{ my: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">整体健康</Typography>
                    <Typography variant="body2">{results.score.overallHealth.score}/100</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={results.score.overallHealth.score} 
                    sx={{ my: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 详细分析结果 */}
        <Grid item xs={12} md={7}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                详细分析结果
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  面部分析
                </Typography>
                <Typography variant="body2" paragraph>
                  {results.score.facialAnalysis.details}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {results.score.facialAnalysis.concerns.map((concern, index) => (
                    <Chip 
                      key={index} 
                      label={concern} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  声音分析
                </Typography>
                <Typography variant="body2" paragraph>
                  {results.score.voiceAnalysis.details}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {results.score.voiceAnalysis.concerns.map((concern, index) => (
                    <Chip 
                      key={index} 
                      label={concern} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  心率分析
                </Typography>
                <Typography variant="body2" paragraph>
                  {results.score.heartRateAnalysis.details}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {results.score.heartRateAnalysis.concerns.map((concern, index) => (
                    <Chip 
                      key={index} 
                      label={concern} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  整体健康评估
                </Typography>
                <Typography variant="body2" paragraph>
                  {results.score.overallHealth.details}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                健康建议
              </Typography>
              
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                {formatAdvice(results.advice)}
              </Paper>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  推荐行动
                </Typography>
                <List>
                  {results.score.overallHealth.recommendations.map((recommendation, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={recommendation} 
                        primaryTypographyProps={{ variant: 'body2' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 