export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const body = await req.json();
    const response = await fetch('http://5.223.79.255:3000/api/cockpit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': req.headers.get('accept') || 'application/json',
        'x-cockpit-key': 'friday-cockpit-2026'
      },
      body: JSON.stringify(body)
    });

    if (req.headers.get('accept') === 'text/event-stream') {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
