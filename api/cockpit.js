export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const response = await fetch('http://5.223.79.255:3000/api/cockpit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cockpit-key': 'friday-cockpit-2026'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
