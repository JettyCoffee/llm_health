import { NextResponse } from 'next/server';
import { getLatestAnalysis } from '@/lib/api/services/dataRetrieval';
import { successResponse, errorResponse } from '@/lib/api/utils';

/**
 * 获取最新分析结果的 API 端点
 */
export async function GET(request: Request) {
  try {
    const latestResult = await getLatestAnalysis();
    
    if (!latestResult) {
      return errorResponse('数据库中没有分析结果', 404);
    }
    
    return successResponse(latestResult);  } catch (error: any) {
    console.error('获取分析结果错误:', error);
    return errorResponse(`获取最新分析结果失败: ${error.message || '未知错误'}`, 500);
  }
}