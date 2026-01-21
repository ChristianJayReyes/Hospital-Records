const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const DEMO_TOKEN = process.env.ADMIN_TOKEN || 'demo-token';

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({
      token: DEMO_TOKEN,
      user: { username },
    });
  }
  return res.status(401).json({ message: 'Invalid username or password' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});