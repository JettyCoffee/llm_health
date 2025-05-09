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
import { useTheme } from '@mui/material/styles';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="fixed" 
          elevation={1}
          sx={{ 
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
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
                fontWeight: 500
              }}
            >
              健康分析系统
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 主内容区域 */}
        <Box
          component="main"
          sx={{ 
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            mt: '64px', // 为固定的AppBar留出空间
            backgroundColor: theme.palette.background.default
          }}
        >
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
} 