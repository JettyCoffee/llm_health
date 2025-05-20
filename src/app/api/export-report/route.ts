import { NextResponse } from 'next/server';
import { prepareReportExport } from '@/lib/api/services/dataRetrieval';
import { successResponse, errorResponse } from '@/lib/api/utils';

/**
 * 导出报告数据的 API 端点
 * 用于提供报告数据以便前端生成PDF或其他格式导出
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    
    if (!reportId) {
      return errorResponse('缺少报告ID', 400);
    }
    
    // 从数据库获取报告数据
    const reportData = await prepareReportExport(reportId);
    
    if (!reportData) {
      return errorResponse('找不到报告数据', 404);
    }
    
    // 返回处理后的报告数据
    return successResponse({
      reportId: reportData.reportId,
      analysisResult: reportData.analysisResult,
      psychologicalReport: reportData.psychologicalReport,
      createdAt: reportData.createdAt
    });
  } catch (error) {    console.error('导出报告错误:', error);
    return errorResponse('导出报告失败', 500);
  }
}
