import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { getRotatingCode, getWindow, timingSafeEqualText } = require('../../../server/community-backdoor.cjs');
const hundredYearsMs = 100 * 365 * 24 * 60 * 60 * 1000;

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.COMMUNITY_BACKDOOR_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'method not allowed' });
    return;
  }
  let body;
  try {
    body = await readBody(req);
  } catch {
    res.status(400).json({ ok: false, message: 'invalid json' });
    return;
  }
  const code = String(body?.code || '').trim();
  const staticCode = process.env.COMMUNITY_BACKDOOR_STATIC_CODE || '';
  const rotatingCode = getRotatingCode(process.env.COMMUNITY_BACKDOOR_SECRET || '');
  const staticOk = Boolean(staticCode) && timingSafeEqualText(code, staticCode);
  const rotatingOk = Boolean(rotatingCode) && timingSafeEqualText(code, rotatingCode);
  if (!staticOk && !rotatingOk) {
    res.status(401).json({ ok: false, message: '后门通行码不对。' });
    return;
  }
  res.status(200).json({
    ok: true,
    mode: staticOk ? 'static' : 'rotating',
    expiresAt: staticOk ? Date.now() + hundredYearsMs : getWindow().endsAt,
  });
}
