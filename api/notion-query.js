export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const token = process.env.NOTION_TOKEN;
  const db_id = process.env.NOTION_EVENTS_DB_ID;

  const response = await fetch(`https://api.notion.com/v1/databases/${db_id}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify(req.body || {}),
  });
  const data = await response.json();
  res.status(200).json(data);
}
