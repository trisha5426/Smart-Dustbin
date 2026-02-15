const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const { users } = req.store;

  const sorted = [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u, idx) => ({
      rank: idx + 1,
      name: u.name,
      totalPoints: u.totalPoints,
    }));

  res.json(sorted);
});

module.exports = router;


