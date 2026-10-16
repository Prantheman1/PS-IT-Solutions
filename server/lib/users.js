const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', '..', 'data', 'users.json');

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
  } catch {
    const error = new Error('This server cannot store accounts yet. Add a database in Vercel for the live site.');
    error.status = 500;
    throw error;
  }
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
  };
}

function findByEmail(email) {
  return readUsers().find((user) => user.email === email.toLowerCase());
}

function upsert(user) {
  const users = readUsers();
  const index = users.findIndex((item) => item.id === user.id || item.email === user.email);
  if (index === -1) users.push(user);
  else users[index] = user;
  writeUsers(users);
  return user;
}

module.exports = { readUsers, publicUser, findByEmail, upsert };
