import { NextResponse, NextRequest } from 'next/server';
import { AnalyzeDataPayload, LLMStage1Scores, LLMStage2Analysis, AnalysisReport } from '@/types';
import { callMultiModalLLM, callTextLLMForAdvice } from '@/lib/llm';
import { saveNewAnalysisReport } from '@/lib/db';

// 如果需要处理大的文件上传，可能需要调整 Next.js API 的 body 大小限制
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb', // 例如，增加到10MB
//     },
//   },
// };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalyzeDataPayload;
    console.log("API /analyze received payload:", body);

    // 从请求体中获取面部、声音、心率数据和历史总结
    const { facialData, voiceData, heartRate, previousSummary } = body;

    if (!facialData && !voiceData && heartRate === undefined) {
      return NextResponse.json(
        { message: '错误：至少需要提供面部、声音或心率数据中的一种。' }, 
        { status: 400 }
      );
    }

    // 实际项目中: 
    // 1. (可选) 如果LLM不直接支持，则需要语音转文本 (STT)
    let voiceTranscription: string | undefined = undefined;
    // if (voiceData) { voiceTranscription = await transcribeAudio(voiceData); }

    // 2. (可选) 如果LLM不直接支持，则需要面部特征提取
    let facialImageDescription: string | undefined = undefined;
    // if (facialData) { facialImageDescription = await analyzeFacialFeatures(facialData); }

    // --- 第一阶段：调用多模态LLM获取打分 ---
    let stage1Scores: LLMStage1Scores;
    try {
      stage1Scores = await callMultiModalLLM(
        body, // 传递整个payload，LLM prompt会处理其中的数据
        facialImageDescription, // 如果有的话
        voiceTranscription      // 如果有的话
      );
      console.log("LLM Stage 1 Scores:", stage1Scores);
    } catch (error: any) {
      console.error("调用多模态LLM失败:", error);
      return NextResponse.json(
        { message: '调用多模态分析模型失败。', error: error.message || error }, 
        { status: 500 }
      );
    }

    // --- (可选) 将原始数据和第一阶段打分存入数据库（如果适用）---
    // 根据您的数据流，您可能在获取第二阶段分析后再统一保存，或分步保存
    // const preliminaryRecord = await savePreliminaryData(body, stage1Scores); 

    // --- 第二阶段：调用文本LLM获取建议 ---
    let stage2Analysis: LLMStage2Analysis;
    try {
      // 决定是否使用 historicalSummary (可能来自请求，或从DB查询得到)
      stage2Analysis = await callTextLLMForAdvice(stage1Scores, previousSummary);
      console.log("LLM Stage 2 Analysis:", stage2Analysis);
    } catch (error: any) {
      console.error("调用文本LLM获取建议失败:", error);
      return NextResponse.json(
        { message: '调用建议生成模型失败。' , error: error.message || error},
        { status: 500 }
      );
    }

    // --- 将完整分析报告存入数据库 ---
    // 假设我们没有用户系统，userId 为 null
    const userId = null; // 后续可以从会话或token中获取真实用户ID
    let finalReport: AnalysisReport;
    try {
      finalReport = await saveNewAnalysisReport(userId, body, stage1Scores, stage2Analysis);
      console.log("分析报告已保存到数据库:", finalReport.id);
    } catch (error: any) {
      console.error("保存分析报告到数据库失败:", error);
      // 即使保存失败，也可能选择返回分析结果给用户，但记录一个错误
      // 或者返回一个特定的错误状态
      return NextResponse.json(
        { message: '分析完成，但保存报告失败。' , error: error.message || error},
        { status: 500 } // 或者 207 Multi-Status 如果部分成功
      );
    }

    // 返回合并后的完整报告给前端
    return NextResponse.json(finalReport, { status: 200 });

  } catch (error: any) {
    console.error("API /analyze 内部服务器错误:", error);
    let errorMessage = "分析请求处理失败。";
    if (error.message) {
      errorMessage += ` 错误: ${error.message}`;
    }
    // 避免直接暴露过多内部错误细节给客户端，除非是特定可信错误
    if (error instanceof SyntaxError) { // 例如，JSON解析错误
        return NextResponse.json({ message: "请求体JSON格式错误。" }, { status: 400 });
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// (可选) GET路由用于测试或其他目的
// export async function GET(request: NextRequest) {
//   return NextResponse.json({ message: "Analyze API is running. Use POST to submit data." });
// } 