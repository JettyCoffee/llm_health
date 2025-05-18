import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from "openai";
import { Stream } from 'openai/streaming';

// 视频分析数据类型
interface AnalysisData {
  error?: string;
  rawContent?: string;
  analysisTitle?: string;
  analysisDateTime?: string;
  overallSummary?: Record<string, unknown>;
  segmentedAnalysis?: Array<Record<string, unknown>>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  [key: string]: unknown;
}

// 心理分析报告数据类型
interface PsychologicalReport {
  reportTitle?: string;
  reportDateTime?: string;
  overallAssessment?: Record<string, unknown>;
  detailedAnalysis?: Record<string, unknown>;
  insightsAndRecommendations?: Record<string, unknown>;
  disclaimer?: string;
  raw?: string;
  error?: string;
  [key: string]: unknown;
}

// 流式响应的数据结构
interface StreamResponseChoice {
  delta: {
    content?: string;
  };
}

interface StreamResponse {
  choices: StreamResponseChoice[];
}

// LLM 响应数据类型
interface LlmResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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

    // 第一步：视频分析
    console.log('开始分析视频...');
    let analysisData = await analyzeVideo(video);
    console.log('视频分析完成');

    // 第二步：生成心理分析报告
    console.log('开始生成心理分析报告...');
    const finalReport = await generatePsychologicalReport(analysisData);
    console.log('心理分析报告生成完成');

    // 第三步：将最终报告保存到数据库
    console.log('开始保存心理分析报告到数据库...');
    const reportTime = Math.floor(Date.now() / 1000);
    const reportId = await saveReportToDatabase('admin', reportTime, analysisData, finalReport);
    console.log('心理分析报告保存完成，ID:', reportId);
      // 返回成功结果
    return NextResponse.json({
      success: true,
      reportId: reportTime,
      time: reportTime,  // 添加time字段以确保与前端期望的格式一致
      id: reportTime,    // 添加id字段以确保与前端期望的格式一致
      report: finalReport
    });
    
  } catch (error) {
    console.error('完整分析流程错误:', error);
    return NextResponse.json(
      { error: '分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 视频分析函数
async function analyzeVideo(video: File): Promise<AnalysisData> {
  // 将视频转换为base64
  const videoBuffer = await video.arrayBuffer();
  const videoBase64 = Buffer.from(videoBuffer).toString('base64');
  
  if (!process.env.DASHSCOPE_API_KEY) {
    throw new Error('缺少 API 密钥配置');
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
  
  // 使用类型断言处理自定义API接口
  const completion = await openai.chat.completions.create(params as any) as unknown as Stream<StreamResponse>;
  console.log('成功创建AI分析请求');

  // 使用流式处理收集完整响应
  let fullContent = '';
  for await (const chunk of completion) {
    if (Array.isArray(chunk.choices) && chunk.choices.length > 0 && chunk.choices[0].delta?.content) {
      fullContent += chunk.choices[0].delta.content;
    }
  }
  console.log('成功接收完整结果');

  // 解析结果
  let result: AnalysisData;
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
        };
        console.log('成功从Markdown代码块中提取并解析JSON');
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
      };
      console.log('成功解析为JSON格式');
    }
  } catch (e) {
    console.error('解析分析结果时出错:', e);
    // 在解析失败时，仍然提供一个有效的结果对象，包含原始内容
    result = { 
      error: '分析结果解析失败', 
      rawContent: fullContent,
      analysisTitle: "解析失败的分析报告",
      analysisDateTime: new Date().toISOString()
    };
  }

  return result;
}

