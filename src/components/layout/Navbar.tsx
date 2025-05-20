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
import { HoverEffect, GradientBackground } from '../ui/AnimationComponents';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // 监听滚动事件，添加滚动效果
  useEffect(() => {
    const handleScroll = () => {
      // 页面内容太少时不改变导航栏样式
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      // 判断内容是否足够触发滚动
      if (documentHeight <= viewportHeight) {
        setScrolled(false);
        return;
      }
      
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 初始加载时也执行一次判断
    handleScroll();
    
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
    >      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 2}
        sx={{
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer + 1, // 确保导航栏在其他元素之上
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
                cursor: 'pointer'
              }}
              onClick={() => router.push('/')}
            >
              <PsychologyIcon 
                color="primary" 
                sx={{ 
                  fontSize: { xs: 32, md: 40 },
                  mr: 1.5,
                  fill: 'url(#gradient)'
                }} 
              />
              <svg width="0" height="0">
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop stopColor="var(--primary)" offset="0%" />
                  <stop stopColor="var(--secondary)" offset="100%" />
                </linearGradient>
              </svg>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 700,
                  fontSize: { sm: '1.25rem', md: '1.5rem' },
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0px 0px 1px rgba(0,0,0,0.05)'
                }}
              >
                MindGuide
              </Typography>
            </Box>

            {/* 桌面导航链接 */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button
                color={isPathActive('/') ? 'primary' : 'inherit'}
                sx={{ 
                  borderRadius: 'var(--radius)',
                  fontWeight: isPathActive('/') ? 600 : 400,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': isPathActive('/') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px 2px 0 0'
                  } : {}
                }}
                startIcon={<HomeIcon />}
                onClick={() => router.push('/')}
              >
                首页
              </Button>
              
              <Button
                color={isPathActive('/analysis') ? 'primary' : 'inherit'}
                sx={{ 
                  borderRadius: 'var(--radius)',
                  fontWeight: isPathActive('/analysis') ? 600 : 400,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': isPathActive('/analysis') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px 2px 0 0'
                  } : {}
                }}
                startIcon={<AnalyticsIcon />}
                onClick={() => router.push('/analysis')}
              >
                心理分析
              </Button>
              
              <Button
                color={isPathActive('/final_report') ? 'primary' : 'inherit'}
                sx={{ 
                  borderRadius: 'var(--radius)',
                  fontWeight: isPathActive('/final_report') ? 600 : 400,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': isPathActive('/final_report') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px 2px 0 0'
                  } : {}
                }}
                startIcon={<HistoryIcon />}
                onClick={handleHistoryClick}
              >
                报告历史
              </Button>
            </Box>

            {/* 用户操作 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="联系客服" arrow>
                <IconButton color="default" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <SupportAgentIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="设置" arrow>
                <IconButton color="default" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 1, mr: { xs: 0, sm: 1 } }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AccountCircleIcon />}
                  sx={{ 
                    borderRadius: 'var(--radius)',
                    borderWidth: '2px',
                    textTransform: 'none',
                    '&:hover': {
                      borderWidth: '2px',
                    }
                  }}
                >
                  登录
                </Button>
              </Box>

              {/* 移动端菜单按钮 */}
              <IconButton
                edge="end"
                color="primary"
                aria-label="menu"
                onClick={toggleMobileMenu}
                sx={{ display: { md: 'none' } }}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 移动端菜单抽屉 */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: '300px',
            pt: 2,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PsychologyIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MindGuide
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <List>
            <ListItem 
              component="div"
              onClick={() => {
                router.push('/');
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 'var(--radius)',
                mb: 1,
                bgcolor: isPathActive('/') ? 'rgba(95, 90, 246, 0.08)' : 'transparent'
              }}
            >
              <ListItemIcon>
                <HomeIcon color={isPathActive('/') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="首页" 
                primaryTypographyProps={{
                  fontWeight: isPathActive('/') ? 600 : 400
                }}
              />
            </ListItem>
              <ListItem 
              component="div" 
              onClick={() => {
                router.push('/analysis');
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 'var(--radius)',
                mb: 1,
                bgcolor: isPathActive('/analysis') ? 'rgba(95, 90, 246, 0.08)' : 'transparent'
              }}
            >
              <ListItemIcon>
                <AnalyticsIcon color={isPathActive('/analysis') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="心理分析" 
                primaryTypographyProps={{
                  fontWeight: isPathActive('/analysis') ? 600 : 400
                }}
              />
            </ListItem>
              <ListItem 
              component="div"
              onClick={(e) => {
                handleHistoryClick(e as React.MouseEvent);
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 'var(--radius)',
                mb: 1,
                bgcolor: isPathActive('/final_report') ? 'rgba(95, 90, 246, 0.08)' : 'transparent'
              }}
            >
              <ListItemIcon>
                <HistoryIcon color={isPathActive('/final_report') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="报告历史" 
                primaryTypographyProps={{
                  fontWeight: isPathActive('/final_report') ? 600 : 400
                }}
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <List>            <ListItem component="div">
              <ListItemIcon>
                <SupportAgentIcon />
              </ListItemIcon>
              <ListItemText primary="联系客服" />
            </ListItem>
            
            <ListItem component="div">
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="设置" />
            </ListItem>
          </List>
          
          <Box sx={{ p: 2, mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              sx={{ 
                borderRadius: 'var(--radius)',
                py: 1
              }}
              startIcon={<AccountCircleIcon />}
            >
              登录/注册
            </Button>
          </Box>
        </Box>
      </Drawer>
    </motion.div>
  );
}
