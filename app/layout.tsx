import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppBar, Container, CssBaseline, ThemeProvider, Toolbar, Typography, createTheme } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '健康分析系统',
  description: '基于多模态LLM的健康分析系统',
};

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                健康分析系统
              </Typography>
            </Toolbar>
          </AppBar>
          <Container sx={{ mt: 4 }}>
            {children}
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
} 