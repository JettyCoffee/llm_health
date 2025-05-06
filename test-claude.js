require('dotenv').config();

const CLAUDE_API_KEY = 'sk-ALXXaygI4QIkj315355f4e2cA38c47A9B589D2D0F71b09D5';
const CLAUDE_API_ENDPOINT = 'https://api.mjdjourney.cn/v1/chat/completions';

async function testClaudeAPI() {
  try {
    console.log("开始测试 Claude API...");
    
    const response = await fetch(CLAUDE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        messages: [{ role: "user", content: "你好，请给我一个简单的问候。" }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 错误 (${response.status}):`, errorText);
      return;
    }

    const result = await response.json();
    console.log("API 响应:", JSON.stringify(result, null, 2));

    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      console.log("\n回复内容:", result.choices[0].message.content);
    }
  } catch (error) {
    console.error("调用 API 时发生错误:", error);
  }
}

testClaudeAPI(); 