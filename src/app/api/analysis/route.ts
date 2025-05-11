import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from "openai";
import { Stream } from 'openai/streaming';

const prisma = new PrismaClient();

// 最大允许的视频大小 (10MB)
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    
    if (!video) {
      return NextResponse.json(
        { error: '没有接收到视频数据' },
        { status: 400 }
      );
    }

    console.log('收到视频文件:', video.name, video.type, `${(video.size / (1024 * 1024)).toFixed(2)}MB`);

    // 检查视频格式
    if (!video.type.includes('mp4') && !video.name.toLowerCase().endsWith('.mp4')) {
      return NextResponse.json(
        { error: '请提供MP4格式的视频文件' },
        { status: 400 }
      );
    }

    // 检查视频大小
    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `视频文件太大，请限制在 ${Math.floor(MAX_VIDEO_SIZE / (1024 * 1024))}MB 以内` },
        { status: 400 }
      );
    }

    // 将视频转换为base64
    const videoBuffer = await video.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');
    
    // 创建DashScope API客户端
    const openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY || 'your-api-key',
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      timeout: 120000 // 设置更长的超时时间（120秒）
    });

    console.log('开始调用AI分析视频...');
    
    // 调用大模型分析 - 使用流式输出
    // 使用 as any 绕过 TypeScript 类型检查，因为 DashScope API 扩展了 OpenAI 的接口
    const params = {
      model: "qwen-omni-turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "video_url",
              video_url: { 
                url: `data:video/mp4;base64,${videoBase64}` 
              }
            },
            { 
              type: "text", 
              text: "请仔细观察视频中用户的面部表情、语音语调和整体表现，分析用户的情感状态和可能的心理活动。分析应包括：1. 面部表情特征，2. 声音特征分析，3. 整体情感状态评估。请以JSON格式返回分析结果，格式如下：{\n\"analysisTitle\": \"用户表现分析报告\",\n\"analysisDateTime\": \"当前时间\",\n\"overallSummary\": {\n  \"generalImpression\": \"整体印象\",\n  \"emotionalState\": \"情绪状态\",\n  \"potentialThoughts\": \"可能的想法\"\n},\n\"facialAnalysis\": {\n  \"primaryExpression\": \"主要表情\",\n  \"expressionChanges\": \"表情变化\",\n  \"eyeGaze\": \"眼神描述\",\n  \"microExpressions\": [\"微表情列表\"]\n},\n\"voiceAnalysis\": {\n  \"pace\": \"语速评估\",\n  \"tone\": \"语调评估\",\n  \"volume\": \"音量评估\",\n  \"emotionalMarkers\": [\"语音中的情绪标记\"]\n},\n\"conclusionAndRecommendations\": \"基于观察的总结和建议\",\n\"disclaimer\": \"分析免责声明\"\n}"
            }
          ]
        }
      ],
      stream: true,
      stream_options: {
        include_usage: true
      },
      modalities: ["text"]
    };
    
    const completion = await openai.chat.completions.create(params as any) as unknown as Stream<any>;

    console.log('开始接收AI分析结果...');

    // 使用流式处理收集完整响应
    let fullContent = '';
    for await (const chunk of completion) {
      if (Array.isArray(chunk.choices) && chunk.choices.length > 0 && chunk.choices[0].delta?.content) {
        fullContent += chunk.choices[0].delta.content;
      }
    }

    console.log('成功接收完整结果');

    // 解析结果
    let result;
    try {
      // 检查是否包含Markdown代码块，并尝试提取JSON内容
      if (fullContent.includes('```json')) {
        // 提取代码块中的JSON内容
        const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 尝试解析提取出的JSON
          result = JSON.parse(jsonMatch[1]);
          console.log('成功从Markdown代码块中提取并解析JSON');
        } else {
          throw new Error('无法从Markdown代码块中提取JSON');
        }
      } else {
        // 直接尝试解析
        result = JSON.parse(fullContent);
        console.log('成功解析为JSON格式');
      }
    } catch (e) {
      console.error('Error parsing analysis result:', e);
      // 在解析失败时，仍然提供一个有效的结果对象，包含原始内容
      result = { 
        error: '分析结果解析失败', 
        rawContent: fullContent,
        analysisTitle: "解析失败的分析报告",
        analysisDateTime: new Date().toISOString(),
        id: Date.now() // 添加一个ID字段以便前端能够识别
      };
    }

    // 保存到数据库
    const lastResult = await prisma.analysisResult.findFirst({
      orderBy: {
        time: 'desc',
      },
    });

    const nextTime = lastResult ? lastResult.time + 1 : 0;

    await prisma.analysisResult.create({
      data: {
        userId: 'admin',
        time: nextTime,
        result: JSON.stringify(result),
      },
    });

    console.log('分析结果已保存到数据库');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '数据分析失败，请稍后重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 