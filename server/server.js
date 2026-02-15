const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const scanRoutes = require('./src/routes/scan');
const leaderboardRoutes = require('./src/routes/leaderboard');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_dev_key_change_me';

// Basic in-memory data store (mock DB)
const store = require('./src/store');

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Attach config & store to request
app.use((req, res, next) => {
  req.appConfig = { JWT_SECRET, scanCooldownMinutes: 5 };
  req.store = store;
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'Smart Dustbin API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Smart Dustbin server listening on port ${PORT}`);
});


