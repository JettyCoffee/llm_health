import { HealthRecord, LLMStage1Scores, LLMStage2Analysis, AnalysisReport, AnalyzeDataPayload } from "@/types";

// 这是一个数据库服务的模拟实现
// 您需要根据您选择的数据库（如 Supabase, Vercel Postgres, Prisma + PlanetScale等）进行替换

const MOCK_DB = {
  healthRecords: [] as HealthRecord[],
  analysisReports: [] as AnalysisReport[],
};

/**
 * 保存原始输入数据和第一阶段LLM打分 (如果一次性完成)
 * 或者先保存原始数据，再更新打分和分析
 * @param userId 可选的用户ID
 * @param payload 原始输入数据
 * @param scores 第一阶段打分
 * @param analysis 第二阶段分析
 */
export async function saveNewAnalysisReport(
  userId: string | null | undefined,
  payload: AnalyzeDataPayload,
  scores: LLMStage1Scores,
  analysis: LLMStage2Analysis
): Promise<AnalysisReport> {
  console.log("DB: 保存新的分析报告", { userId, payload, scores, analysis });
  await new Promise(resolve => setTimeout(resolve, 300)); // 模拟DB操作

  const recordId = `record_${Date.now()}`;
  const reportId = `report_${Date.now()}`;

  // 模拟保存原始数据记录 (简化)
  const newRecord: HealthRecord = {
    id: recordId,
    userId: userId || undefined,
    createdAt: new Date().toISOString(),
    heartRate: payload.heartRate,
    // facialDataRef 和 voiceDataRef 通常是指向云存储的链接
    // 这里为了简单，我们不实际存储文件内容到这个模拟DB
    facialDataRef: payload.facialData ? `mock_face_${recordId}.jpg` : undefined,
    voiceDataRef: payload.voiceData ? `mock_voice_${recordId}.mp3` : undefined,
    llm1Scores: scores, 
    llm2AnalysisId: reportId,
  };
  MOCK_DB.healthRecords.push(newRecord);

  const newReport: AnalysisReport = {
    id: reportId,
    recordId: recordId,
    timestamp: new Date().toISOString(),
    ...scores,
    ...analysis,
  };
  MOCK_DB.analysisReports.push(newReport);

  console.log("DB: 当前记录数:", MOCK_DB.healthRecords.length, "报告数:", MOCK_DB.analysisReports.length);
  return newReport;
}

/**
 * 获取指定用户的所有历史分析报告 (简化版，仅返回最新几个)
 * @param userId 
 */
export async function getUserAnalysisHistory(
  userId: string | null | undefined,
  limit: number = 5
): Promise<AnalysisReport[]> {
  console.log("DB: 获取用户分析历史", { userId, limit });
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userReports = MOCK_DB.analysisReports
    .filter(report => {
      const record = MOCK_DB.healthRecords.find(r => r.id === report.recordId);
      return record && (userId ? record.userId === userId : true); // 如果没有userId，返回所有
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return userReports.slice(0, limit);
}

/**
 * 获取最新的用户总结，用于下一次分析的输入
 * @param userId 
 */
export async function getLatestUserSummary(
  userId: string | null | undefined
): Promise<string | undefined> {
  console.log("DB: 获取最新用户总结", { userId });
  const history = await getUserAnalysisHistory(userId, 1);
  if (history.length > 0) {
    return history[0].current_status_summary; // 从报告中提取总结部分
  }
  return undefined;
}

// --- 您可能需要的其他数据库操作函数 ---
// - getHealthRecordById(id: string): Promise<HealthRecord | null>
// - getAnalysisReportById(id: string): Promise<AnalysisReport | null>
// - updateHealthRecord(id: string, updates: Partial<HealthRecord>): Promise<HealthRecord | null>
// - deleteAnalysisReport(id: string): Promise<boolean>

// 如果使用 Supabase Client:
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// 然后您可以使用 supabase.from('table_name').select() 等方法 