export default async function handler(req, res) {
    // CORS 설정 (외부 도메인에서 이 API를 호출할 수 있게 허용)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS 요청 처리 (브라우저 예비 요청 대응)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // 프론트엔드에서 보낸 데이터 수신
    const {
        brandName,       // 업체명
        managerName,     // 성함
        phoneNumber,     // 전화번호
        selectedSwatches,// 신청 상품 (배열 형태)
        requests,        // 요청사항
        shippingAddress, // 주소
        snsWebsite       // 인스타 / 웹사이트
    } = req.body;

    // 노션 API 설정 정보
    const token = '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';
    const db_id = '33a563728910808daef4cfb6f40c0e7e';

    // 노션 데이터베이스 구조에 맞게 데이터 구성 (요청하신 순서 반영)
    const data = {
        parent: { database_id: db_id },
        properties: {
            '인입 일자': {
                date: { start: new Date().toISOString() }
            },
            '업체명': {
                title: [{ text: { content: brandName || '' } }]
            },
            '성함': {
                rich_text: [{ text: { content: managerName || '' } }]
            },
            '전화번호': {
                rich_text: [{ text: { content: phoneNumber || '' } }]
            },
            '신청 상품': {
                multi_select: Array.isArray(selectedSwatches)
                    ? selectedSwatches.map(item => ({ name: item.trim() }))
                    : []
            },
            '요청사항': {
                rich_text: [{ text: { content: requests || '' } }]
            },
            '주소': {
                rich_text: [{ text: { content: shippingAddress || '' } }]
            },
            '인스타 / 웹사이트': {
                rich_text: [{ text: { content: snsWebsite || '' } }]
            }
        }
    };

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Notion API Error');
        }
        
        // 성공 응답
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        // 에러 응답
        res.status(500).json({ error: err.message });
    }
}