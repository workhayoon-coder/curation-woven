export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { event_type, fabric_name, fabric_id, session_id, device_type, extra } = req.body;

  const token = process.env.NOTION_TOKEN;
  const db_id = process.env.NOTION_EVENTS_DB_ID;

  if (!token || !db_id) return res.status(500).json({ error: 'Missing env vars' });

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: db_id },
        properties: {
          'fabric_name':  { title:     [{ text: { content: fabric_name || '(unknown)' } }] },
          'event_type':   { select:    { name: event_type || 'unknown' } },
          'fabric_id':    { rich_text: [{ text: { content: fabric_id  || '' } }] },
          'timestamp':    { date:      { start: new Date().toISOString() } },
          'session_id':   { rich_text: [{ text: { content: session_id || '' } }] },
          'device_type':  { select:    { name: device_type || 'PC' } },
          'extra':        { rich_text: [{ text: { content: extra ? JSON.stringify(extra) : '' } }] },
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Notion API Error');
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
