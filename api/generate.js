export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel.' });
  }

  const { prompt, systemPrompt, isJson } = req.body;

  try {
    // 最新の Gemini 2.5 Flash に変更
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error details:", errText);
      // 詳細なエラーをフロントに返す
      return res.status(response.status).json({ error: `Gemini API エラー (${response.status}): ${errText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    return res.status(500).json({ error: `サーバー内部エラー: ${error.message}` });
  }
}
