import { AnalyzeDataPayload, LLMStage1Scores, LLMStage2Analysis } from "@/types";
import { getMultiModalAnalysisPrompt, getAdvicePrompt } from "./prompts";

// 这是一个模拟的LLM API客户端，您需要替换为实际的实现
// 例如: OpenAI, Google Gemini, Anthropic Claude 等

// 旧的API Key和Endpoint，保留作为参考或注释掉
// const LLM_API_KEY = process.env.LLM_API_KEY; // 从环境变量获取API Key
// const MULTIMODAL_LLM_ENDPOINT = process.env.MULTIMODAL_LLM_ENDPOINT; // 第一个LLM的API端点
// const TEXT_LLM_ENDPOINT = process.env.TEXT_LLM_ENDPOINT;       // 第二个LLM的API端点

const CLAUDE_API_KEY = "sk-ALXXaygI4QIkj315355f4e2cA38c47A9B589D2D0F71b09D5";
const CLAUDE_API_ENDPOINT = process.env.CLAUDE_API_ENDPOINT || "https://api.mjdjourney.cn/v1/chat/completions";

/**
 * 调用多模odal LLM进行第一阶段分析，获取打分。
 * @param payload - 输入数据
 * @param facial_image_description - (可选) 面部图像描述
 * @param voice_transcription - (可选) 声音转录
 */
export async function callMultiModalLLM(
  payload: AnalyzeDataPayload,
  facial_image_description?: string,
  voice_transcription?: string
): Promise<LLMStage1Scores> {
  // 保留此函数现有逻辑或根据需要更新为Claude API
  // 为演示目的，暂时让它继续使用模拟数据或之前的逻辑
  // 您可以稍后指示我如何修改这个函数以适配 Claude API
  if (!process.env.MULTIMODAL_LLM_ENDPOINT) { // 假设仍有特定的多模态端点或配置
    console.warn("多模态LLM API密钥或端点未配置 (callMultiModalLLM), 将使用模拟数据。");
    // 模拟成功响应 (用于测试)
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockScores: LLMStage1Scores = {
      facial_expression_assessment: { score: 7, details: "面部表情模拟分析。" },
      vocal_characteristics_assessment: { score: 6, details: "声音特征模拟分析。" },
      physiological_state_assessment: { score: 8, details: "心率模拟分析。" },
      estimated_stress_level: { score: 4, category: "低 (模拟)" },
      overall_wellbeing_score: { score: 7, trend_suggestion: "整体状态良好 (模拟)。" },
    };
    return mockScores;
  }
  
  // 如果要将此函数也切换到 Claude，请取消注释并修改以下部分：
  /*
  if (!CLAUDE_API_KEY || !CLAUDE_API_ENDPOINT) {
    console.error("Claude API Key 或 Endpoint 未在 callMultiModalLLM 中配置");
    return Promise.reject("Claude API Key 或 Endpoint 未配置，请检查 .env.local 文件。");
  }

  const prompt = getMultiModalAnalysisPrompt(payload, facial_image_description, voice_transcription);
  console.log("调用多模态LLM (Claude) Prompt:\n", prompt);

  try {
    const response = await fetch(CLAUDE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219", // 或者您希望用于此函数的模型
        messages: [{ role: "user", content: prompt }],
        // 根据需要添加其他参数: temperature, max_tokens, etc.
        // stream: false, // 如果API支持，并且您需要流式响应
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API (多模态) 错误: ${response.status}`, errorText);
      throw new Error(`Claude API (多模态) 错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    // 假设LLM的响应直接就是 LLMStage1Scores 结构，或者需要解析
    // 例如: result.choices[0].message.content 可能是包含JSON字符串的文本
    let parsedResult: LLMStage1Scores;
    if (typeof result.choices[0].message.content === 'string') {
      try {
        parsedResult = JSON.parse(result.choices[0].message.content);
      } catch (parseError) {
        console.error("解析 Claude (多模态) LLM响应失败:", parseError);
        console.error("原始响应内容:", result.choices[0].message.content);
        throw new Error("无法解析来自 Claude (多模态) LLM的响应，格式可能不正确。");
      }
    } else {
       // 如果API直接返回对象
       parsedResult = result.choices[0].message.content; // 或者更深层嵌套的对象
    }
    return parsedResult;

  } catch (error: any) {
    console.error("调用 Claude API (多模态) 失败:", error);
    throw error; // 或者返回一个错误结构
  }
  */

  // --- 以下为原模拟逻辑，如果上面的 Claude 调用被注释掉，则会执行这里 ---
  console.warn("警告: 正在使用多模态LLM的模拟响应 (callMultiModalLLM)!");
  await new Promise(resolve => setTimeout(resolve, 1500));
  const mockScores: LLMStage1Scores = {
    facial_expression_assessment: { score: 7, details: "面部表情整体积极，略带一丝疲惫。" },
    vocal_characteristics_assessment: { score: 6, details: "声音略显低沉，语速平缓。" },
    physiological_state_assessment: { score: 8, details: "心率处于正常平静范围。" },
    estimated_stress_level: { score: 4, category: "低" },
    overall_wellbeing_score: { score: 7, trend_suggestion: "整体状态良好，注意休息。" },
  };
  return mockScores;
}