// 心理分析报告生成函数
async function generatePsychologicalReport(analysisData: AnalysisData): Promise<PsychologicalReport> {
  try {
    console.log('开始调用第二个LLM生成心理分析报告...');
    
    // 调用Claude API生成心理分析报告
    const response = await fetch('https://api.mjdjourney.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-ALXXaygI4QIkj315355f4e2cA38c47A9B589D2D0F71b09D5`
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        messages: [
          {
            role: 'system',
            content: `你是一名专业的心理学家，擅长根据人们的面部表情、语音和行为模式分析他们的心理状态。
你的任务是分析用户的视频分析结果，并生成一份详尽的心理分析报告。
请确保所有输出都是JSON格式，严格按照以下结构输出：

{
  "reportTitle": "用户心理分析报告",
  "reportDateTime": "YYYY-MM-DD HH:MM:SS",
  "overallAssessment": {
    "psychologicalState": "整体心理状态描述",
    "emotionalTone": "主导情绪基调",
    "confidenceLevel": "分析可信度评估（高/中/低）"
  },
  "detailedAnalysis": {
    "cognitiveDimension": {
      "thoughtPatterns": "思维模式分析",
      "attentionFocus": "注意力焦点",
      "decisivenessTrait": "决策特征"
    },
    "emotionalDimension": {
      "primaryEmotions": ["主要情绪列表"],
      "emotionalRegulation": "情绪调节能力评估",
      "emotionalExpressiveness": "情绪表达方式"
    },
    "behavioralDimension": {
      "communicationStyle": "沟通风格",
      "interpersonalApproach": "人际交往倾向",
      "stressResponses": "应对压力的行为模式"
    }
  },
  "insightsAndRecommendations": {
    "potentialStrengths": ["潜在优势列表"],
    "potentialChallenges": ["可能面临的挑战列表"],
    "developmentSuggestions": ["发展建议列表"]
  },
  "disclaimer": "本报告基于有限的行为观察数据，仅供参考，不构成专业诊断或医疗建议。"
}`
          },
          {
            role: 'user',
            content: `基于以下视频分析结果，请生成一份详尽的用户心理分析报告：\n\n${JSON.stringify(analysisData)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API错误:', errorText);
      throw new Error(`LLM分析失败: ${errorText}`);
    }

    const reportData = await response.json() as LlmResponse;
    console.log('成功获取心理分析报告');

    // 解析LLM返回的内容
    let finalReport: PsychologicalReport;
    
    // 如果reportData.choices[0].message.content是字符串形式的JSON，解析它
    if (typeof reportData.choices[0].message.content === 'string') {
      try {
        finalReport = JSON.parse(reportData.choices[0].message.content) as PsychologicalReport;
      } catch (e) {
        // 如果解析失败，直接使用原始内容
        finalReport = { raw: reportData.choices[0].message.content };
      }
    } else {
      // 否则直接使用
      finalReport = reportData.choices[0].message.content as unknown as PsychologicalReport;
    }

    return finalReport;
  } catch (e) {
    console.error('生成心理分析报告时出错:', e);
    return { 
      error: '无法生成心理分析报告', 
      raw: e instanceof Error ? e.message : String(e),
      reportTitle: "生成失败的心理分析报告",
      reportDateTime: new Date().toISOString()
    };
  }
}

// 保存报告到数据库
async function saveReportToDatabase(
  userId: string, 
  reportTime: number, 
  analysisData: AnalysisData, 
  finalReport: PsychologicalReport
): Promise<number> {
  // 准备要插入的数据
  const dataToInsert = {
    user_id: userId,
    time: reportTime,
    result: JSON.stringify({
      type: 'final_report',
      originalAnalysisId: reportTime, // 使用相同的时间戳作为分析ID
      report: finalReport,
      videoAnalysis: analysisData
    })
  };
  
  console.log('准备插入数据:', JSON.stringify(dataToInsert).substring(0, 100) + '...');
  
  // 执行插入操作
  const { error: insertError } = await supabase
    .from('analysis_results')
    .insert([dataToInsert]);
  
  if (insertError) {
    console.error('数据库插入错误, 完整错误:', insertError);
    throw new Error(`数据库插入错误: ${insertError.message}`);
  }
  
  return reportTime;
}
