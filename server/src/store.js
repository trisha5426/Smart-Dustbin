// Simple in-memory mock database for demo purposes.
// NOTE: Data resets when the server restarts.

const bcrypt = require('bcryptjs');

// Seed users and dustbins
const users = [];
const dustbins = [
  { dustbinId: 'DB101', location: 'Central Park - Gate 1', qrCodeId: 'QR_DB101' },
  { dustbinId: 'DB102', location: 'City Mall - Entrance', qrCodeId: 'QR_DB102' },
  { dustbinId: 'DB103', location: 'Metro Station - Platform 2', qrCodeId: 'QR_DB103' },
];

// Structure: { [userId]: { [dustbinId]: timestamp } }
const lastScans = {};

let userIdCounter = 1;

// Optional: seed an admin user for demo/admin dashboard access
// Login with: admin@smartcity.test / admin123
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
users.push({
  id: String(userIdCounter++),
  name: 'City Admin',
  email: 'admin@smartcity.test',
  password: adminPasswordHash,
  totalPoints: 0,
  scanHistory: [],
  role: 'admin',
});

function createUser({ name, email, password }) {
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User already exists');
  }
  const hashed = bcrypt.hashSync(password, 10);
  const user = {
    id: String(userIdCounter++),
    name,
    email,
    password: hashed,
    totalPoints: 0,
    scanHistory: [], // { dustbinId, timestamp }
    role: 'user',
  };
  users.push(user);
  return user;
}

module.exports = {
  users,
  dustbins,
  lastScans,
  createUser,
};


