# 视频格式转换说明

## 当前实现

本项目使用WebM格式录制视频，并通过FFmpeg.wasm在浏览器中将WebM转换为MP4格式。这种实现方式有以下优点：

1. 完全在前端处理，不需要上传大文件到服务器
2. 使用Web Worker在后台线程中进行转换，不会阻塞UI
3. 利用FFmpeg的强大功能进行高质量的视频转换

## 优化参数

根据参考资料，我们对FFmpeg转换参数进行了优化：

```javascript
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
```

## 使用方法

视频处理器Hook的使用方法：

```typescript
// 在组件中引入
import useVideoProcessor from '../utils/useVideoProcessor';

// 使用Hook
const { state, convertWebmToMp4 } = useVideoProcessor();

// 在需要转换视频的地方调用
const handleConvert = async (videoBlob: Blob) => {
  try {
    // 开始转换
    const mp4File = await convertWebmToMp4(videoBlob);
    
    if (mp4File) {
      // 转换成功，mp4File是一个File对象，可以使用或上传
      console.log('转换成功:', mp4File);
    } else {
      // 转换失败
      console.error('转换失败:', state.error);
    }
  } catch (error) {
    console.error('转换过程出错:', error);
  }
};
```

## 状态监控

可以通过`state`对象监控转换进度和状态：

```typescript
// 监控状态
useEffect(() => {
  if (state.isProcessing) {
    console.log('处理进度:', Math.round(state.progress * 100) + '%');
    console.log('状态消息:', state.statusMessage);
  }
  
  if (state.error) {
    console.error('处理错误:', state.error);
  }
}, [state]);
```

## 服务器端替代方案

如果需要在服务器端进行转换（例如处理大型文件或节省客户端资源），可以参考使用以下技术：

1. 使用JavaCV (基于FFmpeg的Java绑定)
2. 使用FFmpeg命令行工具和Node.js子进程
3. 使用第三方API服务

服务器端SpringBoot示例代码（使用JavaCV）：

```java
public File convertWebmToMp4(File webmFile) {
    FFmpegFrameGrabber frameGrabber = new FFmpegFrameGrabber(webmFile);
    Frame capturedFrame = null;
    FFmpegFrameRecorder recorder = null;
    
    try {
        frameGrabber.start();
        
        String outputPath = webmFile.getAbsolutePath() + ".mp4";
        File outputFile = new File(outputPath);
        
        recorder = new FFmpegFrameRecorder(
            outputFile, 
            frameGrabber.getImageWidth(), 
            frameGrabber.getImageHeight(), 
            frameGrabber.getAudioChannels()
        );
        
        recorder.setVideoCodec(avcodec.AV_CODEC_ID_H264);
        recorder.setFormat("mp4");
        recorder.setSampleRate(frameGrabber.getSampleRate());
        recorder.setFrameRate(frameGrabber.getFrameRate());
        recorder.setVideoBitrate(10 * 1024 * 1024);
        recorder.start();
        
        while ((capturedFrame = frameGrabber.grabFrame()) != null) {
            recorder.setTimestamp(frameGrabber.getTimestamp());
            recorder.record(capturedFrame);
        }
        
        recorder.stop();
        recorder.release();
        frameGrabber.stop();
        
        return outputFile;
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
```
