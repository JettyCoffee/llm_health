/**
 * API 工具函数
 */
import { AnalysisData, ReportData, StreamResponse } from './types';
import { NextResponse } from 'next/server';

// 最大允许的视频大小 (10MB)
export const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

// 从流式 API 响应中提取内容
export function extractContentFromStream(streamResponse: StreamResponse): string | undefined {
  return streamResponse.choices[0]?.delta.content;
}

// 统一 API 成功响应格式
export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// 统一 API 错误响应格式
export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

// 验证视频文件
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `视频大小不能超过 10MB，当前大小: ${Math.round(file.size / (1024 * 1024))}MB`,
    };
  }

  // 检查文件类型
  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: `只支持视频文件，当前文件类型: ${file.type}`,
    };
  }

  return { valid: true };
}

// 将视频转换为 base64 编码
export async function convertVideoToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // 去除 "data:video/mp4;base64," 等前缀
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('无法读取视频文件'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

// 格式化日期时间
export function formatDateTime(date = new Date()): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 解析 JSON 响应（带错误处理）
export function safeParseJSON(json: string): any {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON 解析错误:', error);
    return null;
  }
}
