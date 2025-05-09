import { NextResponse } from 'next/server';

// 处理 POST 请求
export async function POST(request: Request) {
  try {
    // 解析请求体
    const data = await request.json();
    const { userId, facialImage, audioData, heartRateData, heartRateSource } = data;

    // 验证必要的数据
    if (!userId || !facialImage || !audioData || !heartRateData) {
      return NextResponse.json(
        { error: '缺少必要的数据' },
        { status: 400 }
      );
    }

    // 返回与 AnalysisResults 组件匹配的数据结构
    const analysisResults = {
      userId,
      timestamp: new Date().toISOString(),
      score: {
        facialAnalysis: {
          score: 85,
          emotion: '平静',
          confidence: 0.85,
          stressLevel: '低',
          details: [
            '面部表情显示心情平静',
            '压力水平在正常范围内',
            '整体状态良好'
          ]
        },
        voiceAnalysis: {
          score: 88,
          emotion: '积极',
          clarity: 0.92,
          stressIndicators: '正常',
          details: [
            '语音清晰度良好',
            '情绪状态积极',
            '语速和节奏适中'
          ]
        },
        heartRateAnalysis: {
          score: 82,
          average: heartRateSource === 'manual' ? parseInt(heartRateData) : 75,
          variability: '正常',
          stressLevel: '正常',
          details: [
            '心率处于健康范围',
            '心率变异性正常',
            '无明显异常指标'
          ]
        },
        overallHealth: {
          score: 85,
          stressLevel: '正常',
          recommendations: [
            '继续保持良好的作息习惯',
            '建议适当增加有氧运动',
            '注意保持充足的休息时间'
          ]
        }
      }
    };

    // 返回分析结果
    return NextResponse.json(analysisResults);

  } catch (error) {
    console.error('分析过程中出错:', error);
    return NextResponse.json(
      { error: '数据分析过程中发生错误' },
      { status: 500 }
    );
  }
} 