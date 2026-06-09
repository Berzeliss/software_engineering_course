/* =============================================
   StudyQuest — Task Service
   server.js — REST API for task CRUD (port 3001)
   ============================================= */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
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
 */
app.post('/tasks', (req, res) => {
  const data = readData();
  const { title, desc, xp } = req.body;

  if (!title || xp == null) {
    return res.status(400).json({ error: 'Title and xp are required.' });
  }

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
 * Updates an existing task.
 */
app.put('/tasks/:id', (req, res) => {
  const data = readData();
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

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
// START THE SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`📋 Task Service running at http://localhost:${PORT}`);
});
