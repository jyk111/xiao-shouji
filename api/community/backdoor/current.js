import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { getRotatingCode, getWindow, timingSafeEqualText } = require('../../../server/community-backdoor.cjs');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.COMMUNITY_BACKDOOR_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, message: 'method not allowed' });
    return;
  }
  const adminToken = process.env.COMMUNITY_BACKDOOR_ADMIN_TOKEN || '';
  const authHeader = req.headers.authorization || '';
  const token = String(authHeader).replace(/^Bearer\s+/i, '');
  if (!adminToken || !timingSafeEqualText(token, adminToken)) {
    res.status(401).json({ ok: false, message: 'unauthorized' });
    return;
  }
  const windowInfo = getWindow();
  res.status(200).json({
    ok: true,
    code: getRotatingCode(process.env.COMMUNITY_BACKDOOR_SECRET || ''),
    startsAt: windowInfo.startsAt,
    expiresAt: windowInfo.endsAt,
  });
}
