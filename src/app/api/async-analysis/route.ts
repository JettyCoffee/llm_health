/**
 * 异步分析 API 端点
 * 
 * 这个 API 实现了一个分两步的异步模式来避免 Vercel 的 60 秒超时限制:
 * 1. 客户端上传视频，API 创建任务并立即返回任务 ID
 * 2. 客户端使用任务 ID 轮询任务状态，直到分析完成
 */

import { NextRequest } from 'next/server';
import { 
  createAnalysisTask, 
  getTaskStatus, 
  startBackgroundAnalysis 
} from '@/lib/api/services/progressiveAnalysis';
import { successResponse, errorResponse, convertVideoToBase64 } from '@/lib/api/utils';

// 创建异步分析任务 (POST /api/async-analysis)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const userFeedback = formData.get('userFeedback') as string || '';
    
    if (!video) {
      return errorResponse('没有接收到视频数据', 400);
    }
    
    // 创建任务
    const { taskId } = await createAnalysisTask();
    
    // 转换视频 (这部分不能太久，否则仍会超时)
    const videoBase64 = await convertVideoToBase64(video);
    
    // 启动后台分析任务 (非阻塞)
    startBackgroundAnalysis(taskId, videoBase64, userFeedback);
    
    // 立即返回任务ID
    return successResponse({ 
      taskId,
      message: '分析任务已创建，请使用任务ID查询进度'
    });
  } catch (error: any) {
    console.error('创建异步分析任务失败:', error);
    return errorResponse(`创建分析任务失败: ${error.message || '未知错误'}`, 500);
  }
}

// 获取任务状态 (GET /api/async-analysis?taskId=xxx)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return errorResponse('缺少任务ID参数', 400);
    }
    
    // 获取任务状态
    const task = await getTaskStatus(taskId);
    
    if (!task) {
      return errorResponse('找不到指定的任务', 404);
    }
    
    // 返回任务状态
    return successResponse(task);
  } catch (error: any) {
    console.error('获取任务状态失败:', error);
    return errorResponse(`获取任务状态失败: ${error.message || '未知错误'}`, 500);
  }
}
