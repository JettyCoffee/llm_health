'use client';

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, useScrollTrigger, Container, Tooltip, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HoverEffect, GradientBackground } from './AnimationComponents';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // 检查当前路径是否匹配给定路径
  const isPathActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname && pathname.startsWith(path)) return true;
    return false;
  };
  
  // 处理历史记录导航
  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const lastReportUrl = Cookies.get('lastReportUrl');
    if (lastReportUrl) {
      router.push(lastReportUrl);
    } else {
      // 如果没有历史记录，可以导航到分析页面
      router.push('/analysis');
    }
  };

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
                </Typography>              </HoverEffect>
            </Box>            {/* 导航按钮 */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              justifyContent: 'center', 
              flexGrow: 1,
              mx: 2,
              gap: { md: 1, lg: 2 }
            }}>
              <HoverEffect>
                <Button
                  component={Link}
                  href="/"
                  startIcon={<HomeIcon />}
                  sx={{
                    color: isPathActive('/') ? 'var(--primary)' : 'text.primary',
                    fontWeight: isPathActive('/') ? 700 : 500,
                    borderRadius: 2,
                    px: { md: 1, lg: 2 },
                    '&:hover': {
                      background: 'rgba(95, 90, 246, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::after': isPathActive('/') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: '10px 10px 0 0',
                    } : {},
                  }}
                >
                  首页
                </Button>
              </HoverEffect>

              <HoverEffect>
                <Button
                  component={Link}
                  href="/analysis"
                  startIcon={<AnalyticsIcon />}
                  sx={{
                    color: isPathActive('/analysis') ? 'var(--primary)' : 'text.primary',
                    fontWeight: isPathActive('/analysis') ? 700 : 500,
                    borderRadius: 2,
                    px: { md: 1, lg: 2 },
                    '&:hover': {
                      background: 'rgba(95, 90, 246, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::after': isPathActive('/analysis') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: '10px 10px 0 0',
                    } : {},
                  }}
                >
                  心理分析
                </Button>
              </HoverEffect>              <HoverEffect>
                <Button
                  component="a"
                  href="http://101.132.251.146:5001/"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<SupportAgentIcon />}
                  sx={{
                    color: isPathActive('/consult') ? 'var(--primary)' : 'text.primary',
                    fontWeight: isPathActive('/consult') ? 700 : 500,
                    borderRadius: 2,
                    px: { md: 1, lg: 2 },
                    '&:hover': {
                      background: 'rgba(95, 90, 246, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::after': isPathActive('/consult') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: '10px 10px 0 0',
                    } : {},
                  }}
                >
                  心理咨询
                </Button>
              </HoverEffect><HoverEffect>
                <Button
                  onClick={handleHistoryClick}
                  startIcon={<HistoryIcon />}
                  sx={{
                    color: isPathActive('/final_report') ? 'var(--primary)' : 'text.primary',
                    fontWeight: isPathActive('/final_report') ? 700 : 500,
                    borderRadius: 2,
                    px: { md: 1, lg: 2 },
                    '&:hover': {
                      background: 'rgba(95, 90, 246, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::after': isPathActive('/final_report') ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: '3px',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: '10px 10px 0 0',
                    } : {},
                  }}
                >
                  历史记录
                </Button>
              </HoverEffect>
            </Box>            {/* 右侧按钮 */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* 移动设备菜单按钮 */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <IconButton 
                  size="large"
                  onClick={toggleMobileMenu}
                  sx={{
                    color: 'var(--primary)',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>

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
        </Container>      </AppBar>
      
      {/* 完全移除占位符，解决MuiBox-root mui-1w4qpt0空间问题 */}

      {/* 移动端抽屉菜单 */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            borderRadius: '12px 0 0 12px',
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 245, 255, 0.95))',
            boxShadow: '0 8px 32px rgba(95, 90, 246, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon 
              sx={{ 
                fontSize: 28,
                mr: 1,
                color: 'var(--primary)',
              }} 
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              心理助手
            </Typography>
          </Box>
          
          <IconButton onClick={toggleMobileMenu} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem 
            component={Link} 
            href="/"
            onClick={toggleMobileMenu}
            sx={{ 
              backgroundColor: isPathActive('/') ? 'rgba(95, 90, 246, 0.1)' : 'transparent',
              borderRight: isPathActive('/') ? '4px solid var(--primary)' : 'none',
              mb: 1,
              py: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(95, 90, 246, 0.05)',
              },
            }}
          >
            <ListItemIcon>
              <HomeIcon color={isPathActive('/') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="首页" 
              primaryTypographyProps={{ 
                fontWeight: isPathActive('/') ? 700 : 500,
                color: isPathActive('/') ? 'var(--primary)' : 'inherit'
              }}
            />
          </ListItem>
          
          <ListItem 
            component={Link} 
            href="/analysis"
            onClick={toggleMobileMenu}
            sx={{ 
              backgroundColor: isPathActive('/analysis') ? 'rgba(95, 90, 246, 0.1)' : 'transparent',
              borderRight: isPathActive('/analysis') ? '4px solid var(--primary)' : 'none',
              mb: 1,
              py: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(95, 90, 246, 0.05)',
              },
            }}
          >
            <ListItemIcon>
              <AnalyticsIcon color={isPathActive('/analysis') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="心理分析" 
              primaryTypographyProps={{ 
                fontWeight: isPathActive('/analysis') ? 700 : 500,
                color: isPathActive('/analysis') ? 'var(--primary)' : 'inherit'
              }}
            />
          </ListItem>
          
          <ListItem 
            component={Link} 
            href="/consult"
            onClick={toggleMobileMenu}
            sx={{ 
              backgroundColor: isPathActive('/consult') ? 'rgba(95, 90, 246, 0.1)' : 'transparent',
              borderRight: isPathActive('/consult') ? '4px solid var(--primary)' : 'none',
              mb: 1,
              py: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(95, 90, 246, 0.05)',
              },
            }}
          >
            <ListItemIcon>
              <SupportAgentIcon color={isPathActive('/consult') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="心理咨询" 
              primaryTypographyProps={{ 
                fontWeight: isPathActive('/consult') ? 700 : 500,
                color: isPathActive('/consult') ? 'var(--primary)' : 'inherit'
              }}
            />
          </ListItem>
            <ListItem 
            onClick={(e) => {
              toggleMobileMenu();
              handleHistoryClick(e);
            }}
            sx={{ 
              backgroundColor: isPathActive('/final_report') ? 'rgba(95, 90, 246, 0.1)' : 'transparent',
              borderRight: isPathActive('/final_report') ? '4px solid var(--primary)' : 'none',
              mb: 1,
              py: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(95, 90, 246, 0.05)',
              },
            }}
          >
            <ListItemIcon>
              <HistoryIcon color={isPathActive('/final_report') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="历史记录" 
              primaryTypographyProps={{ 
                fontWeight: isPathActive('/final_report') ? 700 : 500,
                color: isPathActive('/final_report') ? 'var(--primary)' : 'inherit'
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </motion.div>
  );
}