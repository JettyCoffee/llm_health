'use client';

import { 
  AppBar, 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  Toolbar, 
  Typography,
  Box,
  IconButton,
  Avatar,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import theme from '../lib/theme';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerWidth = 240;

  const menuItems = [
    { text: '首页', icon: <HomeIcon /> },
    { text: '历史记录', icon: <HistoryIcon /> },
    { text: '个人资料', icon: <PersonIcon /> },
    { text: '设置', icon: <SettingsIcon /> },
    { text: '帮助', icon: <HelpOutlineIcon /> }
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            border: '2px solid white',
            backgroundColor: theme.palette.secondary.main
          }}
        >
          用户
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          用户名
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          healthuser@example.com
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: '0 24px 24px 0',
                mr: 1,
                pl: 3
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                mr: 1.5,
                bgcolor: 'primary.main',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              H
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 500,
                backgroundImage: 'linear-gradient(45deg, #1A73E8, #4285F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              多模态健康分析系统
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          {/* 侧边抽屉 */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={drawerOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: drawerWidth,
                  borderRadius: 0
                },
              }}
            >
              {drawer}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { 
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  mt: '64px', // AppBar 高度
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          )}

          {/* 主内容区域 */}
          <Box
            component="main"
            sx={{ 
              flexGrow: 1,
              p: { xs: 2, md: 3 },
              ml: { md: isMobile ? 0 : `${drawerWidth}px` },
              width: { sm: `calc(100% - ${isMobile ? 0 : drawerWidth}px)` },
              backgroundColor: theme.palette.background.default
            }}
          >
            <Container maxWidth="lg">
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
} 