/* =============================================
   StudyQuest — User Service
   server.js — REST API for user data (port 3002)
   ============================================= */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// =============================================
// HELPERS
// =============================================
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// =============================================
// USER ENDPOINTS
// =============================================

/**
 * GET /user
 * Returns the user object (name, xp, streak).
 */
app.get('/user', (req, res) => {
  const data = readData();
  res.json(data.user);
});

/**
 * POST /user/xp
 * Adds XP to the user.
 * Request body: { xp: number }
 */
app.post('/user/xp', (req, res) => {
  const data = readData();
  const { xp } = req.body;

  if (xp == null) {
    return res.status(400).json({ error: 'XP value is required.' });
  }

  data.user.xp += Number(xp);
  writeData(data);

  res.json(data.user);
});

/**
 * POST /user/streak
 * Updates the user's streak.
 * Request body: { streak: number }
 */
app.post('/user/streak', (req, res) => {
  const data = readData();
  const { streak } = req.body;

  if (streak == null) {
    return res.status(400).json({ error: 'Streak value is required.' });
  }

  data.user.streak = Number(streak);
  writeData(data);

  res.json(data.user);
});

// =============================================
// START THE SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`👤 User Service running at http://localhost:${PORT}`);
});
