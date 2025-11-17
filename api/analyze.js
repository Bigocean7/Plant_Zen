// File: api/analyze.js
// Create this file in your GitHub repo at: api/analyze.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, description } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: image
                }
              },
              {
                type: 'text',
                text: `你是一个温柔的植物日记助手。用户上传了植物照片${description ? `，并写道："${description}"` : ''}。

请用中文回应，分三个维度：

1. **植物观察回应 (Plant Mirroring)** - 从植物的状态映射到用户的内心状态，让用户感到"被看见"。例如：
   - "你今天注意到叶子的纹理，是不是你也处在一个慢下来的状态？"
   - "你观察到枯萎边缘，我感受到你对变化的敏感。"

2. **人类情绪反射 (Emotional Reflection)** - 温柔地反映用户可能的情绪状态：
   - "从你今天的观察看，你似乎带着一点点思念。"
   - "你注意到这些细节，也许你最近在经历一些告别？"

3. **自然启发 (Nature-based Guidance)** - 提供温柔的、与自然连接的小建议：
   - "要不要花一分钟，试试看用手触摸那片叶子的温度？"
   - "今天可以试着写一句关于颜色的小诗。"

请用温暖、诗意的语言，避免说教。让用户感到被理解和陪伴。

请以JSON格式回复：
{
  "plantMirroring": "植物观察回应内容",
  "emotionalReflection": "情绪反射内容",
  "natureGuidance": "自然启发建议"
}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ 
        error: 'API request failed',
        details: data 
      });
    }

    const textContent = data.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('');

    const cleanedText = textContent.replace(/```json\n?|\n?```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedText);

    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
