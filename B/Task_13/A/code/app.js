/* ============================================
   StudyQuest — Gamified Student Productivity
   app.js — Mock Data & UI Interactions
   ============================================ */

// ==========================================
// MOCK DATA
// ==========================================

const StudyQuest = (() => {
  'use strict';

  /* ---------- User ---------- */
  const user = {
    name: 'Hero Adventurer',
    xp: 1240,
    level: 0,    // computed below
    streak: 7,
    totalXp: 0,  // computed below
  };

  /* ---------- XP thresholds per level ---------- */
  const XP_PER_LEVEL = 500;

  /* ---------- Compute derived stats ---------- */
  function computeLevel(xp) {
    return Math.floor(xp / XP_PER_LEVEL);
  }

  function xpInCurrentLevel(xp) {
    return xp % XP_PER_LEVEL;
  }

  user.level = computeLevel(user.xp);
  user.totalXp = user.xp;

  /* ---------- Tasks (Quests) ---------- */
  const tasks = [
    { id: 1, title: 'Finish Math Homework',     desc: 'Chapter 5 — Algebra',            xp: 120, completed: false },
    { id: 2, title: 'Read History Chapter 4',    desc: 'Pages 85–110',                   xp: 90,  completed: false },
    { id: 3, title: 'Physics Lab Report',        desc: 'Write conclusion & analysis',     xp: 150, completed: true  },
    { id: 4, title: 'Study for Spanish Quiz',    desc: 'Vocabulary unit 3',              xp: 80,  completed: false },
    { id: 5, title: 'CS Programming Exercise',   desc: 'Linked lists in Python',         xp: 200, completed: false },
    { id: 6, title: 'Review Biology Notes',      desc: 'Photosynthesis & respiration',    xp: 60,  completed: false },
  ];

  /* ---------- Achievements / Badges ---------- */
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

  function saveState() {
    try {
      localStorage.setItem('studyquest_tasks', JSON.stringify(tasks));
      localStorage.setItem('studyquest_user', JSON.stringify({
        xp: user.xp,
        streak: user.streak,
      }));
    } catch (_) { /* noop */ }
  }

  function loadState() {
    try {
      const savedTasks = localStorage.getItem('studyquest_tasks');
      const savedUser   = localStorage.getItem('studyquest_user');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        parsed.forEach(t => {
          const match = tasks.find(mt => mt.id === t.id);
          if (match) match.completed = t.completed;
        });
      }
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        user.xp = parsed.xp ?? user.xp;
        user.streak = parsed.streak ?? user.streak;
        user.level = computeLevel(user.xp);
        user.totalXp = user.xp;
      }
    } catch (_) { /* noop */ }
  }

  /* Recalculate stats based on current task completion */
  function recalcStats() {
    const completedXp = tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.xp, 0);
    user.xp = user.totalXp; // base xp (without completed tasks counted)
    // Actually for simplicity, we add completed task XP on top of base
    user.xp = user.totalXp + completedXp;
    user.level = computeLevel(user.xp);
    saveState();
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

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    recalcStats();

    // Re-render current page
    renderDashboard();
    renderTasks();
    renderProfile();
  }

  // ==========================================
  // INIT
  // ==========================================

  function init() {
    loadState();
    // Set totalXp base (initial XP without completed task bonuses)
    // We store the "earned" XP as totalXp
    const completedXp = tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.xp, 0);
    user.totalXp = user.xp - completedXp;
    if (user.totalXp < 0) user.totalXp = 500; // fallback

    renderDashboard();
    renderTasks();
    renderProfile();

    // Highlight active nav link
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === current) a.classList.add('active');
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  return { user, tasks, achievements, toggleTask, recalcStats };
})();
