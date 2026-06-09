/* =============================================
   StudyQuest — Backend Server (Node.js + Express)
   server.js — REST API with JSON file storage
   ============================================= */

// --- Core imports ---
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// --- Create Express app ---
const app = express();
const PORT = 3000;

// --- Path to the JSON data file ---
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Middleware ---
app.use(cors());                // Allow requests from the frontend (different origin)
app.use(express.json());        // Parse JSON request bodies

// =============================================
// HELPER: Read data from the JSON file
// =============================================
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// =============================================
// HELPER: Write data to the JSON file
// =============================================
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// =============================================
// TASKS ENDPOINTS
// =============================================

/**
 * GET /tasks
 * Returns the full list of tasks.
 */
app.get('/tasks', (req, res) => {
  const data = readData();
  res.json(data.tasks);
});

/**
 * POST /tasks
 * Creates a new task.
 * Request body: { title, desc, xp }
 * Auto-assigns a new ID and sets completed to false.
 */
app.post('/tasks', (req, res) => {
  const data = readData();
  const { title, desc, xp } = req.body;

  // Basic validation
  if (!title || xp == null) {
    return res.status(400).json({ error: 'Title and xp are required.' });
  }

  // Compute the next available ID
  const maxId = data.tasks.reduce((max, t) => Math.max(max, t.id), 0);
  const newTask = {
    id: maxId + 1,
    title,
    desc: desc || '',
    xp: Number(xp),
    completed: false,
  };

  data.tasks.push(newTask);
  writeData(data);

  res.status(201).json(newTask);
});

/**
 * PUT /tasks/:id
 * Updates an existing task (e.g. toggle completion).
 * Request body can include: { title, desc, xp, completed }
 */
app.put('/tasks/:id', (req, res) => {
  const data = readData();
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  // Merge the existing task with the new fields from the request body
  const updatedTask = { ...data.tasks[taskIndex], ...req.body };
  data.tasks[taskIndex] = updatedTask;
  writeData(data);

  res.json(updatedTask);
});

/**
 * DELETE /tasks/:id
 * Deletes a task by its ID.
 */
app.delete('/tasks/:id', (req, res) => {
  const data = readData();
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const deleted = data.tasks.splice(taskIndex, 1)[0];
  writeData(data);

  res.json({ message: 'Task deleted.', task: deleted });
});

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
  console.log(`⚔️ StudyQuest server running at http://localhost:${PORT}`);
});
