import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';

// GLM-4V API配置
const API_KEY = process.env.GLM_API_KEY;
const API_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 生成第一阶段打分Prompt
function generateScoringPrompt(facialData: string, voiceData: string, heartRateData: string) {
  return [
    {
      "role": "system",
      "content": "你是一位专业的健康评估专家，擅长分析面部表情、语音特征和心率数据，并给出专业的健康状况评价。请对提供的数据进行专业、详尽的分析，并以指定的JSON格式输出评分结果。"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": facialData
          }
        },
        {
          "type": "text",
          "text": `我需要对这个人的健康状况进行全面分析。这是他的面部图像，声音数据是"${voiceData}"，心率数据是"${heartRateData}"。请基于这些数据进行专业分析，评估此人的健康状况，并给出以下JSON格式的评分（0-100分）结果：
          {
            "facialAnalysis": {
              "score": 分数,
              "details": "详细分析...",
              "concerns": ["关注点1", "关注点2", ...]
            },
            "voiceAnalysis": {
              "score": 分数,
              "details": "详细分析...",
              "concerns": ["关注点1", "关注点2", ...]
            },
            "heartRateAnalysis": {
              "score": 分数,
              "details": "详细分析...",
              "concerns": ["关注点1", "关注点2", ...]
            },
            "overallHealth": {
              "score": 分数,
              "details": "详细分析...",
              "recommendations": ["建议1", "建议2", ...]
            }
          }`
        }
      ]
    }
  ];
}

// 生成第二阶段建议Prompt
function generateAdvicePrompt(scoreData: any, historySummary?: string) {
  let promptContent = `基于以下健康评估数据，请给出专业、个性化的健康建议：
  ${JSON.stringify(scoreData, null, 2)}`;
  
  if (historySummary) {
    promptContent += `\n\n此外，以下是用户过去的健康情况摘要：\n${historySummary}`;
  }
  
  return [
    {
      "role": "system",
      "content": "你是一位资深的健康顾问，擅长根据健康数据分析结果提供专业、个性化的健康建议。请根据用户的健康评估数据和历史记录，提供详尽、实用的健康建议。"
    },
    {
      "role": "user",
      "content": promptContent
    }
  ];
}

// GLM-4V API调用函数
async function callGLMAPI(messages: any) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "glm-4v-plus-0111",
        messages: messages,
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('GLM API调用错误:', error.response?.data || error.message);
    throw new Error('GLM API调用失败');
  }
}

// 解析GLM返回的JSON字符串
function parseJsonFromLLMResponse(response: string) {
  try {
    // 尝试从返回文本中提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法从LLM响应中提取JSON');
  } catch (error) {
    console.error('JSON解析错误:', error);
    throw new Error('无法解析LLM响应');
  }
}

// 提取建议摘要
function extractAdviceSummary(advice: string) {
  // 简单摘要：取建议的前200个字符作为摘要
  return advice.length > 200 ? advice.substring(0, 200) + '...' : advice;
}

// API路由处理函数
export async function POST(req: NextRequest) {
  try {
    const { userId, facialData, voiceData, heartRateData } = await req.json();

    // 验证输入
    if (!userId || !facialData) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建分析记录
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        facialData,
        voiceData: voiceData || '',
        heartRateData: heartRateData || ''
      }
    });

    // 获取历史摘要（最新的一条）
    const latestAdvice = await prisma.advice.findFirst({
      where: {
        analysis: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        summary: true
      }
    });

    // 第一阶段：评分
    const scoringPrompt = generateScoringPrompt(facialData, voiceData || '', heartRateData || '');
    const scoringResponse = await callGLMAPI(scoringPrompt);
    const scoreData = parseJsonFromLLMResponse(scoringResponse);
    
    // 保存评分结果
    const score = await prisma.score.create({
      data: {
        analysisId: analysis.id,
        facialScore: scoreData.facialAnalysis.score,
        voiceScore: scoreData.voiceAnalysis.score,
        heartRateScore: scoreData.heartRateAnalysis.score,
        overallScore: scoreData.overallHealth.score,
        rawData: JSON.stringify(scoreData)
      }
    });

    // 第二阶段：建议
    const advicePrompt = generateAdvicePrompt(scoreData, latestAdvice?.summary);
    const adviceResponse = await callGLMAPI(advicePrompt);
    const adviceSummary = extractAdviceSummary(adviceResponse);
    
    // 保存建议结果
    const advice = await prisma.advice.create({
      data: {
        analysisId: analysis.id,
        content: adviceResponse,
        summary: adviceSummary
      }
    });

    return NextResponse.json({
      analysisId: analysis.id,
      score: scoreData,
      advice: adviceResponse
    });
  } catch (error: any) {
    console.error('API处理错误:', error);
    return NextResponse.json(
      { error: error.message || '处理请求失败' },
      { status: 500 }
    );
  }
} 