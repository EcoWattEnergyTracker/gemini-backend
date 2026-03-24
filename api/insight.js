export default async function handler(req, res) {
  try {
    const prompt =
      req.method === 'POST' && req.body?.prompt
        ? req.body.prompt
        : 'Give one practical energy saving tip in 2 sentences.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Stay Strong';

    res.status(200).json({ insight: text });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
}