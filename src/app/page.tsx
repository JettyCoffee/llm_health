'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Grid, Stack, Paper, Button } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const sections = [
    {
      title: '国家政策',
      content: '根据党的二十大报告中关于"推进健康中国建设"的战略指导，我们开发的心理大模型产品致力于关注人民心理健康。这一产品不仅符合国家战略需求，更具体响应了报告中对"重视心理健康和精神卫生"的强调，旨在为广大人民群众提供有效的心理健康支持，推动社会整体福祉的提升。',
      icon: <TimelineIcon fontSize="large" color="primary" />,
    },
    {
      title: '社会背景',
      content: '我国正处在社会转型期关键节点，随着工作和生活节奏加快，社会竞争加剧，国民心理压力大大增加，群众心理健康问题凸显，而民众对心理精神健康的关注度不断提高，因此急需更多关注心理健康的工具满足民众需求。',
      icon: <GroupsIcon fontSize="large" color="primary" />,
    },
    {
      title: '企业现状',
      content: '即使精神心理行业的融资规模持续扩大、市场规模日益扩增，我国当前高质量的心理健康服务仍存在供给相对不足、供需失衡，服务水平良莠不齐、服务质量有待提高的问题。',
      icon: <BarChartIcon fontSize="large" color="primary" />,
    },
  ];

  const userGroups = [
    {
      type: '学生',
      description: '课业压力重、对未来的焦虑、社交压力',
      icon: <SchoolIcon fontSize="large" color="secondary" />,
    },
    {
      type: '上班族',
      description: '工作压力大、职场挑战、生活负担',
      icon: <WorkIcon fontSize="large" color="secondary" />,
    },
    {
      type: '老年人',
      description: '孤独、自我怀疑、健康忧虑',
      icon: <ElderlyIcon fontSize="large" color="secondary" />,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* 顶部大图区域 */}
      <Box sx={{ 
        position: 'relative', 
        height: '70vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4
      }}>
        <Image
          src="/hero-image.jpg"
          alt="心理健康分析"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          priority
        />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: 2
        }}>
          <Typography variant="h2" component="h1" 
            sx={{ 
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' }
            }}>
            基于大模型的多模态心理智能分析
          </Typography>
          <Typography variant="h5" 
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}>
            利用AI技术，通过心率数据分析，为您提供专业的心理健康评估
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AnalyticsIcon />}
            onClick={() => router.push('/analysis')}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              borderRadius: 2,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            开始分析
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Stack spacing={8} sx={{ py: 4 }}>
          {/* 研究背景部分 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {sections.map((section, index) => (
              <Box 
                key={index} 
                sx={{ 
                  flexGrow: 1, 
                  flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' }
                }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {section.icon}
                      <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                        {section.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {section.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* 研究现状分析 */}
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PsychologyIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h4" component="h2">
                研究现状分析
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              随着近年来AI，ChatGPT，AIGC等研究领域的迅速发展，大语言模型（LLM）的巨大应用价值和无比广阔的发展方向逐渐显露，正被大量应用于信息处理、知识挖掘、情感分析、机器翻译、文本摘要、对话系统等自然语言处理任务。
            </Typography>
            <Typography variant="body1" paragraph>
              同时随着智能技术在医疗方面的普及与应用，患者对互联网与人工智能就医模式接受度提高。数字医疗在精神心理健康领域备受推崇，成为串联精神心理疾病病程管理的主线。
            </Typography>
          </Paper>

          {/* 用户画像 */}
          <Box>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
              <FavoriteIcon fontSize="large" color="error" sx={{ mr: 2 }} />
              适用人群
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {userGroups.map((group, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    flexGrow: 1, 
                    flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' }
                  }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {group.icon}
                        <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                          {group.type}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {group.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 研究目的 */}
          <Paper sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              研究目的
            </Typography>
            <Typography variant="body1">
              我们的心理大模型基于心率数据对人的心理状态进行分析。心率数据，相较于语言有时更能体现人的情绪情感，从而反映人的心理和精神健康状态。通过AI大模型心率分析技术，可以进行精神心理疾病的风险筛查。这种方法展示了AI在理解和评估心理健康领域的强大潜力，为预防心理疾病和早期诊断提供了一种新的、有效的工具。
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
