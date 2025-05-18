'use client';

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, useScrollTrigger, Container, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HoverEffect, GradientBackground } from './AnimationComponents';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  
  // 监听滚动事件，添加滚动效果
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 20,
        duration: 0.8 
      }}
    >
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'linear-gradient(90deg, rgba(95, 90, 246, 0.05) 0%, rgba(161, 98, 232, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
            {/* Logo和网站名称 */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flex: 1,
                cursor: 'pointer',
              }}
              onClick={() => router.push('/')}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <PsychologyIcon 
                  sx={{ 
                    fontSize: 36,
                    mr: 2,
                    color: 'var(--primary)',
                    filter: 'drop-shadow(0px 2px 4px rgba(95, 90, 246, 0.3))',
                  }} 
                />
              </motion.div>
              
              <HoverEffect scale={1.02}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px',
                    textShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  MindGuide 心理助手
                </Typography>
              </HoverEffect>
            </Box>

            {/* 右侧按钮 */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="用户中心">
                <IconButton
                  size="large"
                  aria-label="account"
                  sx={{
                    color: 'var(--primary)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(95, 90, 246, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="设置">
                <IconButton
                  size="large"
                  aria-label="settings"
                  sx={{
                    color: 'var(--secondary)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(161, 98, 232, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <SettingsIcon />                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* 完全移除占位符，解决MuiBox-root mui-1w4qpt0空间问题 */}
    </motion.div>
  );
}