/* =============================================
   StudyQuest — API Gateway
   server.js — Single entry point for frontend (port 3000)
   Routes requests to Task Service (3001) or User Service (3002)
   ============================================= */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Internal service URLs
const TASK_SERVICE = 'http://localhost:3001';
const USER_SERVICE = 'http://localhost:3002';

app.use(cors());
app.use(express.json());

// =============================================
// HELPER: Forward request to a backend service
// =============================================
async function forwardRequest(serviceUrl, req) {
  const url = `${serviceUrl}${req.originalUrl}`;

  const options = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
  };

  // Attach body for methods that support it
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    options.body = JSON.stringify(req.body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  return { status: response.status, data };
}

// =============================================
// ROUTE: /tasks/* → Task Service (port 3001)
// =============================================
app.all('/tasks*', async (req, res) => {
  try {
    const result = await forwardRequest(TASK_SERVICE, req);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('❌ Task Service error:', err.message);
    res.status(502).json({ error: 'Task Service unavailable' });
  }
});

// =============================================
// ROUTE: /user/* → User Service (port 3002)
// =============================================
app.all('/user*', async (req, res) => {
  try {
    const result = await forwardRequest(USER_SERVICE, req);
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('❌ User Service error:', err.message);
    res.status(502).json({ error: 'User Service unavailable' });
  }
});

// =============================================
// START THE SERVER
// =============================================
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running at http://localhost:${PORT}`);
  console.log(`   → Tasks:  ${TASK_SERVICE}`);
  console.log(`   → Users:  ${USER_SERVICE}`);
});
