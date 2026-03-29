export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const response = await fetch('http://5.223.79.255:3000/api/cockpit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': req.headers['accept'] || 'application/json',
        'x-cockpit-key': 'friday-cockpit-2026'
      },
      body: JSON.stringify(req.body)
    });

    if (req.headers['accept'] === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { res.end(); break; }
          res.write(value);
        }
      };
      await pump();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
