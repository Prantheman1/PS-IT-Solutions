const { test } = require('node:test');
const assert = require('node:assert/strict');
const { googleStart, googleCallback } = require('./handlers');

function response() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    getHeader(name) { return this.headers[name]; },
    end(body) { this.body = body; },
  };
}

test('Google authorization binds the callback to the initiating browser', async () => {
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
  const start = response();
  googleStart({}, start);
  const url = new URL(start.headers.Location);
  const state = url.searchParams.get('state');
  assert.equal(start.statusCode, 302);
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.match(state, /^[a-f0-9]{64}$/);
  assert.ok(start.headers['Set-Cookie'].includes(`ps_google_state=${state};`));
  assert.ok(start.headers['Set-Cookie'].includes('HttpOnly'));
  assert.ok(start.headers['Set-Cookie'].includes('Max-Age=600'));

  const originalFetch = global.fetch;
  let called = false;
  global.fetch = async () => { called = true; throw new Error('Must not exchange invalid callbacks'); };
  try {
    for (const query of [{ code: 'code' }, { code: 'code', state: 'wrong' }, { error: 'access_denied', state }]) {
      const res = response();
      await googleCallback({ query, headers: { cookie: `ps_google_state=${state}` } }, res);
      assert.equal(res.statusCode, 302);
      assert.match(res.headers.Location, /auth_error=google/);
      assert.ok(res.headers['Set-Cookie'].includes('Max-Age=0'));
    }
    assert.equal(called, false);

    // Provider failures return the user to the account page rather than hanging.
    const failed = response();
    await googleCallback({ query: { code: 'code', state }, headers: { cookie: `ps_google_state=${state}` } }, failed);
    assert.equal(called, true);
    assert.match(failed.headers.Location, /auth_error=google/);
  } finally {
    global.fetch = originalFetch;
  }
});
