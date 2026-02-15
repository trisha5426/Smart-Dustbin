const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple admin endpoint: aggregate dustbin usage statistics
router.get('/stats', auth('admin'), (req, res) => {
  const { users, dustbins } = req.store;

  const dustbinUsage = {};
  users.forEach((u) => {
    u.scanHistory.forEach((scan) => {
      if (!dustbinUsage[scan.dustbinId]) {
        dustbinUsage[scan.dustbinId] = 0;
      }
      dustbinUsage[scan.dustbinId] += 1;
    });
  });

  const dustbinStats = dustbins.map((d) => ({
    dustbinId: d.dustbinId,
    location: d.location,
    scans: dustbinUsage[d.dustbinId] || 0,
  }));

  const totalScans = Object.values(dustbinUsage).reduce((sum, v) => sum + v, 0);
  const totalUsers = users.length;

  res.json({
    totalScans,
    totalUsers,
    dustbinStats,
  });
});

// Get recent scans across all users (who scanned last)
router.get('/recent-scans', auth('admin'), (req, res) => {
  const { users } = req.store;
  const limit = parseInt(req.query.limit) || 50;

  // Collect all scans with user info
  const allScans = [];
  users.forEach((user) => {
    user.scanHistory.forEach((scan) => {
      allScans.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        dustbinId: scan.dustbinId,
        timestamp: scan.timestamp,
      });
    });
  });

  // Sort by timestamp (most recent first)
  allScans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(allScans.slice(0, limit));
});

// Get all users with full details
router.get('/users', auth('admin'), (req, res) => {
  const { users } = req.store;
  // Return users without passwords
  const usersSafe = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    totalPoints: u.totalPoints,
    scanCount: u.scanHistory.length,
    role: u.role,
    createdAt: u.createdAt || null, // if we had this field
  }));
  res.json(usersSafe);
});

// Get single user details
router.get('/users/:id', auth('admin'), (req, res) => {
  const { users } = req.store;
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Return user without password
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    totalPoints: user.totalPoints,
    scanHistory: user.scanHistory,
    role: user.role,
  });
});

// Update user (points, role, etc.)
router.put('/users/:id', auth('admin'), (req, res) => {
  const { users } = req.store;
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent admin from modifying themselves in certain ways
  if (req.params.id === req.user.id && req.body.role && req.body.role !== 'admin') {
    return res.status(400).json({ message: 'Cannot remove admin role from yourself' });
  }

  // Update allowed fields
  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.totalPoints !== undefined) {
    const points = parseInt(req.body.totalPoints);
    if (!isNaN(points) && points >= 0) {
      user.totalPoints = points;
    }
  }
  if (req.body.role !== undefined && ['user', 'admin'].includes(req.body.role)) {
    user.role = req.body.role;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    totalPoints: user.totalPoints,
    role: user.role,
  });
});

// Delete user
router.delete('/users/:id', auth('admin'), (req, res) => {
  const { users, lastScans } = req.store;
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent admin from deleting themselves
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  // Remove user
  users.splice(userIndex, 1);
  // Clean up lastScans
  delete lastScans[req.params.id];

  res.json({ message: 'User deleted successfully' });
});

// Enhanced leaderboard with admin view (more details)
router.get('/leaderboard', auth('admin'), (req, res) => {
  const { users } = req.store;

  const sorted = [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name,
      email: u.email,
      totalPoints: u.totalPoints,
      scanCount: u.scanHistory.length,
      role: u.role,
      lastScan: u.scanHistory.length > 0 ? u.scanHistory[0].timestamp : null,
    }));

  res.json(sorted);
});

module.exports = router;


