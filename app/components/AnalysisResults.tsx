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
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  const theme = useTheme();

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
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main,
      },
    ],
  };

  const averageScore = Math.round(
    (results.score.facialAnalysis.score +
    results.score.voiceAnalysis.score +
    results.score.heartRateAnalysis.score +
    results.score.overallHealth.score) / 4
  );

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={3}>
        {/* 评分卡片 */}
        <Grid item xs={12} md={5}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                pb: 1,
                mb: 3
              }}>
                健康评分总览
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                flexDirection: 'column',
                my: 2 
              }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  {averageScore}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  总体健康评分
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 400, mt: 3 }}>
                  <Radar 
                    data={radarChartData} 
                    options={{
                      scales: {
                        r: {
                          min: 0,
                          max: 100,
                          ticks: {
                            stepSize: 20,
                            color: theme.palette.text.secondary,
                          },
                          grid: {
                            color: theme.palette.divider,
                          },
                          angleLines: {
                            color: theme.palette.divider,
                          },
                          pointLabels: {
                            color: theme.palette.text.primary,
                            font: {
                              size: 12
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  详细评分
                </Typography>
                
                {[
                  { label: '面部分析', score: results.score.facialAnalysis.score },
                  { label: '声音分析', score: results.score.voiceAnalysis.score },
                  { label: '心率分析', score: results.score.heartRateAnalysis.score },
                  { label: '整体健康', score: results.score.overallHealth.score }
                ].map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.score}/100
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={item.score} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: theme.palette.primary.main,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 详细分析结果 */}
        <Grid item xs={12} md={7}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                pb: 1,
                mb: 3
              }}>
                详细分析结果
              </Typography>
              
              {[
                { 
                  title: '面部分析', 
                  details: results.score.facialAnalysis.details,
                  concerns: results.score.facialAnalysis.concerns
                },
                { 
                  title: '声音分析', 
                  details: results.score.voiceAnalysis.details,
                  concerns: results.score.voiceAnalysis.concerns
                },
                { 
                  title: '心率分析', 
                  details: results.score.heartRateAnalysis.details,
                  concerns: results.score.heartRateAnalysis.concerns
                }
              ].map((section, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {section.details}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {section.concerns.map((concern, idx) => (
                      <Chip 
                        key={idx} 
                        label={concern} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{
                          borderRadius: '4px',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    ))}
                  </Box>
                  {index < 2 && <Divider sx={{ my: 3 }} />}
                </Box>
              ))}

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  pb: 1,
                  mb: 3
                }}>
                  健康建议
                </Typography>
                <Box 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    p: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    '& .markdown-body': {
                      fontFamily: theme.typography.fontFamily,
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: theme.palette.primary.main,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        paddingBottom: 1,
                        marginBottom: 2
                      },
                      '& p': {
                        marginBottom: 2,
                        lineHeight: 1.7
                      },
                      '& ul, & ol': {
                        paddingLeft: 3,
                        marginBottom: 2
                      },
                      '& li': {
                        marginBottom: 1
                      },
                      '& a': {
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      },
                      '& blockquote': {
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        marginLeft: 0,
                        paddingLeft: 2,
                        paddingY: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      '& code': {
                        backgroundColor: theme.palette.grey[100],
                        padding: '2px 4px',
                        borderRadius: 1,
                        fontSize: '0.9em'
                      }
                    }
                  }}
                >
                  <div className="markdown-body">
                    <ReactMarkdown 
                      children={results.advice}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    />
                  </div>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 