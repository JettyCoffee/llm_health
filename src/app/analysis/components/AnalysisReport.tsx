import { Box, Container, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisReportProps {
  customText1?: string;
  customText2?: string;
  analysisData: {
    analysisTitle: string;
    analysisDateTime: string;
    overallSummary: {
      generalReadingStyle: string;
      mostProminentFacialCueOverall: string;
      mostProminentVocalCueOverall: string;
    };
    segmentedAnalysis: Array<{
      segmentIndex: number;
      textSegment: string;
      facialObservations: {
        primaryExpression: string;
        expressionChangesDescription: string;
        eyeGaze: string;
      };
      vocalObservations: {
        pace: string;
        volume: string;
        pitch: string;
        tone: string;
      };
      congruenceAssessment: string;
      potentialInterpretationSegment: string;
    }>;
  };
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ 
  customText1 = "", 
  customText2 = "", 
  analysisData 
}) => {
  // 将语音特征数据转换为图表数据格式
  const vocalChartData = analysisData.segmentedAnalysis.map(segment => ({
    name: `段落 ${segment.segmentIndex}`,
    语速: segment.vocalObservations.pace === "快" ? 3 : 
          segment.vocalObservations.pace === "中等" ? 2 : 1,
    音量: segment.vocalObservations.volume === "高" ? 3 :
          segment.vocalObservations.volume === "中等" ? 2 : 1,
    音调: segment.vocalObservations.pitch === "高" ? 3 :
          segment.vocalObservations.pitch === "中等" ? 2 : 1,
  }));

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            {analysisData.analysisTitle}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom align="right">
            分析时间: {analysisData.analysisDateTime}
          </Typography>

          {/* 自定义文本展示区域 */}
          <Box sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body1">{customText1}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">{customText2}</Typography>
            </Paper>
          </Box>

          {/* 整体总结部分 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>整体表现总结</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              <Paper sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>朗读风格</Typography>
                <Typography>{analysisData.overallSummary.generalReadingStyle}</Typography>
              </Paper>
              <Paper sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>主要面部表现</Typography>
                <Typography>{analysisData.overallSummary.mostProminentFacialCueOverall}</Typography>
              </Paper>
              <Paper sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>主要声音特征</Typography>
                <Typography>{analysisData.overallSummary.mostProminentVocalCueOverall}</Typography>
              </Paper>
            </Box>
          </Box>

          {/* 语音特征可视化 */}
          <Box sx={{ mb: 4, height: 300 }}>
            <Typography variant="h5" gutterBottom>语音特征分析</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vocalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="语速" fill="#8884d8" />
                <Bar dataKey="音量" fill="#82ca9d" />
                <Bar dataKey="音调" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 分段分析 */}
          <Box>
            <Typography variant="h5" gutterBottom>详细分段分析</Typography>
            {analysisData.segmentedAnalysis.map((segment) => (
              <Paper key={segment.segmentIndex} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  段落 {segment.segmentIndex}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  文本内容：{segment.textSegment}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>面部表现分析</Typography>
                    <Typography>主要表情：{segment.facialObservations.primaryExpression}</Typography>
                    <Typography>表情变化：{segment.facialObservations.expressionChangesDescription}</Typography>
                    <Typography>眼神：{segment.facialObservations.eyeGaze}</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>声音特征分析</Typography>
                    <Typography>语速：{segment.vocalObservations.pace}</Typography>
                    <Typography>音量：{segment.vocalObservations.volume}</Typography>
                    <Typography>音调：{segment.vocalObservations.pitch}</Typography>
                    <Typography>语气：{segment.vocalObservations.tone}</Typography>
                  </Paper>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="primary">解读与建议</Typography>
                  <Typography>{segment.potentialInterpretationSegment}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AnalysisReport; 