import React, { useEffect, useState } from 'react';
import { api } from '../../auth/api';
import { useAuth } from '../../auth/AuthContext';
import './Account.css';

function GoogleMark() {
  return (
    <svg className="account__google-mark" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.9 10.7A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.2.3-1.7V5H.9a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15.1 2A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  );
}

export default function Account() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    api.config().then((data) => setGoogleReady(Boolean(data.google))).catch(() => setGoogleReady(false));
  }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account" id="login">
      <p className="account__brand">PS IT Solutions</p>
      <div className="account__card">
        <p className="account__kicker">Client account</p>
        <h1>{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
        <p className="account__intro">
          Sign in to enter the site. You can use an email and password, or an existing Google account.
        </p>

        <div className="account__tabs">
          <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setError(''); }}>
            Sign in
          </button>
          <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => { setMode('signup'); setError(''); }}>
            Create account
          </button>
        </div>

        {error && <p className="account__error" role="alert">{error}</p>}

        <form onSubmit={onSubmit} className="account__form">
          {mode === 'signup' && (
            <label>
              Full name
              <input name="name" value={form.name} onChange={update} autoComplete="name" required />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
          </label>
          <button type="submit" className="account__submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="account__divider"><span>or</span></div>

        {googleReady ? (
          <a className="account__google" href="/api/auth/google">
            <GoogleMark />
            Continue with Google
          </a>
        ) : (
          <p className="account__note">
            Google sign-in is ready in the app. It turns on after a Google client ID and secret are added in Vercel.
          </p>
        )}
      </div>
    </section>
  );
}
