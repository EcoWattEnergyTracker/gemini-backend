module.exports = async function handler(req, res) {
  try {
    const prompt =
      req.method === 'POST' && req.body?.prompt
        ? req.body.prompt
        : 'Give one practical energy saving tip in 2 sentences.';

    const https = require('https');

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const result = await new Promise((resolve, reject) => {
      const reqHttp = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => resolve(JSON.parse(data)));
      });
      reqHttp.on('error', reject);
      reqHttp.write(postData);
      reqHttp.end();
    });

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Stay Strong';

    res.status(200).json({ insight: text });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message });
  }
};