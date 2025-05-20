/**
 * 心理报告生成服务
 */
import { AnalysisData, ReportData } from '../types';
import { supabase } from '@/lib/supabase';
import { formatDateTime, safeParseJSON } from '../utils';

// 生成心理报告
export async function generateReport(
  anthropic: any,
  analysisData: AnalysisData
): Promise<ReportData['psychologicalReport']> {
  try {
    // 构建提示
    const reportPrompt = `请基于以下行为与心理分析数据，提供一份全面的心理健康评估报告。该报告应专业且易于理解，同时注意保持客观中立。
分析数据如下：
${JSON.stringify(analysisData, null, 2)}

请提供以下几个部分：
1. 摘要：简要概述主要发现和整体心理状态
2. 情绪评估：详细分析显示的情绪状态、情绪调节能力和可能的情绪模式
3. 行为洞察：分析行为模式、非语言表达和行为的一致性
4. 沟通风格：评估沟通方式、表达清晰度和潜在的沟通障碍
5. 建议：基于观察提供的心理健康建议
6. 免责声明：说明此分析仅基于短时观察，不构成正式诊断

请以JSON格式返回，包含以下键：
- summary (摘要)
- emotionalAssessment (情绪评估)
- behavioralInsights (行为洞察)
- communicationStyle (沟通风格)
- recommendations (建议)
- disclaimer (免责声明)`;

    // 调用 Claude API 生成报告
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: reportPrompt
        }
      ],
    });

    // 处理响应
    const responseText = response.content[0].text;
    
    // 从响应中提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    const parsedResult = safeParseJSON(jsonString);

    if (!parsedResult) {
      throw new Error('无法解析心理报告响应');
    }

    return parsedResult;
  } catch (error: any) {
    console.error('心理报告生成错误:', error);
    
    return {
      summary: '报告生成失败',
      emotionalAssessment: '无法评估',
      behavioralInsights: '无法提供',
      communicationStyle: '无法分析',
      recommendations: '无法提供建议',
      disclaimer: '此报告生成失败，不构成任何形式的心理评估。',
      error: error.message || '生成心理报告时出错'
    };
  }
}

// 保存报告到数据库
export async function saveReportToDatabase(
  analysisResult: AnalysisData,
  psychologicalReport: ReportData['psychologicalReport']
): Promise<{ reportId: string }> {
  try {
    // 生成唯一 ID
    const reportId = `report_${Date.now()}`;
    
    // 创建完整报告对象
    const reportData: ReportData = {
      reportId,
      analysisResult,
      psychologicalReport,
      createdAt: new Date().toISOString()
    };

    // 保存到数据库
    const { error } = await supabase
      .from('analyses')
      .insert([reportData]);

    if (error) {
      throw error;
    }

    return { reportId };
  } catch (error: any) {
    console.error('保存报告错误:', error);
    throw new Error(`保存报告到数据库失败: ${error.message}`);
  }
}
