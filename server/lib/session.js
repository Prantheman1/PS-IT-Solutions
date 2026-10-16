const jwt = require('jsonwebtoken');

const COOKIE = 'ps_session';

function secret() {
  return process.env.JWT_SECRET || 'ps-it-dev-secret-change-in-production';
}

function appUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function cookieValue(token, maxAge, name = COOKIE) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, provider: user.provider },
    secret(),
    { expiresIn: '7d' }
  );
}

function setSession(res, user) {
  res.setHeader('Set-Cookie', cookieValue(signUser(user), 60 * 60 * 24 * 7));
}

function clearSession(res) {
  res.setHeader('Set-Cookie', cookieValue('', 0));
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function readSession(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

module.exports = { appUrl, setSession, clearSession, readSession, googleConfigured, readCookie, cookieValue };
