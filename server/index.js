require('dotenv').config();
const express = require('express');
const { config, register, login, logout, me, googleStart, googleCallback } = require('./handlers');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.get('/api/auth/config', config);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', me);
app.get('/api/auth/google', googleStart);
app.get('/api/auth/google/callback', googleCallback);

app.listen(port, () => {
  console.log(`Auth API running at http://localhost:${port}`);
});
