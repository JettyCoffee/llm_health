'use client';

import { createTheme, alpha } from '@mui/material/styles';
import { zhCN } from '@mui/material/locale';

// 创建符合 Material Design 3 设计规范的主题
const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1A73E8',
        light: '#4285F4',
        dark: '#0D47A1',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#E8710A',
        light: '#F9AB40',
        dark: '#BF360C',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#D93025',
        light: '#F28B82',
        dark: '#B31412',
      },
      warning: {
        main: '#F9AB00',
        light: '#FDD663',
        dark: '#F29900',
      },
      info: {
        main: '#1A73E8',
        light: '#A8DAB5',
        dark: '#0D652D',
      },
      success: {
        main: '#1E8E3E',
        light: '#81C995',
        dark: '#0D652D',
      },
      background: {
        default: '#F8F9FA',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#202124',
        secondary: '#5F6368',
        disabled: '#80868B',
      },
      divider: '#DADCE0',
      grey: {
        50: '#F8F9FA',
        100: '#F1F3F4',
        200: '#E8EAED',
        300: '#DADCE0',
        400: '#BDC1C6',
        500: '#9AA0A6',
        600: '#80868B',
        700: '#5F6368',
        800: '#3C4043',
        900: '#202124',
      },
    },
    typography: {
      fontFamily: [
        'Google Sans',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 400,
        letterSpacing: '-0.5px',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '0px',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 400,
        letterSpacing: '0.25px',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '0px',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        letterSpacing: '0.15px',
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 500,
        letterSpacing: '0.15px',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        letterSpacing: '0.15px',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.1px',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        letterSpacing: '0.5px',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        letterSpacing: '0.25px',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.5px',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        letterSpacing: '0.4px',
      },
      overline: {
        fontSize: '0.625rem',
        fontWeight: 400,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '8px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 1px 2px 0px rgba(60, 64, 67, 0.3), 0px 1px 3px 1px rgba(60, 64, 67, 0.15)',
            },
          },
          contained: {
            boxShadow: '0px 1px 2px 0px rgba(60, 64, 67, 0.3), 0px 1px 3px 1px rgba(60, 64, 67, 0.15)',
          },
          containedPrimary: {
            background: 'linear-gradient(45deg, #1A73E8 30%, #4285F4 90%)',
          },
          outlined: {
            borderWidth: '1px',
            '&:hover': {
              borderWidth: '1px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0px 1px 2px 0px rgba(60, 64, 67, 0.3), 0px 2px 6px 2px rgba(60, 64, 67, 0.15)',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 24,
            '&:last-child': {
              paddingBottom: 24,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
          elevation1: {
            boxShadow: '0px 1px 3px 0px rgba(60, 64, 67, 0.3), 0px 4px 8px 3px rgba(60, 64, 67, 0.15)',
          },
          elevation2: {
            boxShadow: '0px 1px 2px 0px rgba(60, 64, 67, 0.3), 0px 2px 6px 2px rgba(60, 64, 67, 0.15)',
          },
          elevation3: {
            boxShadow: '0px 1px 3px 0px rgba(60, 64, 67, 0.3), 0px 4px 8px 3px rgba(60, 64, 67, 0.15)',
          },
          elevation4: {
            boxShadow: '0px 2px 3px 0px rgba(60, 64, 67, 0.3), 0px 6px 10px 4px rgba(60, 64, 67, 0.15)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.MuiChip-outlined': {
              borderWidth: 1,
            },
          },
          label: {
            paddingLeft: 12,
            paddingRight: 12,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 100,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: 0,
              '&:first-of-type': {
                marginTop: 0,
              },
              '&:last-of-type': {
                marginBottom: 0,
              },
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            padding: '0 16px',
            minHeight: 56,
            '&.Mui-expanded': {
              minHeight: 56,
            },
          },
          content: {
            '&.Mui-expanded': {
              margin: '12px 0',
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: alpha('#1A73E8', 0.12),
              '&:hover': {
                backgroundColor: alpha('#1A73E8', 0.16),
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 8,
          },
        },
      },
    },
  },
  zhCN // 添加中文本地化
);

export default theme; 