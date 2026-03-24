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
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    // Log full result so we can debug
    console.log('Gemini result:', JSON.stringify(result));

    // Check for API error
    if (result?.error) {
      console.error('Gemini API error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Empty response from Gemini', raw: result });
    }

    res.status(200).json({ insight: text });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message });
  }
};