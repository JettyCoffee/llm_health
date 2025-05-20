/**
 * 视频分析服务
 */
import OpenAI from "openai";
import { AnalysisData } from '../types';
import { safeParseJSON, formatDateTime } from '../utils';

// 处理视频分析
export async function analyzeVideo(
  openai: OpenAI,
  videoBase64: string
): Promise<AnalysisData> {
  try {
    // 构建提示
    const analysisPrompt = `请对上传的短视频进行全面的行为与心理分析。分析应包括以下几个方面：
1. 面部表情：包括主要表情、表情变化、眼神注视、微表情等
2. 声音分析：语速、音调、音量、说话模式、情感潜流等
3. 肢体语言：姿势、手势、动作、紧张程度等
4. 情感发声模式：分析声音中显示的情绪状态
5. 整体分析：对情绪状态、可能的思想状态、行为一致性等进行总结

请以JSON格式返回，包含以下键：
- analysisTitle (标题)
- analysisDateTime (分析日期时间)
- overallSummary (整体总结)
- facialAnalysis (面部分析)
- voiceAnalysis (声音分析)
- bodyLanguageAnalysis (肢体语言分析)
- emotionalVocalAnalysis (情感发声分析)

每个部分应包含多个详细的子键，提供深入见解。请确保分析结果可读且有用。`;

    // 调用 AI 分析视频
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:video/mp4;base64,${videoBase64}`,
              },
            },
          ],
        },
      ],
    });

    // 处理响应
    const responseText = completion.choices[0].message.content || '';
    
    // 从响应中提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    const parsedResult = safeParseJSON(jsonString) as AnalysisData;

    // 添加默认值处理
    if (!parsedResult.analysisDateTime) {
      parsedResult.analysisDateTime = formatDateTime();
    }

    if (!parsedResult.analysisTitle) {
      parsedResult.analysisTitle = '视频行为与心理分析';
    }

    // 保存原始响应内容
    parsedResult.rawContent = responseText;

    return parsedResult;
  } catch (error: any) {
    console.error('视频分析错误:', error);
    
    return {
      error: error.message || '视频分析失败',
      analysisTitle: '分析失败',
      analysisDateTime: formatDateTime()
    };
  }
}
