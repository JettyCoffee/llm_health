/**
 * 路由兼容层
 * 
 * 这个文件作为 Pages Router 和 App Router 混合使用的过渡解决方案
 * 提供了路由导航和类型定义的统一接口
 */
import { useRouter as useNextRouter } from 'next/navigation';

// 扩展的路由接口，包含项目中使用的所有路由路径
export interface AppRoutes {
  home: '/';
  analysis: '/analysis';
  finalReport: (reportId: string) => `/final_report/${string}`;
}

// 路由路径常量定义
export const APP_ROUTES: AppRoutes = {
  home: '/',
  analysis: '/analysis',
  finalReport: (reportId: string) => `/final_report/${reportId}` as const,
};

// 包装函数，提供类型安全的 navigate 方法
export function useRouter() {
  const nextRouter = useNextRouter();
  
  return {
    ...nextRouter,
    // 扩展的导航方法，提供类型提示
    navigate: {
      toHome: () => nextRouter.push(APP_ROUTES.home),
      toAnalysis: () => nextRouter.push(APP_ROUTES.analysis),
      toFinalReport: (reportId: string) => 
        nextRouter.push(APP_ROUTES.finalReport(reportId)),
    },
  };
}

// 导出工具函数，便于获取页面标题
export function getPageTitle(path: string): string {
  if (path === APP_ROUTES.home) return '首页';
  if (path === APP_ROUTES.analysis) return '心理分析';
  if (path.startsWith('/final_report/')) return '分析报告';
  return '健康分析';
}
