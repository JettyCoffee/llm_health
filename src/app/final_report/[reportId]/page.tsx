'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';

interface FinalReport {
  reportTitle: string;
  reportDateTime: string;
  overallAssessment: {
    psychologicalState: string;
    emotionalTone: string;
    confidenceLevel: string;
  };
  detailedAnalysis: {
    cognitiveDimension: {
      thoughtPatterns: string;
      attentionFocus: string;
      decisivenessTrait: string;
    };
    emotionalDimension: {
      primaryEmotions: string[];
      emotionalRegulation: string;
      emotionalExpressiveness: string;
    };
    behavioralDimension: {
      communicationStyle: string;
      interpersonalApproach: string;
      stressResponses: string;
    };
  };
  insightsAndRecommendations: {
    potentialStrengths: string[];
    potentialChallenges: string[];
    developmentSuggestions: string[];
  };
  disclaimer: string;
}

export default function FinalReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/analysis/latest?time=${reportId}`);
        if (!response.ok) {
          throw new Error('获取报告失败');
        }
        
        const data = await response.json();
        
        // 解析最终报告数据
        if (data && data.result) {
          const resultData = JSON.parse(data.result);
          if (resultData.type === 'final_report' && resultData.report) {
            // 尝试将报告数据格式化为标准格式
            try {
              const standardReport = normalizeReportData(resultData.report);
              setReport(standardReport);
            } catch (formatError) {
              console.error('报告格式化失败:', formatError);
              setError('报告格式化失败');
            }
          } else {
            setError('报告格式错误');
          }
        } else {
          setError('未找到报告数据');
        }
      } catch (error) {
        console.error('加载报告失败:', error);
        setError('加载报告失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId]);
  
  // 数据格式化函数，确保报告数据符合预期格式
  const normalizeReportData = (rawReport: any): FinalReport => {
    // 如果是原始字符串，尝试解析
    if (typeof rawReport === 'string') {
      try {
        rawReport = JSON.parse(rawReport);
      } catch (e) {
        console.warn('报告是字符串但不是有效JSON:', e);
      }
    }
    
    // 如果有raw字段，可能是格式化失败的原始内容
    if (rawReport.raw && typeof rawReport.raw === 'string') {
      try {
        // 尝试提取JSON
        if (rawReport.raw.includes('{')) {
          const jsonStart = rawReport.raw.indexOf('{');
          const jsonEnd = rawReport.raw.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonStr = rawReport.raw.substring(jsonStart, jsonEnd);
            const parsedJson = JSON.parse(jsonStr);
            rawReport = parsedJson;
          }
        }
      } catch (e) {
        console.warn('从raw字段提取JSON失败:', e);
      }
    }
    
    // 创建一个默认的报告对象
    const defaultReport: FinalReport = {
      reportTitle: "用户心理分析报告",
      reportDateTime: new Date().toLocaleString(),
      overallAssessment: {
        psychologicalState: "无法获取",
        emotionalTone: "无法获取",
        confidenceLevel: "低"
      },
      detailedAnalysis: {
        cognitiveDimension: {
          thoughtPatterns: "无法获取",
          attentionFocus: "无法获取",
          decisivenessTrait: "无法获取"
        },
        emotionalDimension: {
          primaryEmotions: ["未知"],
          emotionalRegulation: "无法获取",
          emotionalExpressiveness: "无法获取"
        },
        behavioralDimension: {
          communicationStyle: "无法获取",
          interpersonalApproach: "无法获取",
          stressResponses: "无法获取"
        }
      },
      insightsAndRecommendations: {
        potentialStrengths: ["无法获取"],
        potentialChallenges: ["无法获取"],
        developmentSuggestions: ["无法获取"]
      },
      disclaimer: "此报告是在数据解析错误的情况下生成的，可能不准确。"
    };
    
    // 合并原始报告数据和默认数据
    return {
      ...defaultReport,
      ...rawReport,
      overallAssessment: {
        ...defaultReport.overallAssessment,
        ...(rawReport.overallAssessment || {})
      },
      detailedAnalysis: {
        cognitiveDimension: {
          ...defaultReport.detailedAnalysis.cognitiveDimension,
          ...(rawReport.detailedAnalysis?.cognitiveDimension || {})
        },
        emotionalDimension: {
          ...defaultReport.detailedAnalysis.emotionalDimension,
          ...(rawReport.detailedAnalysis?.emotionalDimension || {}),
          primaryEmotions: rawReport.detailedAnalysis?.emotionalDimension?.primaryEmotions || defaultReport.detailedAnalysis.emotionalDimension.primaryEmotions
        },
        behavioralDimension: {
          ...defaultReport.detailedAnalysis.behavioralDimension,
          ...(rawReport.detailedAnalysis?.behavioralDimension || {})
        }
      },
      insightsAndRecommendations: {
        ...defaultReport.insightsAndRecommendations,
        ...(rawReport.insightsAndRecommendations || {}),
        potentialStrengths: rawReport.insightsAndRecommendations?.potentialStrengths || defaultReport.insightsAndRecommendations.potentialStrengths,
        potentialChallenges: rawReport.insightsAndRecommendations?.potentialChallenges || defaultReport.insightsAndRecommendations.potentialChallenges,
        developmentSuggestions: rawReport.insightsAndRecommendations?.developmentSuggestions || defaultReport.insightsAndRecommendations.developmentSuggestions
      }
    };
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !report) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {error || '无法加载报告'}
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PsychologyIcon fontSize="large" color="primary" />
            <Typography variant="h4" component="h1">
              {report.reportTitle}
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            生成时间: {report.reportDateTime}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* 整体评估 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
              整体评估
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  心理状态
                </Typography>
                <Typography variant="body1" paragraph>
                  {report.overallAssessment.psychologicalState}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  情绪基调
                </Typography>
                <Typography variant="body1" paragraph>
                  {report.overallAssessment.emotionalTone}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    分析可信度:
                  </Typography>
                  <Chip 
                    label={report.overallAssessment.confidenceLevel} 
                    color={
                      report.overallAssessment.confidenceLevel === '高' ? 'success' : 
                      report.overallAssessment.confidenceLevel === '中' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* 详细分析 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
              详细分析
            </Typography>
            
            <Grid container spacing={3}>
              {/* 认知维度 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                      认知维度
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      思维模式
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.cognitiveDimension.thoughtPatterns}
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      注意力焦点
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.cognitiveDimension.attentionFocus}
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      决策特征
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.cognitiveDimension.decisivenessTrait}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 情感维度 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                      情感维度
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      主要情绪
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {report.detailedAnalysis.emotionalDimension.primaryEmotions.map((emotion, index) => (
                        <Chip 
                          key={index} 
                          label={emotion} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle2">
                      情绪调节能力
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.emotionalDimension.emotionalRegulation}
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      情绪表达方式
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.emotionalDimension.emotionalExpressiveness}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 行为维度 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                      行为维度
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      沟通风格
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.behavioralDimension.communicationStyle}
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      人际交往倾向
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.behavioralDimension.interpersonalApproach}
                    </Typography>
                    
                    <Typography variant="subtitle2">
                      应对压力的行为模式
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.detailedAnalysis.behavioralDimension.stressResponses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* 洞察与建议 */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightbulbIcon color="warning" />
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                洞察与建议
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {/* 潜在优势 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      潜在优势
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.potentialStrengths.map((strength, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'rgba(255,255,255,0.9)', mb: 1, borderRadius: 1 }}>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 潜在挑战 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'error.light', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      潜在挑战
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.potentialChallenges.map((challenge, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'rgba(255,255,255,0.9)', mb: 1, borderRadius: 1 }}>
                          <ListItemText primary={challenge} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 发展建议 */}
              <Grid xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'info.light', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      发展建议
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.developmentSuggestions.map((suggestion, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'rgba(255,255,255,0.9)', mb: 1, borderRadius: 1 }}>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* 免责声明 */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                免责声明
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {report.disclaimer}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 