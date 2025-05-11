import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeParam = searchParams.get('time');
    
    // 如果提供了特定的时间戳，获取该时间戳的分析结果
    if (timeParam) {
      const time = parseInt(timeParam);
      if (isNaN(time)) {
        return NextResponse.json(
          { error: '无效的时间参数' },
          { status: 400 }
        );
      }
      
      const result = await prisma.analysisResult.findFirst({
        where: {
          time: time,
        },
      });
      
      if (!result) {
        return NextResponse.json(
          { error: '未找到该时间戳的分析结果' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result);
    }
    
    // 否则获取最新的分析结果
    const latestResult = await prisma.analysisResult.findFirst({
      orderBy: {
        time: 'desc',
      },
    });
    
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