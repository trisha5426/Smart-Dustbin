const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth(), (req, res) => {
  const { dustbinId } = req.body;
  const { users, dustbins, lastScans } = req.store;

  if (!dustbinId) {
    return res.status(400).json({ message: 'dustbinId is required' });
  }

  const dustbin = dustbins.find((d) => d.dustbinId === dustbinId);
  if (!dustbin) {
    return res.status(404).json({ message: 'Dustbin not found' });
  }

  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  const now = Date.now();
  const cooldownMs = req.appConfig.scanCooldownMinutes * 60 * 1000;

  if (!lastScans[user.id]) {
    lastScans[user.id] = {};
  }

  const lastScanTime = lastScans[user.id][dustbinId];
  if (lastScanTime && now - lastScanTime < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastScanTime)) / 60000);
    return res.status(429).json({
      message: `You recently scanned this dustbin. Try again in about ${remaining} minute(s).`,
    });
  }

  // Credit points and record scan
  user.totalPoints += 10;
  const scanEntry = { dustbinId, timestamp: new Date().toISOString() };
  user.scanHistory.unshift(scanEntry);
  user.scanHistory = user.scanHistory.slice(0, 20); // limit for demo

  lastScans[user.id][dustbinId] = now;

  return res.json({
    message: 'Scan successful. 10 points added.',
    totalPoints: user.totalPoints,
    scan: scanEntry,
  });
});

module.exports = router;


