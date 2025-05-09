import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }
    
    // 获取用户的所有分析记录，包括打分和建议
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: userId,
      },
      include: {
        scores: true,
        advice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // 处理数据，提取关键信息用于展示
    const histories = analyses.map(analysis => {
      const score = analysis.scores;
      const advice = analysis.advice;
      
      let scoreData = null;
      if (score) {
        try {
          scoreData = JSON.parse(score.rawData);
        } catch (e) {
          console.error('解析分数JSON失败:', e);
        }
      }
      
      return {
        id: analysis.id,
        date: analysis.createdAt,
        facialScore: score?.facialScore,
        voiceScore: score?.voiceScore,
        heartRateScore: score?.heartRateScore,
        overallScore: score?.overallScore,
        scoreDetails: scoreData,
        advice: advice?.content,
        adviceSummary: advice?.summary,
      };
    });
    
    return NextResponse.json({ histories });
  } catch (error: any) {
    console.error('获取历史数据错误:', error);
    return NextResponse.json(
      { error: error.message || '获取历史数据失败' },
      { status: 500 }
    );
  }
} 