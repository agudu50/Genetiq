const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: __dirname + '/.env' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const contents = [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/png', data: dummyBase64 } },
        { text: 'You MUST respond in valid JSON with this exact structure: { "status": "ok" }' }
      ]
    }
  ];

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json' }
      });
      console.log('RAW RESPONSE TEXT:', response.text);
  } catch(e) {
      console.error('ERROR:', e.message);
  }
}
test().catch(console.error);
