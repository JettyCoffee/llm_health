'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryViewProps {
  userId: string;
}

interface HistoryItem {
  id: string;
  date: string;
  facialScore: number;
  voiceScore: number;
  heartRateScore: number;
  overallScore: number;
  scoreDetails: any;
  advice: string;
  adviceSummary: string;
}

export default function HistoryView({ userId }: HistoryViewProps) {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/history?userId=${userId}`);
        setHistories(response.data.histories);
      } catch (error: any) {
        console.error('获取历史数据错误:', error);
        setError(error.response?.data?.error || '获取历史数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistories();
  }, [userId]);
  
  // 准备图表数据
  const prepareChartData = () => {
    if (histories.length === 0) return null;
    
    // 时间排序（从旧到新）
    const sortedHistories = [...histories].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const labels = sortedHistories.map(h => {
      const date = new Date(h.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: '面部评分',
          data: sortedHistories.map(h => h.facialScore),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: '声音评分',
          data: sortedHistories.map(h => h.voiceScore),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: '心率评分',
          data: sortedHistories.map(h => h.heartRateScore),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: '整体评分',
          data: sortedHistories.map(h => h.overallScore),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderWidth: 2,
        },
      ],
    };
  };
  
  const chartData = prepareChartData();
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (histories.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          暂无历史分析记录
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          完成第一次健康分析后，历史记录将显示在这里
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 趋势图表 */}
      {chartData && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              健康评分趋势
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* 历史记录列表 */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            历史分析记录
          </Typography>
          
          {histories.map((history) => (
            <Accordion key={history.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${history.id}-content`}
                id={`panel-${history.id}-header`}
              >
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      {formatDate(history.date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        整体评分:
                      </Typography>
                      <Chip 
                        label={`${history.overallScore}/100`} 
                        color={
                          history.overallScore >= 80 ? 'success' :
                          history.overallScore >= 60 ? 'primary' :
                          'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>评估类型</TableCell>
                            <TableCell align="right">得分</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>面部分析</TableCell>
                            <TableCell align="right">{history.facialScore}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>声音分析</TableCell>
                            <TableCell align="right">{history.voiceScore}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>心率分析</TableCell>
                            <TableCell align="right">{history.heartRateScore}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>整体评分</TableCell>
                            <TableCell align="right">{history.overallScore}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      健康建议摘要
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {history.adviceSummary}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        // 实现查看完整建议的功能
                        alert(history.advice);
                      }}
                    >
                      查看完整建议
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
} 