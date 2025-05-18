import { NextResponse } from 'next/server';
import { getLatestAnalysis } from '@/lib/supabase-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'admin';
    
    const latestResult = await getLatestAnalysis(userId);
    
    if (!latestResult) {
      return NextResponse.json(
        { error: '数据库中没有分析结果' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(latestResult);
  } catch (error) {
    console.error('获取分析结果错误:', error);
    return NextResponse.json(
      { error: '获取分析结果失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 