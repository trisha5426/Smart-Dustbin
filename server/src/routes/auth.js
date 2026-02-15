const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// MongoDB-style User schema (for reference, not used directly in mock DB)
// const mongoose = require('mongoose');
// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   totalPoints: { type: Number, default: 0 },
//   scanHistory: [
//     {
//       dustbinId: String,
//       timestamp: Date,
//     },
//   ],
//   role: { type: String, default: 'user' },
// });

function signToken(user, secret) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
}

router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { createUser, users } = req.store;

    const user = createUser({ name, email, password });
    const token = signToken(user, req.appConfig.JWT_SECRET);

    res
      .cookie('token', token, {
        httpOnly: false, // For demo; set true and sameSite/secure in production
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          totalPoints: user.totalPoints,
        },
        token,
      });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Signup failed' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { users } = req.store;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user, req.appConfig.JWT_SECRET);

  return res
    .cookie('token', token, {
      httpOnly: false,
    })
    .json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        totalPoints: user.totalPoints,
      },
      token,
    });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
  // Lightweight "who am I" based on token (no DB lookup on every call)
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const decoded = jwt.verify(token, req.appConfig.JWT_SECRET);

    const { users } = req.store;
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      totalPoints: user.totalPoints,
      role: user.role,
      scanHistory: user.scanHistory,
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;


