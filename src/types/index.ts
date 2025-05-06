// API 请求和响应类型
export interface FacialData {
  fileName: string;
  fileType: string;
  base64Data: string; // Base64编码的图像数据
}

export interface VoiceData {
  fileName: string;
  fileType: string;
  base64Data: string; // Base64编码的音频数据
}

export interface AnalyzeDataPayload {
  facialData?: FacialData;
  voiceData?: VoiceData;
  heartRate?: number;
  previousSummary?: string; // 用于变化数据分析
}

// LLM Stage 1 输出的打分结构 (示例)
export interface LLMStage1Scores {
  facial_expression_assessment?: { score: number; details: string };
  vocal_characteristics_assessment?: { score: number; details: string };
  physiological_state_assessment?: { score: number; details: string }; // 基于心率
  estimated_stress_level?: { score: number; category: string };
  overall_wellbeing_score?: { score: number; trend_suggestion?: string };
  // 可以根据实际LLM输出调整
}

// LLM Stage 2 输出的建议结构 (示例)
export interface LLMStage2Analysis {
  current_status_summary: string;
  detailed_analysis: string; // Markdown格式
  personalized_advice: string; // Markdown格式
  follow_up_points: string; // Markdown格式
}

export interface AnalysisReport extends LLMStage1Scores, LLMStage2Analysis {
  id: string; // 报告ID
  recordId?: string; // 原始数据记录ID
  timestamp: string; // 创建时间
}

// 数据库记录类型 (示例)
export interface HealthRecord {
  id: string;
  userId?: string;
  createdAt: string;
  facialDataRef?: string; // 指向存储服务的文件路径或ID
  voiceDataRef?: string;  // 指向存储服务的文件路径或ID
  heartRate?: number;
  llm1Scores?: LLMStage1Scores; // 直接存储或关联
  llm2AnalysisId?: string; // 指向分析报告的ID
} 