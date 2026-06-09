/* ============================================
   StudyQuest — Gamified Student Productivity
   app.js — API-driven Data & UI Interactions
   ============================================
   This version replaces localStorage with a
   backend API (Node.js + Express).
   ============================================ */

const StudyQuest = (() => {
  'use strict';

  // ==========================================
  // API BASE URL
  // ==========================================
  // Change this if the backend runs on a different host/port.
  const API_BASE = 'http://localhost:3000';

  // ==========================================
  // API HELPER — all fetch calls in one place
  // ==========================================
  const API = {
    /* ----- Tasks ----- */
    getTasks() {
      return fetch(`${API_BASE}/tasks`).then(r => r.json());
    },
    createTask(task) {
      return fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      }).then(r => r.json());
    },
    updateTask(id, updates) {
      return fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(r => r.json());
    },
    deleteTask(id) {
      return fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      }).then(r => r.json());
    },

    /* ----- User ----- */
    getUser() {
      return fetch(`${API_BASE}/user`).then(r => r.json());
    },
    addXp(amount) {
      return fetch(`${API_BASE}/user/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: amount }),
      }).then(r => r.json());
    },
    updateStreak(streak) {
      return fetch(`${API_BASE}/user/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streak }),
      }).then(r => r.json());
    },
  };

  // ==========================================
  // APPLICATION STATE (populated from API)
  // ==========================================

  /* ---------- User ---------- */
  let user = {
    name: 'Hero Adventurer',
    xp: 0,
    level: 0,
    streak: 0,
  };

  /* ---------- XP thresholds per level ---------- */
  const XP_PER_LEVEL = 500;

  /* ---------- Tasks (Quests) — fetched from backend ---------- */
  let tasks = [];

  /* ---------- Achievements / Badges (static — no API needed) ---------- */
  const achievements = [
    { id: 1, name: 'First Steps',      desc: 'Complete your first task',       icon: '🌱', unlocked: true  },
    { id: 2, name: 'Speed Runner',     desc: 'Complete 3 tasks in one day',    icon: '⚡', unlocked: true  },
    { id: 3, name: 'Scholar',          desc: 'Earn 500 total XP',              icon: '📖', unlocked: true  },
    { id: 4, name: 'Week Warrior',     desc: 'Maintain a 7-day streak',        icon: '🔥', unlocked: true  },
    { id: 5, name: 'Task Master',      desc: 'Complete 10 tasks',              icon: '🏆', unlocked: false },
    { id: 6, name: 'Centurion',        desc: 'Earn 1000 total XP',             icon: '💎', unlocked: true  },
    { id: 7, name: 'Perfectionist',    desc: 'Complete all tasks in a day',    icon: '⭐', unlocked: false },
    { id: 8, name: 'Legendary',        desc: 'Reach level 10',                 icon: '👑', unlocked: false },
  ];

  // ==========================================
  // HELPERS
  // ==========================================

  function computeLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL);
  }

  function xpInCurrentLevel(xp) {
    return xp % XP_PER_LEVEL;
  }

  /* Recalculate user level based on current XP */
  function updateLevel() {
    user.level = computeLevel(user.xp);
  }

  // ==========================================
  // DATA LOADING (from API)
  // ==========================================

  /**
   * Fetch all tasks and user data from the backend,
   * then update the local state and re-render.
   */
  async function loadFromApi() {
    try {
      // Fetch tasks and user in parallel
      const [fetchedTasks, fetchedUser] = await Promise.all([
        API.getTasks(),
        API.getUser(),
      ]);

      tasks = fetchedTasks;
      user.name   = fetchedUser.name;
      user.xp     = fetchedUser.xp;
      user.streak = fetchedUser.streak;
      updateLevel();

      // Re-render all pages
      renderDashboard();
      renderTasks();
      renderProfile();
    } catch (err) {
      console.error('Failed to load data from API:', err);
    }
  }

  // ==========================================
  // DASHBOARD RENDER
  // ==========================================

  function renderDashboard() {
    const xpFill    = document.getElementById('xp-fill');
    const xpText    = document.getElementById('xp-text');
    const levelEl   = document.getElementById('level-display');
    const streakEl  = document.getElementById('streak-display');
    const tasksList = document.getElementById('active-tasks-list');
    const completedCountEl = document.getElementById('completed-count');
    const levelLabel = document.getElementById('level-label');

    if (!xpFill) return; // not on dashboard page

    const inLevel = xpInCurrentLevel(user.xp);
    const pct     = Math.min(100, (inLevel / XP_PER_LEVEL) * 100);

    xpFill.style.width = pct + '%';
    if (xpText) xpText.textContent = `${inLevel} / ${XP_PER_LEVEL} XP`;
    if (levelEl) levelEl.textContent = user.level;
    if (levelLabel) levelLabel.textContent = user.level;
    if (streakEl) streakEl.textContent = user.streak;
    if (completedCountEl) completedCountEl.textContent = tasks.filter(t => t.completed).length;

    if (tasksList) {
      const incomplete = tasks.filter(t => !t.completed).slice(0, 5);
      if (incomplete.length === 0) {
        tasksList.innerHTML = `<p style="color:var(--text-muted);padding:12px;">🎉 All quests complete!</p>`;
        return;
      }
      tasksList.innerHTML = incomplete.map(t => `
        <div class="quest-item" data-id="${t.id}">
          <input type="checkbox" class="quest-checkbox" ${t.completed ? 'checked' : ''}>
          <div class="quest-info">
            <div class="quest-title">${t.title}</div>
            <div class="quest-desc">${t.desc}</div>
          </div>
          <span class="quest-xp">+${t.xp} XP</span>
        </div>
      `).join('');

      tasksList.querySelectorAll('.quest-item').forEach(el => {
        const cb = el.querySelector('.quest-checkbox');
        cb.addEventListener('change', () => {
          const id = parseInt(el.dataset.id);
          toggleTask(id);
        });
      });
    }
  }

  // ==========================================
  // TASKS PAGE RENDER
  // ==========================================

  function renderTasks() {
    const container = document.getElementById('quest-list');
    if (!container) return;

    container.innerHTML = tasks.map(t => `
      <div class="quest-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
        <input type="checkbox" class="quest-checkbox" ${t.completed ? 'checked' : ''}>
        <div class="quest-info">
          <div class="quest-title">${t.title}</div>
          <div class="quest-desc">${t.desc}</div>
        </div>
        <span class="quest-xp">+${t.xp} XP</span>
      </div>
    `).join('');

    container.querySelectorAll('.quest-item').forEach(el => {
      const cb = el.querySelector('.quest-checkbox');
      cb.addEventListener('change', () => {
        const id = parseInt(el.dataset.id);
        toggleTask(id);
      });
    });

    // Update counter
    const total   = tasks.length;
    const done    = tasks.filter(t => t.completed).length;
    const counter = document.getElementById('quest-counter');
    if (counter) counter.textContent = `${done} / ${total} completed`;
  }

  // ==========================================
  // PROFILE PAGE RENDER
  // ==========================================

  function renderProfile() {
    const xpEl     = document.getElementById('profile-xp');
    const levelEl  = document.getElementById('profile-level');
    const streakEl = document.getElementById('profile-streak');
    const badgesEl = document.getElementById('badges-grid');
    const nameEl   = document.getElementById('profile-name');
    const tasksDoneEl = document.getElementById('profile-tasks');

    if (!xpEl) return;

    const doneCount = tasks.filter(t => t.completed).length;

    if (nameEl)      nameEl.textContent = user.name;
    if (xpEl)        xpEl.textContent = user.xp;
    if (levelEl)     levelEl.textContent = user.level;
    if (streakEl)    streakEl.textContent = user.streak;
    if (tasksDoneEl) tasksDoneEl.textContent = doneCount;

    if (badgesEl) {
      badgesEl.innerHTML = achievements.map(a => `
        <div class="badge-card ${a.unlocked ? '' : 'locked'}">
          <div class="badge-icon">${a.icon}</div>
          <div class="badge-name">${a.name}</div>
          <div class="badge-desc">${a.desc}</div>
        </div>
      `).join('');
    }
  }

  // ==========================================
  // TASK TOGGLE (shared)
  // ==========================================

  /**
   * Toggle a task's completion status via the API,
   * then update the local state and re-render.
   */
  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    try {
      // Update the task on the backend
      const updatedTask = await API.updateTask(id, { completed: newCompleted });

      // Update local state with the response
      const localTask = tasks.find(t => t.id === id);
      if (localTask) {
        localTask.completed = updatedTask.completed;
      }

      // If the task was just completed, award XP and increase streak
      if (newCompleted) {
        await API.addXp(task.xp);
        // Increment the streak by 1 each time a task is completed
        const newStreak = user.streak + 1;
        await API.updateStreak(newStreak);
        const updatedUser = await API.getUser();
        user.xp = updatedUser.xp;
        user.streak = updatedUser.streak;
        updateLevel();
      }

      // Re-render all pages
      renderDashboard();
      renderTasks();
      renderProfile();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }

  // ==========================================
  // INIT
  // ==========================================

  async function init() {
    // Load data from the backend API
    await loadFromApi();

    // Highlight active nav link
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current) a.classList.add('active');
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  // Expose for debugging
  return { user, tasks, achievements, toggleTask, API };
})();
