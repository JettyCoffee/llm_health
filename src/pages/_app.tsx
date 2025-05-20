import { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from '../lib/createEmotionCache';
import theme from '../theme/theme';
import dynamic from 'next/dynamic';
import ToolbarSpacer from '@/components/ToolbarSpacer';

// 创建客户端缓存，在客户端共享
const clientSideEmotionCache = createEmotionCache();

// 动态导入需要用到的组件
const NavbarWithNoSSR = dynamic(() => import('../components/Navbar'), { ssr: false });

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>MindGuide 心理助手</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavbarWithNoSSR />
        <ToolbarSpacer />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}
