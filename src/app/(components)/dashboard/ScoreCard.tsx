'use client';
import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  details: string;
  unit?: string; // 例如 bpm for heart rate, or % for certain scores
}

// 根据分数获取颜色，用于进度条等
const getScoreColor = (score: number, maxScore: number = 10): 'error' | 'warning' | 'info' | 'success' => {
  const percentage = (score / maxScore) * 100;
  if (percentage < 30) return 'error';
  if (percentage < 50) return 'warning';
  if (percentage < 70) return 'info';
  return 'success';
};

export default function ScoreCard({ title, score, maxScore = 10, details, unit }: ScoreCardProps) {
  const normalizedScore = Math.max(0, Math.min(score, maxScore)); // 确保分数在0到maxScore之间
  const percentage = (normalizedScore / maxScore) * 100;
  const scoreColor = getScoreColor(normalizedScore, maxScore);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Tooltip title={details} placement="top" arrow>
            <InfoOutlinedIcon color="action" sx={{ cursor: 'pointer' }} />
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h3" component="span" color={`${scoreColor}.main`} sx={{ fontWeight: 'bold' }}>
            {score.toFixed(1)} {/* 保留一位小数 */}
          </Typography>
          {unit ? (
             <Typography variant="h6" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                {unit}
             </Typography>
          ) : (
            <Typography variant="h6" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                / {maxScore}
            </Typography>
          )}
        </Box>
        <LinearProgress variant="determinate" value={percentage} color={scoreColor} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '3em' /* 保证至少2行文本高度 */}}>
          {details.length > 100 ? `${details.substring(0, 97)}...` : details}
        </Typography>
      </CardContent>
    </Card>
  );
} 