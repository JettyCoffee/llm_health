'use client';

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

export default function Navbar() {
  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        {/* Logo和网站名称 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <HealthAndSafetyIcon 
            sx={{ 
              color: 'primary.main',
              fontSize: 32,
              mr: 2 
            }} 
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            健康助手
          </Typography>
        </Box>

        {/* 右侧按钮 */}
        <Box>
          <IconButton
            size="large"
            aria-label="account"
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="settings"
            color="inherit"
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 