'use client';

import { useState, useEffect, useRef } from 'react';

interface VideoProcessorState {
  isReady: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  statusMessage: string | null;
}

interface VideoProcessorHook {
  state: VideoProcessorState;
  convertWebmToMp4: (videoBlob: Blob) => Promise<File | null>;
}

export default function useVideoProcessor(): VideoProcessorHook {
  const [state, setState] = useState<VideoProcessorState>({
    isReady: false,
    isLoading: false,
    isProcessing: false,
    progress: 0,
    error: null,
    statusMessage: null
  });

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 检查浏览器是否支持 SharedArrayBuffer
    const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';
    
    if (!isSharedArrayBufferSupported) {
      setState(prev => ({
        ...prev,
        error: '您的浏览器不支持视频转换所需的功能。请尝试使用最新版本的 Chrome 或 Firefox。'
      }));
      return;
    }

    // 仅在客户端环境下创建 Worker
    if (typeof window !== 'undefined') {
      try {
        const worker = new Worker('/ffmpeg-worker.js', { type: 'module' });
        
        worker.onmessage = (event) => {
          const { type, message, progress, result } = event.data;
          
          switch (type) {
            case 'ready':
              setState(prev => ({ ...prev, isReady: true }));
              break;
              
            case 'progress':
              setState(prev => ({
                ...prev,
                statusMessage: message,
                progress: progress || prev.progress
              }));
              break;
              
            case 'complete':
              setState(prev => ({
                ...prev,
                isProcessing: false,
                statusMessage: '处理完成',
                progress: 1
              }));
              break;
              
            case 'error':
              setState(prev => ({
                ...prev,
                isProcessing: false,
                error: message,
                statusMessage: null
              }));
              break;
          }
        };
        
        worker.onerror = (error) => {
          console.error('Worker 错误:', error);
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: '视频处理失败: ' + error.message,
            statusMessage: null
          }));
        };
        
        workerRef.current = worker;
        
      } catch (error) {
        console.error('创建 Worker 失败:', error);
        setState(prev => ({
          ...prev,
          error: '无法初始化视频处理功能: ' + (error as Error).message
        }));
      }
    }
    
    // 在组件卸载时终止 worker
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);
  const convertWebmToMp4 = async (videoBlob: Blob): Promise<File | null> => {
    if (!workerRef.current) {
      setState(prev => ({
        ...prev,
        error: '视频处理器未初始化'
      }));
      return null;
    }
    
    // 验证视频类型
    const isWebm = videoBlob.type.includes('webm');
    const isMp4 = videoBlob.type.includes('mp4');
    
    // 如果已经是MP4格式，可以直接返回
    if (isMp4) {
      console.log('视频已经是MP4格式，无需转换');
      return new File([videoBlob], `mp4-${Date.now()}.mp4`, { type: 'video/mp4' });
    }
    
    // 如果既不是WebM也不是MP4，提示格式不支持
    if (!isWebm && !isMp4) {
      setState(prev => ({
        ...prev,
        error: `不支持的视频格式: ${videoBlob.type || '未知'}`
      }));
      return null;
    }
    
    setState({
      isReady: true,
      isLoading: false,
      isProcessing: true,
      progress: 0,
      error: null,
      statusMessage: '开始处理视频...'
    });
      return new Promise((resolve) => {
      // 设置超时（2分钟）
      const timeoutId = setTimeout(() => {
        workerRef.current?.removeEventListener('message', handleMessage);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: '视频处理超时，请尝试较短的视频或降低视频质量',
          statusMessage: null
        }));
        resolve(null);
      }, 120000);
      
      // 创建一个响应 worker 消息的处理函数
      const handleMessage = (event: MessageEvent) => {
        const { type, result, message } = event.data;
        
        if (type === 'complete' && result) {
          // 清除超时
          clearTimeout(timeoutId);
          
          // 创建一个新的 File 对象，使用 MP4 MIME 类型
          const mp4File = new File(
            [result], 
            `converted-${Date.now()}.mp4`, 
            { type: 'video/mp4' }
          );
          
          // 清理消息监听器
          workerRef.current?.removeEventListener('message', handleMessage);
          
          resolve(mp4File);        } else if (type === 'error') {
          // 清除超时
          clearTimeout(timeoutId);
          
          // 记录错误状态
          setState(prev => ({
            ...prev,
            isProcessing: false,
            error: message || '视频处理失败，请尝试不同的视频',
            statusMessage: null
          }));
          workerRef.current?.removeEventListener('message', handleMessage);
          resolve(null);
        } else if (type === 'progress') {
          // 更新进度信息，但不需要任何处理
        }
      };
      
      // 添加临时消息监听器
      workerRef.current?.addEventListener('message', handleMessage);
      
      // 错误处理
      const errorHandler = (error: ErrorEvent) => {
        clearTimeout(timeoutId);
        console.error('Worker 错误:', error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: `视频处理错误: ${error.message || '未知错误'}`,
          statusMessage: null
        }));
        workerRef.current?.removeEventListener('error', errorHandler);
        resolve(null);
      };
      
      workerRef.current?.addEventListener('error', errorHandler);
      
      // 向 worker 发送转换命令
      try {
        workerRef.current?.postMessage({
          type: 'convert',
          payload: {
            videoBlob,
            fileName: `recording-${Date.now()}`
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('发送消息到 Worker 失败:', error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: `无法发送视频到处理器: ${(error as Error).message || '未知错误'}`,
          statusMessage: null
        }));
        resolve(null);
      }
    });
  };

  return {
    state,
    convertWebmToMp4
  };
}
