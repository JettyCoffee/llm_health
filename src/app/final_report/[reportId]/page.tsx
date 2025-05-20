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
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import Cookies from 'js-cookie';

interface FinalReport {
  reportTitle: string;
  reportDateTime: string;
  overallAssessment: {
    psychologicalState: string;
    psychologicalStateExplanation?: string; // 心理状态的专业解释
    emotionalTone: string;
    emotionalToneExplanation?: string; // 情绪基调的专业解释
    confidenceLevel: string;
    confidenceLevelExplanation?: string; // 可信度的专业解释
  };
  detailedAnalysis: {
    cognitiveDimension: {
      thoughtPatterns: string;
      thoughtPatternsExplanation?: string; // 思维模式的专业解释
      attentionFocus: string;
      attentionFocusExplanation?: string; // 注意力焦点的专业解释
      decisivenessTrait: string;
      decisivenessTraitExplanation?: string; // 决策特征的专业解释
    };
    emotionalDimension: {
      primaryEmotions: string[];
      primaryEmotionsExplanation?: string; // 主要情绪的专业解释
      emotionalRegulation: string;
      emotionalRegulationExplanation?: string; // 情绪调节能力的专业解释
      emotionalExpressiveness: string;
      emotionalExpressivenessExplanation?: string; // 情绪表达方式的专业解释
    };
    behavioralDimension: {
      communicationStyle: string;
      communicationStyleExplanation?: string; // 沟通风格的专业解释
      interpersonalApproach: string;
      interpersonalApproachExplanation?: string; // 人际交往倾向的专业解释
      stressResponses: string;
      stressResponsesExplanation?: string; // 应对压力的行为模式的专业解释
    };
  };
  insightsAndRecommendations: {
    potentialStrengths: string[];
    potentialStrengthsExplanation?: string; // 潜在优势的专业解释
    potentialChallenges: string[];
    potentialChallengesExplanation?: string; // 潜在挑战的专业解释
    developmentSuggestions: string[];
    developmentSuggestionsExplanation?: string; // 发展建议的专业解释
  };
  assessmentMethodology?: string; // 评估方法说明
  theoreticalFramework?: string; // 理论框架说明
  disclaimer: string;
}

