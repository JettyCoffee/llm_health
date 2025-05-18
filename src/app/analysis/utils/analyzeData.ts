interface AnalysisData {
  video: File;
}

// 添加分析结果的接口定义
export interface AnalysisResult {
  id?: number;
  time?: number;
  analysisTitle?: string;
  analysisDateTime?: string;
  overallSummary?: {
    generalReadingStyle?: string;
    mostProminentFacialCueOverall?: string;
    mostProminentVocalCueOverall?: string;
    [key: string]: unknown;
  };
  segmentedAnalysis?: Array<{
    segmentIndex?: number;
    textSegment?: string;
    startTimeSec?: number | null;
    endTimeSec?: number | null;
    facialObservations?: Record<string, unknown>;
    vocalObservations?: Record<string, unknown>;
    congruenceAssessment?: string;
    potentialInterpretationSegment?: string;
    [key: string]: unknown;
  }>;
  crossSegmentPatterns?: Record<string, unknown>;
  analysisDisclaimer?: string;
  error?: string;
  rawContent?: string;
  [key: string]: unknown;
}

const ANALYSIS_PROMPT = `你是一个高级的多模态分析专家，擅长结合文本、音频和视频信息，分析人类的非语言沟通行为。你的任务是细致地观察用户朗读自己创作的文本时的面部表情和声音特征，并将分析结果以高度结构化的JSON格式输出，用于后续的数据处理和报告生成。

请你仔细分析音频和视频，参照提供的文本，重点关注以下方面：
1. 整体印象：朗读的整体风格
2. 面部表情分析：主要表情、表情变化、微表情、眼神、其他面部动作
3. 声音特征分析：语速、音量、音调/音高、语气、停顿、其他声音
4. 文本与非语言的匹配度评估
5. 跨段落模式分析

请严格按照以下JSON格式输出分析结果：

{
  "analysisTitle": "用户朗读表现分析报告",
  "analysisDateTime": "YYYY-MM-DD HH:MM:SS", // 分析完成时间
  "overallSummary": {
    "generalReadingStyle": "描述整体朗读风格 (e.g., 流畅但略显紧张, 情感丰富, 较为平淡等)",
    "mostProminentFacialCueOverall": "在整个朗读过程中最突出的面部表情/特征 (e.g., 眉毛微皱, 嘴角常带一丝微笑, 眼神专注等)",
    "mostProminentVocalCueOverall": "在整个朗读过程中最突出的声音特征 (e.g., 语速偏快, 停顿较多, 音色柔和等)"
  },
  "segmentedAnalysis": [
    {
      "segmentIndex": 1, // 段落序号
      "textSegment": "本段朗读对应的文本内容",
      "startTimeSec": null, // 如果模型能提取，填写秒，否则为null
      "endTimeSec": null,   // 如果模型能提取，填写秒，否则为null
      "facialObservations": {
        "primaryExpression": "主要表情 (e.g., 中性, 微笑, 皱眉)",
        "expressionChangesDescription": "段落内表情变化描述 (e.g., 从中性变为微笑, 眉毛短暂上挑)",
        "microExpressionsDetected": ["检测到的微表情类型列表，如无则为空列表"], // e.g., ["恐惧", "惊讶"]
        "eyeGaze": "眼神描述 (e.g., 直视前方, 视线向下, 左右移动)",
        "otherFacialCues": "其他面部动作描述 (e.g., 咬唇, 轻微摇头)"
      },
      "vocalObservations": {
        "pace": "语速评估 (e.g., 偏慢, 适中, 偏快)",
        "volume": "音量评估 (e.g., 低, 适中, 高, 有波动)",
        "pitch": "音调评估 (e.g., 平稳, 有上扬, 有下降)",
        "tone": "语气描述 (e.g., 平静, 疑问, 肯定, 略带伤感)",
        "pausesDescription": "停顿描述 (e.g., 在句号后有明显停顿, 在某个词后犹豫停顿)",
        "otherVocalizations": "其他声音描述 (e.g., 轻微的叹息声, 清嗓子)"
      },
      "congruenceAssessment": "一致性评估 (e.g., 高度一致, 基本一致, 部分不一致, 明显不一致)",
      "potentialInterpretationSegment": "基于本段表现的初步解读 (强调：基于观察，非诊断)"
    }
    // ... 更多段落分析对象
  ],
  "crossSegmentPatterns": {
    "recurringFacialCues": ["重复出现的面部线索列表"],
    "recurringVocalCues": ["重复出现的声音线索列表"],
    "segmentsWithHighestSignal": "表现最显著的段落索引列表 (e.g., [2, 5])",
    "segmentsWithIncongruence": "表现与文本内容不一致的段落索引列表 (e.g., [3])",
    "facialVocalConsistency": "面部和声音线索之间的一致性评估 (e.g., 大部分时候一致, 偶尔出现不一致)"
  },
  "analysisDisclaimer": "本分析仅基于用户朗读给定文本时的可观察非语言行为（面部表情、声音特征）。它提供了关于朗读者当下情绪、对特定内容的反应或思考过程的潜在线索。本报告不构成专业的心理诊断或评估。"
}`;

export async function analyzeData(data: AnalysisData): Promise<AnalysisResult> {
  try {
    const formData = new FormData();
    formData.append('video', data.video);

    // 使用新的合并API路由
    const response = await fetch('/api/analyze-and-report', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '分析请求失败');
    }

    return {
      id: result.reportId,
      time: result.reportId,
      ...result.report,
    } as AnalysisResult;
  } catch (error) {
    console.error('Analysis error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('数据分析失败，请稍后重试');
  }
} 