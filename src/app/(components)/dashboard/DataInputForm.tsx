'use client';
import React, { useState, useCallback } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, IconButton, Switch, FormControlLabel } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AnalyzeDataPayload, FacialData, VoiceData } from '@/types';
import { getLatestUserSummary } from '@/lib/db'; // 模拟从DB获取

interface DataInputFormProps {
  onSubmit: (data: AnalyzeDataPayload) => void;
  isLoading: boolean;
}

// 文件转换为Base64的辅助函数
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function DataInputForm({ onSubmit, isLoading }: DataInputFormProps) {
  const [facialFile, setFacialFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [heartRate, setHeartRate] = useState<string>('');
  const [includePreviousSummary, setIncludePreviousSummary] = useState<boolean>(false);
  const [previousSummaryForPrompt, setPreviousSummaryForPrompt] = useState<string | undefined>(undefined);

  const onDropFacial = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFacialFile(acceptedFiles[0]);
    }
  }, []);

  const onDropVoice = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setVoiceFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getFacialRootProps, getInputProps: getFacialInputProps, isDragActive: isFacialDragActive } = useDropzone({
    onDrop: onDropFacial,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
    maxFiles: 1,
  });

  const { getRootProps: getVoiceRootProps, getInputProps: getVoiceInputProps, isDragActive: isVoiceDragActive } = useDropzone({
    onDrop: onDropVoice,
    accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] },
    maxFiles: 1,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let facialData: FacialData | undefined = undefined;
    let voiceData: VoiceData | undefined = undefined;

    if (facialFile) {
      const base64 = await fileToBase64(facialFile);
      facialData = { fileName: facialFile.name, fileType: facialFile.type, base64Data: base64 };
    }
    if (voiceFile) {
      const base64 = await fileToBase64(voiceFile);
      voiceData = { fileName: voiceFile.name, fileType: voiceFile.type, base64Data: base64 };
    }

    let summaryToInclude: string | undefined = undefined;
    if (includePreviousSummary) {
      // 在真实应用中，这里应该有用户ID
      summaryToInclude = await getLatestUserSummary(null); 
      if (summaryToInclude) {
        console.log("包含上次总结到Prompt:", summaryToInclude);
      } else {
        console.log("未找到上次总结或选择不包含。");
      }
    }

    onSubmit({
      facialData,
      voiceData,
      heartRate: heartRate ? parseInt(heartRate, 10) : undefined,
      previousSummary: summaryToInclude,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* 面部数据上传 */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>面部图像 (可选)</Typography>
          <Paper 
            {...getFacialRootProps()} 
            variant="outlined" 
            sx={{
              p: 3, 
              textAlign: 'center', 
              cursor: 'pointer',
              backgroundColor: isFacialDragActive ? 'action.hover' : 'background.default',
              minHeight: '150px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <input {...getFacialInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            {facialFile ? (
              <Typography>{facialFile.name}</Typography>
            ) : (
              <Typography>拖拽图片文件到此处，或点击选择文件</Typography>
            )}
          </Paper>
          {facialFile && (
            <Box sx={{mt:1, display: 'flex', alignItems: 'center'}}>
                <Typography variant="caption" sx={{flexGrow: 1}}>{`已选: ${facialFile.name}`}</Typography>
                <IconButton onClick={() => setFacialFile(null)} size="small"><DeleteIcon /></IconButton>
            </Box>
          )}
        </Grid>

        {/* 声音数据上传 */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>声音片段 (可选)</Typography>
          <Paper 
            {...getVoiceRootProps()} 
            variant="outlined" 
            sx={{
              p: 3, 
              textAlign: 'center', 
              cursor: 'pointer',
              backgroundColor: isVoiceDragActive ? 'action.hover' : 'background.default',
              minHeight: '150px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <input {...getVoiceInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
            {voiceFile ? (
              <Typography>{voiceFile.name}</Typography>
            ) : (
              <Typography>拖拽音频文件到此处，或点击选择文件</Typography>
            )}
          </Paper>
          {voiceFile && (
             <Box sx={{mt:1, display: 'flex', alignItems: 'center'}}>
                <Typography variant="caption" sx={{flexGrow: 1}}>{`已选: ${voiceFile.name}`}</Typography>
                <IconButton onClick={() => setVoiceFile(null)} size="small"><DeleteIcon /></IconButton>
            </Box>
          )}
        </Grid>

        {/* 心率输入 */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="当前心率 (bpm, 可选)"
            variant="outlined"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            InputProps={{ inputProps: { min: 30, max: 220 } }}
          />
        </Grid>
        
        {/* 是否包含历史总结 */}
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={includePreviousSummary} onChange={(e) => setIncludePreviousSummary(e.target.checked)} />}
            label="在分析中参考上一次的总结 (如果存在)？"
          />
        </Grid>

        <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
          <Button type="submit" variant="contained" size="large" disabled={isLoading || (!facialFile && !voiceFile && !heartRate)}>
            {isLoading ? '正在提交...' : '开始分析'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
} 