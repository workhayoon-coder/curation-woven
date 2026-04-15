export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        brandName,
        brandCategory,
        managerName,
        phoneNumber,
        selectedSwatches,
        requests,
        shippingAddress,
        snsWebsite
    } = req.body;

    const token = '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';
    const db_id = '33a563728910808daef4cfb6f40c0e7e';

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: db_id },
                properties: {
                    '인입 일자': { date: { start: new Date().toISOString() } },
                    '업체명': { title: [{ text: { content: brandName || '' } }] },
                    '브랜드 카테고리': { multi_select: brandCategory ? [{ name: brandCategory }] : [] },
                    '성함': { rich_text: [{ text: { content: managerName || '' } }] },
                    '전화번호': { rich_text: [{ text: { content: phoneNumber || '' } }] },
                    '신청 상품': {
                        multi_select: Array.isArray(selectedSwatches)
                            ? selectedSwatches.map(item => ({ name: item.trim() }))
                            : []
                    },
                    '요청사항': { rich_text: [{ text: { content: requests || '' } }] },
                    '주소': { rich_text: [{ text: { content: shippingAddress || '' } }] },
                    '인스타 / 웹사이트': { rich_text: [{ text: { content: snsWebsite || '' } }] }
                }
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Notion API Error');
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
