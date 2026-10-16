async function request(path, options = {}) {
  if (typeof fetch !== 'function') {
    throw new Error('Sign-in server is unavailable.');
  }

  const headers = { ...options.headers };
  if (options.body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers,
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Sign-in server is offline. Run npm run dev, then try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export const api = {
  config: () => request('/api/auth/config'),
  me: () => request('/api/auth/me'),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
};
