// Lightweight proxy to call OpenAI without exposing your API key to the client.
// Run with: npm run server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // v2

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors()); // tighten in production
app.use(express.json({ limit: '1mb' }));

app.post('/api/wise', async (req, res) => {
  try {
    const messages = req.body?.messages;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }
    const body = {
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
    };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Wise proxy listening on http://localhost:${PORT}`);
});


