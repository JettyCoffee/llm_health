import { NextResponse } from 'next/server';
import { saveAnalysisResult } from '@/lib/supabase-client';
import OpenAI from "openai";
import { Stream } from 'openai/streaming';

// 声明类型
interface AnalysisResult {
  error?: string;
  rawContent?: string;
  analysisTitle: string;
  analysisDateTime: string;
  overallSummary?: Record<string, unknown>;
  segmentedAnalysis?: Array<Record<string, unknown>>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  id?: number;
  time?: number;
  [key: string]: unknown;
}

interface StreamResponseChoice {
  delta: {
    content?: string;
  };
}

interface StreamResponse {
  choices: StreamResponseChoice[];
}

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
    
    if (!process.env.DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: '缺少 API 密钥配置' },
        { status: 500 }
      );
    }

    // 创建DashScope API客户端
    const openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      timeout: 120000 // 设置更长的超时时间（120秒）
    });

    console.log('开始调用AI分析视频...');
    
    // 调用大模型分析 - 使用流式输出
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
    
    let completion;
    try {
      // 使用类型断言处理自定义API接口
      completion = await openai.chat.completions.create(params as any) as unknown as Stream<StreamResponse>;
      console.log('成功创建AI分析请求');
    } catch (error) {
      console.error('OpenAI API 错误:', error);
      return NextResponse.json(
        { 
          error: '调用AI服务失败',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    // 使用流式处理收集完整响应
    let fullContent = '';
    try {
      for await (const chunk of completion) {
        if (Array.isArray(chunk.choices) && chunk.choices.length > 0 && chunk.choices[0].delta?.content) {
          fullContent += chunk.choices[0].delta.content;
        }
      }
      console.log('成功接收完整结果');
    } catch (error) {
      console.error('流处理错误:', error);
      return NextResponse.json(
        { 
          error: '处理AI响应时出错',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    // 解析结果
    let result: AnalysisResult;
    try {
      // 检查是否包含Markdown代码块，并尝试提取JSON内容
      if (fullContent.includes('```json')) {
        // 提取代码块中的JSON内容
        const jsonMatch = fullContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 尝试解析提取出的JSON
          const parsedResult = JSON.parse(jsonMatch[1]);
          result = {
            ...parsedResult,
            analysisDateTime: parsedResult.analysisDateTime || new Date().toISOString(),
            analysisTitle: parsedResult.analysisTitle || "用户表现分析报告"
          } as AnalysisResult;
          console.log('成功从Markdown代码块中提取并解析JSON:', result);
        } else {
          throw new Error('无法从Markdown代码块中提取JSON');
        }
      } else {
        // 直接尝试解析
        const parsedResult = JSON.parse(fullContent);
        result = {
          ...parsedResult,
          analysisDateTime: parsedResult.analysisDateTime || new Date().toISOString(),
          analysisTitle: parsedResult.analysisTitle || "用户表现分析报告"
        } as AnalysisResult;
        console.log('成功解析为JSON格式:', result);
      }
    } catch (e) {
      console.error('Error parsing analysis result:', e);
      // 在解析失败时，仍然提供一个有效的结果对象，包含原始内容
      result = { 
        error: '分析结果解析失败', 
        rawContent: fullContent,
        analysisTitle: "解析失败的分析报告",
        analysisDateTime: new Date().toISOString()
      } as AnalysisResult;
    }

    // 保存到数据库
    try {
      console.log('正在保存分析结果到数据库...');
      // 创建一个新对象用于保存，避免循环引用
      const dataToSave = JSON.parse(JSON.stringify(result));
      const { data: savedResult } = await saveAnalysisResult('admin', dataToSave);
      
      if (!savedResult) {
        console.error('保存结果为空');
        throw new Error('保存分析结果失败：没有返回保存的数据');
      }

      result = {
        ...result,
        id: savedResult.id,
        time: savedResult.time
      };
      
      console.log('分析结果成功保存到数据库:', {
        id: result.id,
        time: result.time,
        userId: 'admin'
      });
    } catch (error) {
      console.error('数据库保存错误:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.stack);
      }
      return NextResponse.json(
        { 
          error: '保存分析结果失败',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '数据分析失败，请稍后重试', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}