export interface AnalysisResult {
  analysisId: string;
  score: {
    facialAnalysis: {
      score: number;
      details: string;
      concerns: string[];
    };
    voiceAnalysis: {
      score: number;
      details: string;
      concerns: string[];
    };
    heartRateAnalysis: {
      score: number;
      details: string;
      concerns: string[];
    };
    overallHealth: {
      score: number;
      details: string;
      recommendations: string[];
    };
  };
  advice: string;
}
