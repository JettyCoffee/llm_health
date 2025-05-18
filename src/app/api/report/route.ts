import { NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/supabase-client';
import { supabase } from '@/lib/supabase';

// 类型定义
interface AnalysisResult {
  id?: number;
  time: number;
  userId: string;
  result: string;
  createdAt: Date;
}

interface AnalysisData {
  error?: string;
  rawContent?: string;
  analysisTitle?: string;
  analysisDateTime?: string;
  overallSummary?: Record<string, unknown>;
  segmentedAnalysis?: Array<Record<string, unknown>>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  id?: number;
  time?: number;
  [key: string]: unknown;
}

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

interface LlmResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function POST(request: Request) {
  try {
    const { analysisId } = await request.json() as { analysisId?: number };
    
    if (!analysisId && analysisId !== 0) {
      return NextResponse.json(
        { error: '未提供分析ID' },
        { status: 400 }
      );
    }
    
    // 从数据库获取分析结果
    let analysis;
    try {
      analysis = await getAnalysisById(analysisId);
    } catch (error) {
      console.error('从数据库获取分析结果时出错:', error);
      return NextResponse.json(
        { error: '获取分析结果失败', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: '未找到对应的分析结果' },
        { status: 404 }
      );
    }

    // 解析分析结果
    let analysisData;
    try {
      // 先检查result字段是否为字符串，如果是则尝试解析
      if (typeof analysis.result === 'string') {
        analysisData = JSON.parse(analysis.result);
      } else {
        // 如果已经是对象，直接使用
        analysisData = analysis.result;
      }
      
      console.log('原始分析数据类型:', typeof analysisData);
      console.log('原始分析数据前100个字符:', JSON.stringify(analysisData).substring(0, 100));
    } catch (parseError) {
      console.error('解析分析结果时出错:', parseError);
      return NextResponse.json(
        { error: '分析结果格式错误', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 500 }
      );
    }
    
    // 如果结果包含rawContent字段，说明原始分析已经解析失败
    // 需要尝试直接从rawContent中提取有用信息
    if (analysisData.rawContent && analysisData.error === '分析结果解析失败') {
      console.log('原始分析结果解析失败，尝试从rawContent中提取信息');
      // 检查是否包含Markdown代码块，并尝试提取JSON内容
      const content = analysisData.rawContent;
      if (content.includes('```json')) {
        // 提取代码块中的JSON内容
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            // 尝试解析提取出的JSON
            const extractedData = JSON.parse(jsonMatch[1]);
            console.log('成功从Markdown代码块中提取并解析JSON');
            analysisData = extractedData; // 使用提取的数据替换
          } catch (parseError) {
            console.error('从Markdown提取的内容解析失败:', parseError);
            // 保持原样
          }
        }
      }
    }

    console.log('开始生成心理分析报告...');

    // 第一步：分析处理已有的视频分析数据（不需要再存入数据库）
    // 由于analysisData已经包含了第一次LLM分析的结果，我们可以直接使用
    
    // 第二步：直接将第一步结果传递给第二个LLM，生成心理分析报告
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
              content: `基于以下视频分析结果：\n\n${JSON.stringify(analysisData)}`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LLM API错误:', errorText);
        return NextResponse.json(
          { error: 'LLM分析失败', details: errorText },
          { status: 500 }
        );
      }

      const reportData = await response.json() as LlmResponse;
      console.log('成功获取心理分析报告');

      // 解析LLM返回的内容
      let finalReport: PsychologicalReport;
      try {
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
      } catch (e) {
        console.error('解析LLM响应失败:', e);
        finalReport = { error: '无法解析LLM响应', raw: JSON.stringify(reportData) };
      }

      // 第三步：将第二个LLM的结果保存到数据库
      // 生成一个唯一的时间戳作为报告ID
      const reportTime = Math.floor(Date.now() / 1000); // 使用当前时间戳，确保唯一性
      
      console.log('准备保存报告到数据库, 使用时间戳:', reportTime);
      console.log('原始分析ID:', analysis.time);
      
      // 准备要插入的数据
      const dataToInsert = {
        user_id: 'admin',
        time: reportTime,
        result: JSON.stringify({
          type: 'final_report',
          originalAnalysisId: analysis.time,
          report: finalReport
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
      
      console.log('数据插入成功，返回结果给客户端');
      
      // 返回成功结果
      return NextResponse.json({
        success: true,
        reportId: reportTime,
        report: finalReport
      });
      
    } catch (llmError) {
      console.error('LLM处理错误:', llmError);
      return NextResponse.json(
        { error: 'LLM处理失败', details: llmError instanceof Error ? llmError.message : String(llmError) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('报告生成错误:', error);
    let errorDetails = error instanceof Error ? error.message : String(error);
    
    // 检查特定的 Supabase 错误
    if (errorDetails.includes('PGRST116')) {
      errorDetails = '数据库操作返回的结果不符合预期格式，可能是查询或插入操作的结果格式不正确';
    }
    
    return NextResponse.json(
      { error: '报告生成失败', details: errorDetails },
      { status: 500 }
    );
  }
}