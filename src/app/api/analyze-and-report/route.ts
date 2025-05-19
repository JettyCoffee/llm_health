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
  overallSummary?: {
    generalImpression?: string;
    emotionalState?: string;
    potentialThoughts?: string;
    behavioralConsistency?: string;
    [key: string]: unknown;
  };
  facialAnalysis?: {
    primaryExpression?: string;
    expressionChanges?: string;
    eyeGaze?: string;
    microExpressions?: string[];
    emotionalMarkers?: string;
    [key: string]: unknown;
  };
  voiceAnalysis?: {
    pace?: string;
    tone?: string;
    volume?: string;
    speechPattern?: string;
    emotionalMarkers?: string[];
    [key: string]: unknown;
  };
  bodyLanguageAnalysis?: {
    posture?: string;
    gestures?: string;
    movement?: string;
    tensionIndicators?: string[];
    synchrony?: string;
    [key: string]: unknown;
  };
  cognitiveBehavioralAssessment?: {
    attentionPatterns?: string;
    decisionMakingCues?: string;
    cognitiveLoadIndicators?: string;
    emotionalRegulationSigns?: string;
    [key: string]: unknown;
  };
  segmentedAnalysis?: Array<Record<string, unknown>>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  [key: string]: unknown;
}

// 心理分析报告数据类型
interface PsychologicalReport {
  reportTitle?: string;
  reportDateTime?: string;
  overallAssessment?: {
    psychologicalState?: string;
    psychologicalStateExplanation?: string;
    emotionalTone?: string;
    emotionalToneExplanation?: string;
    confidenceLevel?: string;
    confidenceLevelExplanation?: string;
    [key: string]: unknown;
  };
  detailedAnalysis?: {
    cognitiveDimension?: {
      thoughtPatterns?: string;
      thoughtPatternsExplanation?: string;
      attentionFocus?: string;
      attentionFocusExplanation?: string;
      decisivenessTrait?: string;
      decisivenessTraitExplanation?: string;
      [key: string]: unknown;
    };
    emotionalDimension?: {
      primaryEmotions?: string[];
      primaryEmotionsExplanation?: string;
      emotionalRegulation?: string;
      emotionalRegulationExplanation?: string;
      emotionalExpressiveness?: string;
      emotionalExpressivenessExplanation?: string;
      [key: string]: unknown;
    };
    behavioralDimension?: {
      communicationStyle?: string;
      communicationStyleExplanation?: string;
      interpersonalApproach?: string;
      interpersonalApproachExplanation?: string;
      stressResponses?: string;
      stressResponsesExplanation?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  insightsAndRecommendations?: {
    potentialStrengths?: string[];
    potentialStrengthsExplanation?: string;
    potentialChallenges?: string[];
    potentialChallengesExplanation?: string;
    developmentSuggestions?: string[];
    developmentSuggestionsExplanation?: string;
    [key: string]: unknown;
  };
  assessmentMethodology?: string;
  theoreticalFramework?: string;
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
          },          { 
            type: "text", 
            text: "请作为专业的心理学和行为分析专家，仔细观察视频中用户的面部表情、语音语调、肢体语言和整体表现，提供详尽的行为与情感分析。请注意微表情、情绪变化和潜在的心理状态指标。分析应包括以下方面，并提供细节丰富的专业内容：\n\n1. 面部表情分析：主要表情、表情变化模式、微表情、眼神特征和情绪标记\n2. 声音特征分析：语速、语调、音量变化、情感语调和特殊语音标记\n3. 肢体语言分析：姿势、手势、身体动作模式和非语言线索\n4. 情感状态评估：主导情绪、情绪变化模式、情绪强度和情绪调节表现\n5. 认知状态推断：注意力分配、思维模式指标和决策风格线索\n\n请以JSON格式返回分析结果，格式如下：\n{\n\"overallSummary\": {\n  \"generalImpression\": \"对用户整体表现的专业印象\",\n  \"emotionalState\": \"情绪状态的专业描述，包括复杂情绪\",\n  \"potentialThoughts\": \"基于行为表现推断的可能认知过程\",\n  \"behavioralConsistency\": \"行为一致性和变化模式的专业评估\"\n},\n\"facialAnalysis\": {\n  \"primaryExpression\": \"主要面部表情的专业描述\",\n  \"expressionChanges\": \"表情变化模式的专业分析\",\n  \"eyeGaze\": \"眼神特征的详细专业描述\",\n  \"microExpressions\": [\"微表情列表，包含时间点和专业解释\"],\n  \"emotionalMarkers\": \"面部情绪标记的专业分析\"\n},\n\"voiceAnalysis\": {\n  \"pace\": \"语速特征及其变化的专业评估\",\n  \"tone\": \"语调特征的专业评估，包括情感色彩\",\n  \"volume\": \"音量特征及其变化的专业评估\",\n  \"speechPattern\": \"语言模式的专业分析\",\n  \"emotionalMarkers\": [\"语音中的情绪标记列表\"]\n},\n\"bodyLanguageAnalysis\": {\n  \"posture\": \"姿势特征的专业描述\",\n  \"gestures\": \"手势特征的专业分析\",\n  \"movement\": \"移动和动作模式的专业评估\",\n  \"tensionIndicators\": [\"身体紧张指标列表\"],\n  \"synchrony\": \"行为协调性的专业评估\"\n},\n\"cognitiveBehavioralAssessment\": {\n  \"attentionPatterns\": \"注意力分配特征的专业分析\",\n  \"decisionMakingCues\": \"决策风格线索的专业评估\",\n  \"cognitiveLoadIndicators\": \"认知负荷指标的专业描述\",\n  \"emotionalRegulationSigns\": \"情绪调节迹象的专业分析\"\n}\n}" 
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
        model: 'claude-3-7-sonnet-20250219',        messages: [
          {
            role: 'system',
            content: `你是一名拥有临床心理学博士学位的资深心理学家，擅长使用认知行为理论、情绪智能理论和积极心理学框架，根据人们的面部表情、语音和行为模式分析他们的心理状态。
你的任务是深入分析用户的视频表现结果，并生成一份专业、详尽、且有理论支撑的心理分析报告。
请确保所有输出都是JSON格式，严格按照以下结构输出，并在每个部分提供丰富的专业内容和理论依据：

{
  "reportTitle": "用户心理分析报告",
  "reportDateTime": "YYYY-MM-DD HH:MM:SS",
  "overallAssessment": {
    "psychologicalState": "整体心理状态的专业描述，包含关键心理特征",
    "psychologicalStateExplanation": "对心理状态的专业解释，包括可能的成因和影响因素",
    "emotionalTone": "主导情绪基调，基于Plutchik情绪轮或PAD情绪模型的专业评估",
    "emotionalToneExplanation": "对情绪基调的专业解释，包括情绪形成的认知和环境因素",
    "confidenceLevel": "分析可信度评估（高/中/低）",
    "confidenceLevelExplanation": "对可信度评估的专业解释，包括影响因素和局限性"
  },
  "detailedAnalysis": {
    "cognitiveDimension": {
      "thoughtPatterns": "思维模式的专业分析，如辩证思维、灵活性、创造性等",
      "thoughtPatternsExplanation": "基于认知心理学的思维模式专业解释",
      "attentionFocus": "注意力焦点和分配特点的专业描述",
      "attentionFocusExplanation": "注意力特征的认知神经科学解释",
      "decisivenessTrait": "决策风格和特点的专业评估",
      "decisivenessTraitExplanation": "决策特征的专业解释，包括认知偏见和决策理论"
    },
    "emotionalDimension": {
      "primaryEmotions": ["基于专业情绪分类体系的主要情绪列表"],
      "primaryEmotionsExplanation": "情绪识别的专业基础和理论支持",
      "emotionalRegulation": "情绪调节能力的专业评估，包括调节策略和应对模式",
      "emotionalRegulationExplanation": "情绪调节的心理生理学基础和专业理论",
      "emotionalExpressiveness": "情绪表达方式的专业描述，包括表达强度和社会适应性",
      "emotionalExpressivenessExplanation": "情绪表达的社会心理学解释和文化因素分析"
    },
    "behavioralDimension": {
      "communicationStyle": "沟通风格的专业评估，包括言语和非言语特征",
      "communicationStyleExplanation": "沟通风格的专业理论基础和影响因素",
      "interpersonalApproach": "人际交往倾向和模式的专业描述",
      "interpersonalApproachExplanation": "人际交往模式的依恋理论和社会心理学解释",
      "stressResponses": "应对压力的行为模式的专业评估",
      "stressResponsesExplanation": "压力反应的神经心理学基础和适应性分析"
    }
  },
  "insightsAndRecommendations": {
    "potentialStrengths": ["基于专业评估的潜在优势列表，包含具体特质和能力"],
    "potentialStrengthsExplanation": "从积极心理学视角对潜在优势的专业解读",
    "potentialChallenges": ["基于专业评估的可能面临的挑战列表，包含具体困难和风险"],
    "potentialChallengesExplanation": "对潜在挑战的专业评估和影响分析",
    "developmentSuggestions": ["基于循证心理学的具体发展建议列表，针对性强"],
    "developmentSuggestionsExplanation": "发展建议的专业理论基础和预期效果"
  },
  "assessmentMethodology": "本报告采用多维度综合评估方法，结合行为观察、语言分析和情绪识别等技术手段，对用户进行全面的心理特征分析。评估过程参考了认知行为评估框架和情绪识别的标准化指标。",
  "theoreticalFramework": "本评估基于认知行为理论、情绪智能理论和积极心理学等多种心理学理论框架，旨在提供科学、全面的心理特征描述，并从多个维度理解个体的心理特征和发展潜能。",
  "disclaimer": "本报告基于有限的行为观察数据，仅供参考，不构成临床诊断或医疗建议。如有心理健康方面的顾虑，请咨询专业的心理健康服务提供者。报告内容应结合个体具体情况进行理解和应用。"
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
