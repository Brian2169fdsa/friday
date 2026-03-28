export default async function handler(req, res) {
  try {
    const response = await fetch('http://5.223.79.255:3000/api/cockpit/n8n-audit', {
      headers: { 'x-cockpit-key': 'friday-cockpit-2026' }
    });
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