export default function FinalReportPage() {
  const params = useParams();
  const reportId = params?.reportId as string;
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');    useEffect(() => {
    const fetchReport = async () => {
      try {
        // 使用重构后的 API 端点获取报告
        const response = await fetch(`/api/export-report?reportId=${reportId}`);
        if (!response.ok) {
          throw new Error('获取报告失败');
        }
        
        const responseData = await response.json();
        
        // 将当前报告URL保存到cookie
        const currentUrl = `/final_report/${reportId}`;
        Cookies.set('lastReportUrl', currentUrl, { expires: 30 }); // 保存30天
        
        // 检查 API 响应结构
        if (responseData.success && responseData.data) {
          const reportData = responseData.data;
          
          // 尝试将报告数据格式化为标准格式
          try {
            const standardReport = normalizeReportData(reportData.psychologicalReport);
            setReport(standardReport);
          } catch (formatError) {
            console.error('报告格式化失败:', formatError);
            setError('报告格式化失败');
          }
        } else {
          setError(responseData.error || '未找到报告数据');
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
        psychologicalStateExplanation: "未能获取有效数据进行心理状态评估",
        emotionalTone: "无法获取",
        emotionalToneExplanation: "未能获取有效数据进行情绪基调评估",
        confidenceLevel: "低",
        confidenceLevelExplanation: "数据样本有限，分析结果仅供参考"
      },
      detailedAnalysis: {
        cognitiveDimension: {
          thoughtPatterns: "无法获取",
          thoughtPatternsExplanation: "思维模式是指个体在处理信息和解决问题时所采用的典型方式",
          attentionFocus: "无法获取",
          attentionFocusExplanation: "注意力焦点反映了个体在处理信息时的选择性注意倾向",
          decisivenessTrait: "无法获取",
          decisivenessTraitExplanation: "决策特征反映了个体在面对选择时的行为模式和思考方式"
        },
        emotionalDimension: {
          primaryEmotions: ["未知"],
          primaryEmotionsExplanation: "主要情绪是指在评估过程中识别出的个体主导情感状态",
          emotionalRegulation: "无法获取",
          emotionalRegulationExplanation: "情绪调节能力是指个体识别、理解和管理自身情绪的能力",
          emotionalExpressiveness: "无法获取",
          emotionalExpressivenessExplanation: "情绪表达方式是指个体向外界传达情感状态的典型方式"
        },
        behavioralDimension: {
          communicationStyle: "无法获取",
          communicationStyleExplanation: "沟通风格反映了个体在表达想法和与他人交流时的特点",
          interpersonalApproach: "无法获取",
          interpersonalApproachExplanation: "人际交往倾向揭示了个体在社交互动中的特征和偏好",
          stressResponses: "无法获取",
          stressResponsesExplanation: "应对压力的行为模式展现了个体面对挑战和困难时的典型反应"
        }
      },
      insightsAndRecommendations: {
        potentialStrengths: ["无法获取"],
        potentialStrengthsExplanation: "基于心理分析识别出的个体可能具备的特质和能力优势",
        potentialChallenges: ["无法获取"],
        potentialChallengesExplanation: "基于心理分析识别出的个体可能面临的困难和发展阻碍",
        developmentSuggestions: ["无法获取"],
        developmentSuggestionsExplanation: "根据心理评估结果提出的个性化发展和成长建议"
      },
      assessmentMethodology: "本报告采用多维度综合评估方法，结合行为观察、语言分析和情绪识别等技术手段，对用户进行全面的心理特征分析。",
      theoreticalFramework: "本评估基于认知行为理论、情绪智能理论和积极心理学等多种心理学理论框架，旨在提供科学、全面的心理特征描述。",
      disclaimer: "此报告是基于有限数据生成的心理分析结果，仅供参考。报告内容不构成临床诊断或医疗建议，如有心理健康方面的顾虑，请咨询专业心理健康服务提供者。"
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
      },
      assessmentMethodology: rawReport.assessmentMethodology || defaultReport.assessmentMethodology,
      theoreticalFramework: rawReport.theoreticalFramework || defaultReport.theoreticalFramework
    };
  };
    // 导出报告为PDF的函数
  const exportToPDF = () => {
    setSnackbarMessage('正在生成报告，请稍候...');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
    
    try {
      // 构造下载URL并触发下载
      const downloadUrl = `/api/export-report?reportId=${reportId}`;
      
      // 创建一个暂时的a标签用于触发下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `心理分析报告_${reportId}.json`; // 实际环境中这将是.pdf
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 显示成功消息
      setSnackbarMessage('报告已成功导出');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err) {
      setSnackbarMessage('导出失败，请稍后重试');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', pt: 8 }}>
        <CircularProgress size={60} thickness={4} sx={{ color: 'var(--primary)' }} />
      </Box>
    );
  }
    if (error || !report) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ pt: 8, pb: 4 }}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 5, 
              textAlign: 'center', 
              borderRadius: 'var(--radius-large)',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.7)'
            }}
          >
            <Typography variant="h5" color="error" sx={{ mb: 2 }}>
              {error || '无法加载报告'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/analysis'}
              sx={{ mt: 2 }}
            >
              返回分析页面
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 8, pb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PsychologyIcon fontSize="large" color="primary" />
              <Typography variant="h4" component="h1">
                {report.reportTitle}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={exportToPDF}
              sx={{ 
                borderRadius: 'var(--radius)',
                boxShadow: '0 4px 12px rgba(95, 90, 246, 0.2)',
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(95, 90, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'              }}
            >
              导出报告
            </Button>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            生成时间: {report.reportDateTime}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* 整体评估 */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SentimentSatisfiedIcon color="primary" />
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                整体评估
              </Typography>
            </Box>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                      心理状态
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                      {report.overallAssessment.psychologicalState}
                    </Typography>
                    {report.overallAssessment.psychologicalStateExplanation && (
                      <Box sx={{ 
                        bgcolor: 'grey.50', 
                        p: 1, 
                        borderRadius: 1, 
                        fontSize: '0.9rem', 
                        mb: 2,
                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                          <strong>专业解释:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {report.overallAssessment.psychologicalStateExplanation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                      情绪基调
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ pl: 1 }}>
                      {report.overallAssessment.emotionalTone}
                    </Typography>
                    {report.overallAssessment.emotionalToneExplanation && (
                      <Box sx={{ 
                        bgcolor: 'grey.50', 
                        p: 1, 
                        borderRadius: 1, 
                        fontSize: '0.9rem', 
                        mb: 2,
                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                          <strong>专业解释:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {report.overallAssessment.emotionalToneExplanation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
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
                  {report.overallAssessment.confidenceLevelExplanation && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({report.overallAssessment.confidenceLevelExplanation})
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
              {/* 评估方法说明 */}
            {report.assessmentMethodology && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }}></Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      评估方法
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 2, borderLeft: '2px solid rgba(25, 118, 210, 0.2)', ml: 0.5 }}>
                    {report.assessmentMethodology}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            {/* 理论框架说明 */}
            {report.theoreticalFramework && (
              <Card variant="outlined" sx={{ bgcolor: 'primary.50', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }}></Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      理论框架
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 2, borderLeft: '2px solid rgba(25, 118, 210, 0.2)', ml: 0.5 }}>
                    {report.theoreticalFramework}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
            {/* 详细分析 */}          
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon color="primary" />
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                详细分析
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* 认知维度 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'info.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'info.main' }}></Box>
                      认知维度
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        思维模式
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.cognitiveDimension.thoughtPatterns}
                      </Typography>                      {report.detailedAnalysis.cognitiveDimension.thoughtPatternsExplanation && (
                        <Box sx={{ 
                          bgcolor: 'info.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(41,182,246,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'info.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'info.dark' }}>
                            {report.detailedAnalysis.cognitiveDimension.thoughtPatternsExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        注意力焦点
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.cognitiveDimension.attentionFocus}
                      </Typography>                      {report.detailedAnalysis.cognitiveDimension.attentionFocusExplanation && (
                        <Box sx={{ 
                          bgcolor: 'info.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(41,182,246,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'info.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'info.dark' }}>
                            {report.detailedAnalysis.cognitiveDimension.attentionFocusExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        决策特征
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.cognitiveDimension.decisivenessTrait}
                      </Typography>                      {report.detailedAnalysis.cognitiveDimension.decisivenessTraitExplanation && (
                        <Box sx={{ 
                          bgcolor: 'info.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(41,182,246,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'info.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'info.dark' }}>
                            {report.detailedAnalysis.cognitiveDimension.decisivenessTraitExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              {/* 情感维度 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }}></Box>
                      情感维度
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        主要情绪
                      </Typography>
                      <Box sx={{ mb: 2, mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.emotionalDimension.primaryEmotions.map((emotion, index) => (
                          <Chip 
                            key={index} 
                            label={emotion} 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </Box>                      {report.detailedAnalysis.emotionalDimension.primaryEmotionsExplanation && (
                        <Box sx={{ 
                          bgcolor: 'error.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(229,57,53,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'error.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'error.dark' }}>
                            {report.detailedAnalysis.emotionalDimension.primaryEmotionsExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        情绪调节能力
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.emotionalDimension.emotionalRegulation}
                      </Typography>                      {report.detailedAnalysis.emotionalDimension.emotionalRegulationExplanation && (
                        <Box sx={{ 
                          bgcolor: 'error.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(229,57,53,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'error.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'error.dark' }}>
                            {report.detailedAnalysis.emotionalDimension.emotionalRegulationExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        情绪表达方式
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.emotionalDimension.emotionalExpressiveness}
                      </Typography>                      {report.detailedAnalysis.emotionalDimension.emotionalExpressivenessExplanation && (
                        <Box sx={{ 
                          bgcolor: 'error.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(229,57,53,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'error.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'error.dark' }}>
                            {report.detailedAnalysis.emotionalDimension.emotionalExpressivenessExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              
              {/* 行为维度 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }}></Box>
                      行为维度
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        沟通风格
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.behavioralDimension.communicationStyle}
                      </Typography>                      {report.detailedAnalysis.behavioralDimension.communicationStyleExplanation && (
                        <Box sx={{ 
                          bgcolor: 'success.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(67,160,71,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'success.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'success.dark' }}>
                            {report.detailedAnalysis.behavioralDimension.communicationStyleExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        人际交往倾向
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.behavioralDimension.interpersonalApproach}
                      </Typography>                      {report.detailedAnalysis.behavioralDimension.interpersonalApproachExplanation && (
                        <Box sx={{ 
                          bgcolor: 'success.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(67,160,71,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'success.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'success.dark' }}>
                            {report.detailedAnalysis.behavioralDimension.interpersonalApproachExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.dark', borderBottom: '1px dashed #ccc', pb: 0.5 }}>
                        应对压力的行为模式
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 1, pl: 1 }}>
                        {report.detailedAnalysis.behavioralDimension.stressResponses}
                      </Typography>                      {report.detailedAnalysis.behavioralDimension.stressResponsesExplanation && (
                        <Box sx={{ 
                          bgcolor: 'success.50', 
                          p: 1, 
                          borderRadius: 1, 
                          fontSize: '0.9rem', 
                          mb: 2,
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.03)',
                          border: '1px solid rgba(67,160,71,0.1)'
                        }}>
                          <Typography variant="caption" sx={{ color: 'success.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                            <strong>专业解释:</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'success.dark' }}>
                            {report.detailedAnalysis.behavioralDimension.stressResponsesExplanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
          
          {/* 洞察与建议 */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightbulbIcon color="warning" />
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                洞察与建议
              </Typography>
            </Box>
              {/* 洞察与建议的专业说明 */}
            {report.insightsAndRecommendations.potentialStrengthsExplanation && (
              <Box 
                sx={{ 
                  mb: 3, 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderLeft: '3px solid #1976d2'
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }}></Box>
                  专业理论基础
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.insightsAndRecommendations.potentialStrengthsExplanation}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* 潜在优势 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light', height: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }}></Box>
                      潜在优势
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.potentialStrengths.map((strength, index) => (
                        <ListItem key={index} sx={{ 
                          bgcolor: 'rgba(255,255,255,0.9)', 
                          mb: 1, 
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{strength}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
              
              {/* 潜在挑战 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ bgcolor: 'error.light', height: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }}></Box>
                      潜在挑战
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.potentialChallenges.map((challenge, index) => (
                        <ListItem key={index} sx={{ 
                          bgcolor: 'rgba(255,255,255,0.9)', 
                          mb: 1, 
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{challenge}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>                    {report.insightsAndRecommendations.potentialChallengesExplanation && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 1, 
                        bgcolor: 'rgba(255,255,255,0.9)', 
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(229,57,53,0.15)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'error.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                          <strong>专业分析:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'error.dark', lineHeight: 1.5 }}>
                          {report.insightsAndRecommendations.potentialChallengesExplanation}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
              
              {/* 发展建议 */}
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: 'calc(33.333% - 16px)' } }}>
                <Card variant="outlined" sx={{ bgcolor: 'info.light', height: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }}></Box>
                      发展建议
                    </Typography>
                    <List dense>
                      {report.insightsAndRecommendations.developmentSuggestions.map((suggestion, index) => (
                        <ListItem key={index} sx={{ 
                          bgcolor: 'rgba(255,255,255,0.9)', 
                          mb: 1, 
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{suggestion}</Typography>} 
                          />
                        </ListItem>
                      ))}
                    </List>                    {report.insightsAndRecommendations.developmentSuggestionsExplanation && (
                      <Box sx={{ 
                        mt: 2, 
                        p: 1, 
                        bgcolor: 'rgba(255,255,255,0.9)', 
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(41,182,246,0.15)'
                      }}>
                        <Typography variant="caption" sx={{ color: 'info.dark', display: 'block', mb: 0.5, fontWeight: 'medium' }}>
                          <strong>专业建议:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'info.dark', lineHeight: 1.5 }}>
                          {report.insightsAndRecommendations.developmentSuggestionsExplanation}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
          
          {/* 免责声明 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WarningIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                免责声明
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {report.disclaimer}
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* 导出报告的Snackbar提示 */}
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>    </Container>
  );
}