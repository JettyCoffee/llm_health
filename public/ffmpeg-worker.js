// 这个 Worker 负责在后台线程中运行 FFmpeg 操作
// 使用 self 代替 window，因为我们在 Worker 上下文中

// 监听来自主线程的消息
self.onmessage = async (event) => {
  const { type, payload } = event.data;
  
  try {
    if (type === 'convert') {
      // 通知主线程我们开始加载 FFmpeg
      self.postMessage({ type: 'progress', message: '正在加载 FFmpeg...' });
      
      // 动态导入 FFmpeg 模块
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile } = await import('@ffmpeg/util');
      const { toBlobURL } = await import('@ffmpeg/util');
      
      // 创建 FFmpeg 实例
      const ffmpeg = new FFmpeg();
      
      // 设置进度回调
      ffmpeg.on('progress', ({ progress, time }) => {
        self.postMessage({ 
          type: 'progress', 
          message: `转换中... ${(progress * 100).toFixed(0)}%`,
          progress
        });
      });
      
      // 加载 FFmpeg 核心
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      self.postMessage({ type: 'progress', message: 'FFmpeg 已加载，开始处理视频...' });
      
      // 获取传入的视频数据
      const { videoBlob, fileName } = payload;
      
      // 写入输入文件
      const inputFileName = 'input.' + (videoBlob.type.includes('webm') ? 'webm' : 'mp4');
      await ffmpeg.writeFile(inputFileName, await fetchFile(videoBlob));
      
      const outputFileName = 'output.mp4';
        // 执行转换命令
      // 优化视频压缩参数，平衡质量和文件大小
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:v', 'libx264',        // H.264 视频编码
        '-crf', '23',             // 压缩质量 (0-51)，23提供更好的质量平衡
        '-preset', 'medium',      // 编码速度预设，medium在速度和质量间取得平衡
        '-profile:v', 'baseline', // 使用基线配置文件以提高兼容性
        '-level', '3.0',          // 设置H.264级别以提高兼容性
        '-pix_fmt', 'yuv420p',    // 设置像素格式以提高兼容性
        '-c:a', 'aac',            // AAC 音频编码
        '-b:a', '128k',           // 音频比特率
        '-ar', '44100',           // 音频采样率
        '-movflags', '+faststart', // 优化在线播放
        outputFileName
      ]);
      
      self.postMessage({ type: 'progress', message: '视频处理完成，准备输出...' });
      
      // 读取输出文件
      const data = await ffmpeg.readFile(outputFileName);
      
      // 从 Uint8Array 创建 Blob 对象
      const outputBlob = new Blob([data], { type: 'video/mp4' });
      
      // 发送处理后的视频回主线程
      self.postMessage({
        type: 'complete',
        result: outputBlob
      });
      
      // 清理
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      
    } else {
      self.postMessage({ type: 'error', message: '未知操作类型' });
    }  } catch (error) {
    console.error('Worker 错误:', error);
    self.postMessage({ 
      type: 'error', 
      message: '视频处理失败: ' + ((error && error.message) ? error.message : '未知错误') 
    });
  }
};

// 通知主线程 worker 已经准备好了
self.postMessage({ type: 'ready' });
