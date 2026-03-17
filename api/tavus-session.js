// /api/tavus-session.js — Vercel serverless function
// Handles Tavus conversation create + end
// Keeps TAVUS_API_KEY server-side only

export default async function handler(req, res) {
  // CORS — allow Vercel preview URLs and production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  // Supabase available server-side if needed for context injection
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fmemdogudiolevqsfuvd.supabase.co';
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZW1kb2d1ZGlvbGV2cXNmdXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcwNTQ2MiwiZXhwIjoyMDg5MjgxNDYyfQ.PXBm_m4Qcf2izPmh2d_loiFGfUKlqKqm4QhyY2x89BA';
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TAVUS_API_KEY = process.env.TAVUS_API_KEY || '73f598fed5d144f7b8c7fbce93767e65';
  if (!TAVUS_API_KEY) {
    return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  }

  const { action, conversation_id, user_name, user_email } = req.body;

  // ── CREATE ──────────────────────────────────────────────
  if (action === 'create') {
    try {
      const resp = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY
        },
        body: JSON.stringify({
          replica_id: process.env.TAVUS_REPLICA_ID || 'ree20a3c764c',
          persona_id: process.env.TAVUS_PERSONA_ID || 'p01210ec019e',
          conversation_name: `FRIDAY — ${user_name || 'Team'} — ${new Date().toISOString()}`,
          conversational_context: `You are on a live video call with ${user_name || 'a ManageAI team member'}${user_email ? ' (' + user_email + ')' : ''}. They may ask about active builds, client status, ticket queue, pricing, or pipeline health. Use your tools to pull live data before answering status questions.`,
          properties: {
            max_call_duration: 1800,
            participant_left_timeout: 30,
            enable_recording: false,
            apply_greenscreen: false
          }
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error('[Tavus] Create failed:', data);
        return res.status(resp.status).json({ error: data.message || 'Tavus create failed', details: data });
      }

      return res.status(200).json({
        conversation_id: data.conversation_id,
        conversation_url: data.conversation_url,
        status: data.status
      });

    } catch (err) {
      console.error('[Tavus] Create error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── END ─────────────────────────────────────────────────
  if (action === 'end') {
    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id required' });
    }
    try {
      await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
        method: 'POST',
        headers: { 'x-api-key': TAVUS_API_KEY }
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      // Non-fatal — session may have already ended
      return res.status(200).json({ ok: true, note: err.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use create or end.' });
}
