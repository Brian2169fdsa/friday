export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Extract build ID and action from query or path
  const { id, action } = req.query;
  if (!id || !action) return res.status(400).json({ error: 'Missing id or action parameter' });

  const validActions = ['approve', 'request-changes', 'cancel'];
  if (!validActions.includes(action)) return res.status(400).json({ error: 'Invalid action' });

  try {
    const response = await fetch(`http://5.223.79.255:3000/api/build/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