/**
 * 调用文本LLM（例如Claude）获取第二阶段的分析和建议。
 * @param stage1Scores - 第一阶段的打分结果
 * @param previousSummary - (可选) 历史总结
 */
export async function callTextLLMForAdvice(
  stage1Scores: LLMStage1Scores,
  previousSummary?: string
): Promise<LLMStage2Analysis> {
  if (!CLAUDE_API_KEY || !CLAUDE_API_ENDPOINT) {
    console.error("Claude API Key 或 Endpoint 未配置");
    // throw new Error("Claude API Key 或 Endpoint 未配置，请检查.env.local文件。");
    return Promise.reject("Claude API Key 或 Endpoint 未配置，请检查 .env.local 文件。");
  }

  const prompt = getAdvicePrompt(stage1Scores, previousSummary);
  console.log("调用文本LLM (Claude) Prompt:\n", prompt);

  const modelToUse = "claude-3-5-sonnet-20241022"; // 使用您提供的模型名称

  try {
    const response = await fetch(CLAUDE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: "user", content: prompt }],
        // 根据API文档和需求添加其他参数，例如:
        // temperature: 0.7,
        // max_tokens: 1000, 
        // stream: false, // 您提供的API似乎不支持stream字段直接true/false，而是通过accept header控制？
                         // 或者根据OpenAI规范，stream: true/false 是标准用法。这里假设false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // 获取更详细的错误信息
      console.error(`Claude API (文本建议) 错误: ${response.status}`, errorText);
      throw new Error(`Claude API (文本建议) 错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Claude API (文本建议) 原始响应:", result);

    // 根据OpenAI兼容API的典型响应结构提取内容
    // 通常内容在 result.choices[0].message.content 中
    if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
      const content = result.choices[0].message.content;
      // 假设LLM被prompt严格要求返回JSON字符串
      try {
        const parsedAnalysis: LLMStage2Analysis = JSON.parse(content);
        return parsedAnalysis;
      } catch (parseError) {
        console.error("解析文本LLM (Claude) 响应JSON失败:", parseError);
        console.error("原始响应内容:", content);
        // 如果解析失败，但内容看起来是有效文本，可以尝试作为错误或回退处理
        // throw new Error("无法解析来自文本LLM (Claude) 的响应，响应内容不是有效的JSON。请检查LLM的Prompt，确保它严格返回JSON格式。");
         // 作为临时处理，如果不是JSON，我们返回一个包含原始文本的错误对象结构
        return Promise.reject(`LLM返回的不是预期的JSON格式。原始回复: ${content.substring(0, 500)}...`);
      }
    } else {
      console.error("文本LLM (Claude) 响应结构不符合预期:", result);
      throw new Error("文本LLM (Claude) 响应中未找到有效的聊天完成内容。");
    }

  } catch (error: any) {
    console.error("调用文本LLM (Claude) 获取建议失败:", error);
    // throw error; // 或者返回一个自定义的错误对象
    return Promise.reject(error.message || "调用文本LLM (Claude) 时发生未知错误。");
  }

  // --- 移除或注释掉原有的模拟响应 ---
  // console.warn("警告: 正在使用文本LLM的模拟响应!");
  // await new Promise(resolve => setTimeout(resolve, 2000));
  // const mockAnalysis: LLMStage2Analysis = {
  //   current_status_summary: "根据打分，您目前情绪稳定，生理指标良好，但略有疲态。",
  //   detailed_analysis: "### 详细分析\n- **面部表情 (7/10):** 积极但略显疲惫，建议关注休息。\n- **声音特征 (6/10):** 声音平稳但略低沉，可能与疲劳有关。\n- **生理状态 (8/10):** 心率正常，显示身体状态良好。",
  //   personalized_advice: "### 个性化建议\n1. **保证充足睡眠:** 至少7-8小时高质量睡眠。\n2. **适当放松:** 进行冥想或听音乐。\n3. **健康饮食:** 多摄入蔬菜水果。",
  //   follow_up_points: "### 后续关注点\n- 观察未来几天精力变化。\n- 如果疲惫感持续，考虑调整作息。",
  // };
  // return mockAnalysis;
}

 