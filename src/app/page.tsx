'use client';

import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Grid, Stack, Paper, Button, Divider, useTheme, useMediaQuery, TextField } from '@mui/material';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonalizationIcon from '@mui/icons-material/Tune';
import SupportIcon from '@mui/icons-material/Support';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';
import { 
  AdvancedFadeIn,
  SpringAnimation,
  StaggeredChildren,
  HoverEffect,
  Card3D,
  RevealOnScroll,
  PulseAnimation,
  GradientBackground,
  TypewriterText,
  ParallaxSection,
  extendedAnimationStyles
} from '@/components/AnimationComponents';

export default function Home() {
  const router = useRouter();

  const sections = [
    {
      title: '心理关怀',
      content: '根据党的二十大报告中关于"推进健康中国建设"的战略指导，MindGuide心理助手致力于关注人民心理健康。我们不仅符合国家战略需求，更具体响应了报告中对"重视心理健康和精神卫生"的强调，旨在为广大人民群众提供专业、便捷的心理健康支持，推动社会整体福祉的提升。',
      icon: <TimelineIcon fontSize="large" color="primary" />,
    },
    {
      title: '社会需求',
      content: '现代社会高速发展带来的工作和生活节奏加快，社会竞争加剧，使国民心理压力大幅增加，心理健康问题日益凸显。同时，人们对心理健康的认知和重视程度不断提高，急需更专业、更个性化的心理健康服务和评估工具。',
      icon: <GroupsIcon fontSize="large" color="primary" />,
    },
    {
      title: '技术创新',
      content: '虽然心理健康服务市场规模不断扩大，但优质服务供给仍然不足。MindGuide心理助手通过融合人工智能与心理学专业知识，利用多模态数据分析，为用户提供科学、专业的心理健康评估和指导，填补传统心理服务的空白。',
      icon: <BarChartIcon fontSize="large" color="primary" />,
    },
  ];

  const userGroups = [
    {
      type: '青少年',
      description: '应对学业压力、身份认同、社交焦虑和情绪波动，培养积极心态和有效沟通技巧',
      icon: <SchoolIcon fontSize="large" color="secondary" />,
    },
    {
      type: '职场人士',
      description: '缓解工作压力、处理职场人际关系、平衡工作与生活，预防职业倦怠和焦虑抑郁',
      icon: <WorkIcon fontSize="large" color="secondary" />,
    },
    {
      type: '中老年人',
      description: '应对生活转变、调适空巢心理、保持社会联结，提升心理韧性和生活满意度',
      icon: <ElderlyIcon fontSize="large" color="secondary" />,
    },
  ];

  const advantages = [
    {
      title: '实时分析',
      description: '基于多模态数据的实时心理状态分析，精准把握情绪变化和潜在风险',
      icon: <AccessTimeIcon fontSize="large" color="info" />,
    },
    {
      title: '隐私保护',
      description: '严格的数据加密和隐私保护机制，确保用户个人信息和心理数据安全',
      icon: <SecurityIcon fontSize="large" color="info" />,
    },
    {
      title: '个性化服务',
      description: '根据用户特点和需求提供定制化心理评估和干预建议，提高服务针对性',
      icon: <PersonalizationIcon fontSize="large" color="info" />,
    },
    {
      title: '专业支持',
      description: '结合心理学专业知识和AI技术，提供科学、系统的心理健康解决方案',
      icon: <SupportIcon fontSize="large" color="info" />,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* 顶部大图区域 */}
      <Box sx={{ 
        position: 'relative', 
        height: '80vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
        mt: -1 // 减少与导航栏的间距
      }}>
        <ParallaxSection speed={0.5}>
          <Image
            src="/hero-image.jpg"
            alt="心理健康分析"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.8)',
            }}
            priority
          />
        </ParallaxSection>
        
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(95, 90, 246, 0.2) 0%, rgba(161, 98, 232, 0.3) 100%)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          px: 2,
          zIndex: 2
        }}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 60, 
              damping: 20,
              delay: 0.2
            }}
          >
            <Typography variant="h2" component="h1" 
              sx={{ 
                fontWeight: 'bold',
                mb: 3,
                fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
                textShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                letterSpacing: '1px'
              }}>
              <TypewriterText 
                text="基于大模型的多模态心理智能分析" 
                speed={0.04}
                cursor={false}
              />
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 60, 
              damping: 20,
              delay: 0.6
            }}
          >
            <Typography variant="h5" 
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                lineHeight: 1.5,
                textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
              您的贴心心理健康管家，多模态AI分析，专业心理评估与疏导
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              delay: 1
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)' 
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<AnalyticsIcon />}
              onClick={() => router.push('/analysis')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                borderRadius: '30px',
                background: 'linear-gradient(90deg, var(--primary) 30%, var(--secondary) 90%)',
                boxShadow: '0px 6px 15px rgba(95, 90, 246, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(90deg, var(--primary-dark) 30%, var(--primary) 90%)',
                  transform: 'translateY(-5px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              开始心理评估
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <PulseAnimation>
              <KeyboardArrowDownIcon 
                sx={{ 
                  fontSize: 40, 
                  color: 'white',
                  cursor: 'pointer',
                  filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.3))'
                }} 
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
              />
            </PulseAnimation>
          </motion.div>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Stack spacing={10} sx={{ py: 6 }}>
          {/* 研究背景部分 */}
          <Box sx={{ mb: 4 }}>
            <RevealOnScroll threshold={0.1}>
              <Typography 
                variant="h4" 
                component="h2" 
                align="center" 
                gutterBottom 
                sx={{ 
                  mb: 5, 
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                研究背景与价值
              </Typography>
            </RevealOnScroll>
            
            <StaggeredChildren delay={0.1} staggerDelay={0.15}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {sections.map((section, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      flexGrow: 1, 
                      flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' }
                    }}
                  >
                    <Card3D sensitivity={20}>
                      <Card sx={{ 
                        height: '100%',
                        minHeight: '320px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: '16px',
                        border: '1px solid rgba(161, 98, 232, 0.1)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)',
                        '&:hover': {
                          boxShadow: '0 15px 35px rgba(161, 98, 232, 0.2)',
                          transform: 'translateY(-5px)'
                        }
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 3,
                            pb: 2,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                          }}>
                            <Box sx={{
                              backgroundColor: 'rgba(95, 90, 246, 0.1)',
                              borderRadius: '12px',
                              p: 1.5,
                              mr: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              {section.icon}
                            </Box>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                fontWeight: 700,
                                color: 'var(--primary-dark)'
                              }}
                            >
                              {section.title}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body1" 
                            color="text.secondary"
                            sx={{ 
                              lineHeight: 1.7,
                              letterSpacing: '0.3px'
                            }}
                          >
                            {section.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Card3D>
                  </Box>
                ))}
              </Box>
            </StaggeredChildren>
          </Box>

          {/* 研究现状分析 */}
          <RevealOnScroll direction="up" distance={30}>
            <Paper sx={{ 
              p: { xs: 3, md: 5 },
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #f9f9ff 0%, #f0f3ff 100%)',
              boxShadow: '0 15px 35px rgba(95, 90, 246, 0.1)',
              border: '1px solid rgba(161, 98, 232, 0.1)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: '150px', md: '250px' },
                  height: { xs: '150px', md: '250px' },
                  background: 'radial-gradient(circle, rgba(161, 98, 232, 0.1) 0%, rgba(255,255,255,0) 70%)',
                  borderRadius: '0 0 0 100%',
                  zIndex: 0
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4, 
                position: 'relative',
                zIndex: 1 
              }}>
                <SpringAnimation 
                  from={{ scale: 0.8, opacity: 0 }}
                  to={{ scale: 1, opacity: 1 }}
                  stiffness={100}
                  damping={10}
                >
                  <Box sx={{
                    backgroundColor: 'rgba(95, 90, 246, 0.1)',
                    borderRadius: '16px',
                    p: 2,
                    mr: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 5px 15px rgba(95, 90, 246, 0.15)'
                  }}>
                    <PsychologyIcon 
                      fontSize="large" 
                      sx={{ 
                        color: 'var(--primary)',
                        fontSize: { xs: 36, md: 44 } 
                      }} 
                    />
                  </Box>
                </SpringAnimation>
                
                <Typography 
                  variant="h4" 
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  研究现状与技术方案
                </Typography>
              </Box>
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <AdvancedFadeIn delay={0.2} duration={0.8}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontSize: '1.05rem', 
                      lineHeight: 1.8,
                      letterSpacing: '0.3px',
                      color: 'var(--foreground)'
                    }}
                  >
                    随着近年来AI技术与大模型的快速发展，特别是ChatGPT等大语言模型的广泛应用，人工智能在心理健康领域展现出巨大潜力。MindGuide心理助手利用多模态数据分析技术，结合专业心理学知识，通过分析用户的语言表达、心率变化等生理信号，准确评估心理状态并提供个性化心理支持。
                  </Typography>
                </AdvancedFadeIn>
                
                <AdvancedFadeIn delay={0.4} duration={0.8}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontSize: '1.05rem', 
                      lineHeight: 1.8,
                      letterSpacing: '0.3px',
                      color: 'var(--foreground)'
                    }}
                  >
                    我们的技术方案将传统心理健康服务与智能技术深度融合，实现了从被动应对到主动预防的转变。随着数字医疗在心理健康领域的应用日益广泛，MindGuide心理助手为用户提供及时、精准、隐私保护的心理分析和支持服务，有效填补了传统心理咨询资源不足的空白。
                  </Typography>
                </AdvancedFadeIn>
              </Box>
            </Paper>
          </RevealOnScroll>

          {/* 用户画像 */}
          <Box sx={{ my: 2 }}>
            <RevealOnScroll direction="up" threshold={0.1}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    mb: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <PulseAnimation duration={3}>
                    <FavoriteIcon 
                      fontSize="large" 
                      sx={{ 
                        mr: 2, 
                        color: 'var(--accent)',
                        filter: 'drop-shadow(0px 2px 4px rgba(240, 147, 176, 0.3))'
                      }} 
                    />
                  </PulseAnimation>
                  服务人群
                </Typography>
                <Typography variant="body1" sx={{ 
                  maxWidth: '700px', 
                  mx: 'auto',
                  fontSize: '1.1rem',
                  color: 'text.secondary',
                  mb: 5
                }}>
                  MindGuide心理助手为不同人群提供个性化心理健康服务
                </Typography>
              </Box>
            </RevealOnScroll>
            
            <StaggeredChildren delay={0.2} staggerDelay={0.15}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 5,
                justifyContent: 'center'
              }}>
                {userGroups.map((group, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      flexGrow: 0, 
                      flexBasis: { xs: '100%', sm: '45%', md: '30%' },
                      maxWidth: { xs: '100%', sm: '45%', md: '30%' }
                    }}
                  >
                    <HoverEffect scale={1.05} shadow={true}>
                      <Card sx={{ 
                        height: '100%',
                        minHeight: '200px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(161, 98, 232, 0.1)',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: '120px',
                          height: '120px',
                          background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(255,255,255,0) 70%)',
                          borderRadius: '50%',
                          zIndex: 0
                        }} />
                        
                        <CardContent sx={{ p: 4, zIndex: 1, position: 'relative' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 3,
                            pb: 2,
                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                          }}>
                            <Box sx={{
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              borderRadius: '12px',
                              p: 1.5,
                              mr: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              {group.icon}
                            </Box>
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              sx={{ 
                                fontWeight: 700,
                                color: 'var(--secondary)'
                              }}
                            >
                              {group.type}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '1rem',
                              lineHeight: 1.7
                            }}
                          >
                            {group.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </HoverEffect>
                  </Box>
                ))}
              </Box>
            </StaggeredChildren>
          </Box>

          {/* 研究目的 */}
          <RevealOnScroll direction="up" threshold={0.2} distance={40}>
            <GradientBackground
              colors={['var(--primary)', 'var(--secondary)']}
              duration={12}
            >
              <Paper sx={{ 
                p: { xs: 4, md: 6 }, 
                bgcolor: 'transparent',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2), transparent 70%)',
                  zIndex: 0
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      mb: 4,
                      textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <AnalyticsIcon 
                      sx={{ 
                        mr: 2, 
                        fontSize: 36,
                        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))'
                      }} 
                    />
                    研究目标
                  </Typography>
                  
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: '1.1rem',
                      lineHeight: 1.8,
                      letterSpacing: '0.3px',
                      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    MindGuide心理助手利用先进的多模态AI技术分析用户的心率数据、语音表达和文本反馈，全面评估心理状态。我们的系统能够识别情绪波动、压力水平和潜在的心理健康风险，提供实时反馈和个性化建议。相比传统单一的问卷评估方法，我们的多维度分析更加客观、全面，为用户提供更精准的心理健康画像和针对性的改善方案。
                  </Typography>
                  
                  <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                    <SpringAnimation delay={0.3}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push('/analysis')}
                        sx={{
                          bgcolor: 'white',
                          color: 'var(--primary)',
                          px: 4,
                          py: 1.5,
                          borderRadius: '30px',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)'
                          }
                        }}
                      >
                        了解心理服务
                      </Button>
                    </SpringAnimation>
                  </Box>
                </Box>
              </Paper>
            </GradientBackground>
          </RevealOnScroll>

          {/* 服务优势 */}
          <Box sx={{ my: 6 }}>
            <RevealOnScroll threshold={0.1}>
              <Typography 
                variant="h4" 
                component="h2" 
                align="center" 
                gutterBottom 
                sx={{ 
                  mb: 5, 
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                服务优势
              </Typography>
            </RevealOnScroll>
            
            <Grid container spacing={4} alignItems="stretch">
              {advantages.map((advantage, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <RevealOnScroll threshold={0.1} delay={index * 0.1}>
                    <HoverEffect scale={1.03} shadow={true}>
                      <Card sx={{ 
                        height: '100%',
                        minHeight: '280px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(161, 98, 232, 0.1)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 15px 30px rgba(161, 98, 232, 0.15)',
                        },
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <CardContent sx={{ 
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          height: '100%'
                        }}>
                          <Box sx={{
                            backgroundColor: 'rgba(95, 90, 246, 0.08)',
                            borderRadius: '50%',
                            p: 2.5,
                            mb: 3,
                            mt: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 80,
                            height: 80
                          }}>
                            {React.cloneElement(advantage.icon, { 
                              fontSize: "large", 
                              style: { fontSize: 36 } 
                            })}
                          </Box>
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 700,
                              mb: 2,
                              color: 'var(--primary-dark)'
                            }}
                          >
                            {advantage.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              lineHeight: 1.7,
                              letterSpacing: '0.3px',
                              flex: '1 1 auto'
                            }}
                          >
                            {advantage.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </HoverEffect>
                  </RevealOnScroll>
                </Grid>
              ))}
            </Grid>
          </Box>
          
        </Stack>
      </Container>

      {/* 联系我们 */}
      <Box 
        sx={{ 
          bgcolor: 'rgba(95, 90, 246, 0.02)',
          py: 10,
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <RevealOnScroll threshold={0.1}>
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              sx={{ 
                mb: 6, 
                fontWeight: 700,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              联系我们
            </Typography>
          </RevealOnScroll>
          
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 5,
              alignItems: 'center'
            }}
          >
            <Paper 
              sx={{ 
                flex: 1,
                p: 4,
                borderRadius: '20px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                border: '1px solid rgba(161, 98, 232, 0.1)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)',
                height: '100%',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              <RevealOnScroll direction="left" threshold={0.1}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: 'var(--primary-dark)'
                  }}
                >
                  MindGuide心理助手
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlineIcon sx={{ color: 'var(--primary)', mr: 2 }} />
                    <Typography variant="body1">contact@mindguide.com</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalPhoneIcon sx={{ color: 'var(--primary)', mr: 2 }} />
                    <Typography variant="body1">400-800-9876</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ color: 'var(--primary)', mr: 2 }} />
                    <Typography variant="body1">上海市闵行区东川路800号</Typography>
                  </Box>
                </Box>
              </RevealOnScroll>
            </Paper>
            
            <Paper 
              sx={{ 
                flex: 1,
                p: 4,
                borderRadius: '20px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                border: '1px solid rgba(161, 98, 232, 0.1)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 255, 0.9) 100%)',
                height: '100%',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              <RevealOnScroll direction="right" threshold={0.1}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: 'var(--primary-dark)'
                  }}
                >
                  留言咨询
                </Typography>
                
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="您的姓名" 
                    variant="outlined" 
                    fullWidth 
                    size="small"
                    required
                  />
                  <TextField 
                    label="联系方式" 
                    variant="outlined" 
                    fullWidth 
                    size="small"
                    required
                  />
                  <TextField 
                    label="留言内容" 
                    variant="outlined" 
                    fullWidth 
                    multiline
                    rows={3}
                    required
                  />
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    sx={{
                      mt: 1,
                      alignSelf: 'flex-end',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      boxShadow: '0 4px 10px rgba(95, 90, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, var(--primary-dark) 0%, var(--primary) 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(95, 90, 246, 0.4)',
                      }
                    }}
                  >
                    提交
                  </Button>
                </Box>
              </RevealOnScroll>
            </Paper>
          </Box>
        </Container>
      </Box>
      
      {/* 底部装饰元素 */}
      <Box 
        sx={{ 
          height: '100px', 
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          mt: 0 // 修改为0，因为已经有了足够的间距
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(to bottom, transparent, rgba(95, 90, 246, 0.05))',
            zIndex: 0
          }}
        />
      </Box>
    </Box>
  );
}
