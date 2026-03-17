export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  }

  const { action, user_name, user_email, persona, conversation_id } = req.body;

  const REPLICA_ID = 'ree20a3c764c';
  const PERSONA_ID = 'p01210ec019e';

  if (action === 'create') {
    try {
      const resp = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        },
        body: JSON.stringify({
          replica_id: REPLICA_ID,
          persona_id: PERSONA_ID,
          conversation_name: `FRIDAY session — ${user_name || 'User'}`,
          properties: {
            user_name: user_name || 'User',
            user_email: user_email || ''
          }
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(resp.status).json({ error: data.message || 'Tavus API error' });
      }
      return res.status(200).json({
        conversation_id: data.conversation_id,
        conversation_url: data.conversation_url
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (action === 'end' && conversation_id) {
    try {
      await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        }
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
