'use client';
import React from 'react';
import { Box, Typography, Grid, Paper, Divider, Chip } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import ScoreCard from './ScoreCard'; // 我们将创建一个评分卡片组件
import SectionTitle from '../common/SectionTitle'; // 通用章节标题
import type { AnalysisReport, LLMStage1Scores } from '@/types';

interface AnalysisDisplayProps {
  report: AnalysisReport;
}

// 辅助函数，将LLMStage1Scores转换为ScoreCard的props数组
const transformScoresToCards = (scores: LLMStage1Scores) => {
  const cardData = [];
  if (scores.facial_expression_assessment) {
    cardData.push({
      title: '面部表情评估',
      score: scores.facial_expression_assessment.score,
      details: scores.facial_expression_assessment.details,
      maxScore: 10,
    });
  }
  if (scores.vocal_characteristics_assessment) {
    cardData.push({
      title: '声音特征评估',
      score: scores.vocal_characteristics_assessment.score,
      details: scores.vocal_characteristics_assessment.details,
      maxScore: 10,
    });
  }
  if (scores.physiological_state_assessment) {
    cardData.push({
      title: '生理状态评估 (心率)',
      score: scores.physiological_state_assessment.score,
      details: scores.physiological_state_assessment.details,
      maxScore: 10,
    });
  }
  if (scores.estimated_stress_level) {
    cardData.push({
      title: `预估压力水平: ${scores.estimated_stress_level.category}`,
      score: scores.estimated_stress_level.score,
      details: `基于综合分析，当前压力等级为 ${scores.estimated_stress_level.category}。`,
      maxScore: 10, // 或者根据压力定义调整，例如10表示压力最低
    });
  }
  if (scores.overall_wellbeing_score) {
    cardData.push({
      title: '整体健康幸福感评分',
      score: scores.overall_wellbeing_score.score,
      details: scores.overall_wellbeing_score.trend_suggestion || '综合评估的整体状态。' ,
      maxScore: 10,
    });
  }
  return cardData;
};

export default function AnalysisDisplay({ report }: AnalysisDisplayProps) {
  const scoreCards = transformScoresToCards(report); // 从 report 中提取 LLMStage1Scores 部分

  // 自定义Markdown渲染器，使MUI Typography生效
  const markdownComponents = {
    h1: ({node, ...props}: any) => <Typography variant="h4" gutterBottom {...props} />,
    h2: ({node, ...props}: any) => <Typography variant="h5" gutterBottom {...props} />,
    h3: ({node, ...props}: any) => <Typography variant="h6" gutterBottom {...props} />,
    h4: ({node, ...props}: any) => <Typography variant="subtitle1" gutterBottom {...props} />,
    p: ({node, ...props}: any) => <Typography variant="body1" paragraph {...props} />,
    li: ({node, ...props}: any) => <li style={{ marginBottom: '8px' }}><Typography variant="body1" component="span" {...props} /></li>,
    // 可以添加更多自定义组件，如代码块、引用等
  };

  return (
    <Box>
      <SectionTitle title="第一阶段：多模态数据分析评分" />
      {scoreCards.length > 0 ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {scoreCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ScoreCard {...card} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{mb: 3}}>暂无评分数据。</Typography>
      )}
      
      <Divider sx={{ my: 4 }}>
        <Chip label="专家建议" />
      </Divider>

      <SectionTitle title="第二阶段：个性化健康报告与建议" />
      
      <Paper variant="outlined" sx={{ p: {xs: 2, md: 3}, mb: 3, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom sx={{color: 'primary.dark'}}>当前状态概览</Typography>
        <ReactMarkdown components={markdownComponents}>{report.current_status_summary || "暂无总结。"}</ReactMarkdown>
      </Paper>

      <Paper variant="outlined" sx={{ p: {xs: 2, md: 3}, mb: 3, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom sx={{color: 'primary.dark'}}>各项指标深度解读</Typography>
        <ReactMarkdown components={markdownComponents}>{report.detailed_analysis || "暂无详细分析。"}</ReactMarkdown>
      </Paper>

      <Paper variant="outlined" sx={{ p: {xs: 2, md: 3}, mb: 3, backgroundColor: 'primary.lighten(0.9)' }}>
        <Typography variant="h6" gutterBottom sx={{color: 'primary.dark'}}>个性化行动建议</Typography>
        <ReactMarkdown components={markdownComponents}>{report.personalized_advice || "暂无建议。"}</ReactMarkdown>
      </Paper>

      <Paper variant="outlined" sx={{ p: {xs: 2, md: 3}, mb: 3, backgroundColor: 'background.default' }}>
        <Typography variant="h6" gutterBottom sx={{color: 'primary.dark'}}>后续关注与提升方向</Typography>
        <ReactMarkdown components={markdownComponents}>{report.follow_up_points || "暂无后续关注点。"}</ReactMarkdown>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="textSecondary">
          报告生成时间: {new Date(report.timestamp).toLocaleString('zh-CN')}
        </Typography>
        {report.id && <Typography variant="caption" display="block" color="textSecondary">报告ID: {report.id}</Typography>}
      </Box>
    </Box>
  );
} 