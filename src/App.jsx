import React, { useState } from 'react';
import { Upload, Leaf, Heart, Sparkles, Camera } from 'lucide-react';

export default function PlantDiaryKit() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [entries, setEntries] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePlant = async () => {
    if (!image) return;
    
    setLoading(true);
    
    try {
      const base64Data = image.split(',')[1];
      
      const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: base64Data
                  }
                },
                {
                  type: "text",
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

      const data = await apiResponse.json();
      const textContent = data.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("");
      
      const cleanedText = textContent.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedText);
      
      setResponse(parsedResponse);
      
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN'),
        image,
        description,
        response: parsedResponse
      };
      
      setEntries([newEntry, ...entries]);
      
    } catch (error) {
      console.error('分析错误:', error);
      setResponse({
        plantMirroring: "抱歉，暂时无法完成分析。请稍后再试。",
        emotionalReflection: "",
        natureGuidance: ""
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setImage(null);
    setDescription('');
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Leaf className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Plant Diary Kit</h1>
          </div>
          <p className="text-gray-600 text-lg">让植物成为你的情绪镜子</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            今天的植物观察
          </h2>
          
          {!image ? (
            <label className="block">
              <div className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                <Upload className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">点击上传植物照片</p>
                <p className="text-sm text-gray-400">支持 JPG, PNG 格式</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Plant"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={resetForm}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white px-3 py-1 rounded-full text-sm text-gray-700"
                >
                  重新上传
                </button>
              </div>
              
              <textarea
                placeholder="写下你今天的观察或感受（选填）&#10;例如：叶子边缘开始泛黄了..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                rows="3"
              />
              
              <button
                onClick={analyzePlant}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始对话
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* AI Response */}
        {response && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">植物的回应</h2>
            
            <div className="space-y-6">
              {/* Plant Mirroring */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Leaf className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">植物观察回应</h3>
                    <p className="text-gray-700 leading-relaxed">{response.plantMirroring}</p>
                  </div>
                </div>
              </div>

              {/* Emotional Reflection */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Heart className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">情绪反射</h3>
                    <p className="text-gray-700 leading-relaxed">{response.emotionalReflection}</p>
                  </div>
                </div>
              </div>

              {/* Nature Guidance */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">自然启发</h3>
                    <p className="text-gray-700 leading-relaxed">{response.natureGuidance}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diary Entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">我的植物日记</h2>
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img
                      src={entry.image}
                      alt="Plant entry"
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">{entry.date}</p>
                      {entry.description && (
                        <p className="text-gray-700 text-sm mb-2 italic">"{entry.description}"</p>
                      )}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {entry.response.plantMirroring}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
