// Vercel Serverless 代理（浏览器可跨域）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { keyword, sell } = req.query;
  const APPID = '437344a0', APIKEY = 'c31236d8a66ab036acb0b2242f21f522', APISec = 'NDc4OWM5ZDIwZTc5ZWIzZDQwMTc3Nzlm';
  const host = 'maas-api.cn-huabei-1.xf-yun.com', path = '/v1/chat/completions';
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  const signature = await crypto.subtle.importKey('raw', new TextEncoder().encode(APISec), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signatureOrigin)))
    .then(sig => btoa(String.fromCharCode(...new Uint8Array(sig))));
  const authorization = `api_key="${APIKEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

  const resp = await fetch(`https://${host}${path}`, {
    method: 'POST',
    headers: { Authorization: authorization, Date: date, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'generalv3',
      temperature: 0.8,
      max_tokens: 120,
      messages: [{ role: 'user', content: `写 70 字内抖音文案，产品：${keyword}，卖点：${sell}，带 3 话题，口语化。` }]
    })
  });
  if (!resp.ok) return res.status(resp.status).send(await resp.text());
  const json = await resp.json();
  res.status(200).json({ text: json.choices[0].message.content });
}