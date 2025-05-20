/**
 * 共享 API 数据类型定义
 */

// 视频分析数据类型
export interface AnalysisData {
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
    emotionalUndertones?: string[];
    [key: string]: unknown;
  };
  bodyLanguageAnalysis?: {
    posture?: string;
    gestures?: string;
    movement?: string;
    tension?: string;
    [key: string]: unknown;
  };
  emotionalVocalAnalysis?: {
    summary?: string;
    emotionTrends?: string;
    confidenceMarkers?: string;
    [key: string]: unknown;
  };
  segmentedAnalysis?: Array<Record<string, unknown>>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  id?: number;
  time?: number;
  [key: string]: unknown;
}

// 报告数据类型
export interface ReportData {
  id?: string;
  reportId?: string;
  analysisResult?: AnalysisData;
  psychologicalReport?: {
    summary?: string;
    emotionalAssessment?: string;
    behavioralInsights?: string;
    communicationStyle?: string;
    recommendations?: string;
    disclaimer?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  [key: string]: unknown;
}

// API 流式响应类型
export interface StreamResponseChoice {
  delta: {
    content?: string;
  };
}

export interface StreamResponse {
  choices: StreamResponseChoice[];
}

// API 响应类型
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
