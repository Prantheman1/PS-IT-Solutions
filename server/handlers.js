const bcrypt = require('bcryptjs');
const { randomBytes, timingSafeEqual } = require('node:crypto');
const { publicUser, findByEmail, upsert } = require('./lib/users');
const { appUrl, setSession, clearSession, readSession, googleConfigured, readCookie, cookieValue } = require('./lib/session');

const GOOGLE_STATE_COOKIE = 'ps_google_state';

function googleFailure(res) {
  res.statusCode = 302;
  res.setHeader('Location', `${appUrl()}/?auth_error=google#login`);
  res.end();
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return {};
  }
}

function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  const url = new URL(req.url, 'http://localhost');
  return Object.fromEntries(url.searchParams);
}

function config(_req, res) {
  send(res, 200, { google: googleConfigured() });
}

async function register(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
  const { name, email, password } = await parseBody(req);
  if (!name?.trim() || !email?.trim() || !password) {
    return send(res, 400, { error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return send(res, 400, { error: 'Password must be at least 6 characters.' });
  }
  const normalized = email.trim().toLowerCase();
  if (findByEmail(normalized)) {
    return send(res, 409, { error: 'An account with this email already exists.' });
  }
  const user = upsert({
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash: bcrypt.hashSync(password, 10),
    provider: 'password',
  });
  setSession(res, user);
  return send(res, 201, { user: publicUser(user) });
  } catch (error) {
    return send(res, error.status || 500, { error: error.message || 'Could not create the account.' });
  }
}

async function login(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  const { email, password } = await parseBody(req);
  if (!email?.trim() || !password) {
    return send(res, 400, { error: 'Email and password are required.' });
  }
  const user = findByEmail(email.trim().toLowerCase());
  if (!user?.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    return send(res, 401, { error: 'Invalid email or password.' });
  }
  setSession(res, user);
  return send(res, 200, { user: publicUser(user) });
}

function logout(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  clearSession(res);
  return send(res, 200, { ok: true });
}

function me(req, res) {
  const session = readSession(req);
  if (!session) return send(res, 401, { error: 'Not signed in.' });
  return send(res, 200, {
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      provider: session.provider,
    },
  });
}

function googleStart(_req, res) {
  if (!googleConfigured()) {
    return send(res, 503, {
      error: 'Google sign-in needs a Google client ID and secret in the server settings.',
    });
  }
  const redirectUri = `${appUrl()}/api/auth/google/callback`;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  const state = randomBytes(32).toString('hex');
  url.searchParams.set('state', state);
  res.setHeader('Set-Cookie', cookieValue(state, 600, GOOGLE_STATE_COOKIE));
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
}

async function googleCallback(req, res) {
  const query = queryOf(req);
  if (!googleConfigured()) {
    return send(res, 503, { error: 'Google sign-in is not configured.' });
  }
  let expectedState;
  try { expectedState = readCookie(req, GOOGLE_STATE_COOKIE); } catch { expectedState = ''; }
  res.setHeader('Set-Cookie', cookieValue('', 0, GOOGLE_STATE_COOKIE));
  const receivedState = typeof query.state === 'string' ? query.state : '';
  if (!expectedState || Buffer.byteLength(expectedState) !== Buffer.byteLength(receivedState) ||
      !timingSafeEqual(Buffer.from(expectedState), Buffer.from(receivedState)) || query.error || typeof query.code !== 'string') {
    return googleFailure(res);
  }

  try {
  const redirectUri = `${appUrl()}/api/auth/google/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: query.code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const token = await tokenRes.json();
  if (!tokenRes.ok || !token.access_token) return googleFailure(res);

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.email || !profile.sub || profile.email_verified !== true) return googleFailure(res);

  const email = profile.email.toLowerCase();
  const existing = findByEmail(email);
  if (existing?.googleId && existing.googleId !== profile.sub) return googleFailure(res);
  const user = upsert({
    id: existing?.id || crypto.randomUUID(),
    name: existing?.name || profile.name || email,
    email,
    passwordHash: existing?.passwordHash || null,
    provider: 'google',
    googleId: profile.sub,
  });
  setSession(res, user);
  res.setHeader('Set-Cookie', [res.getHeader('Set-Cookie'), cookieValue('', 0, GOOGLE_STATE_COOKIE)]);
  res.statusCode = 302;
  res.setHeader('Location', `${appUrl()}/`);
  res.end();
  } catch {
    return googleFailure(res);
  }
}

module.exports = { config, register, login, logout, me, googleStart, googleCallback };
