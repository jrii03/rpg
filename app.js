/**
 * LIFE GRINDER - Core Engine
 * Lightweight, Vanilla JS, Offline-first RPG Habit Tracker
 */

const STORAGE_KEY = 'LIFE_GRINDER_DATA_V1';

// --- DEFAULT INITIAL STATE ---
const DEFAULT_STATE = {
  character: {
    name: 'Player One',
    level: 1,
    xp: 0,
    title: 'Novice Grinder',
    avatar: '🗡️',
    stats: {
      INT: 0,
      STR: 0,
      VIT: 0
    }
  },
  quests: [
    {
      id: 'q_init_1',
      name: 'Fokus Belajar / Deep Work (Coding/Baca)',
      type: 'main',
      stat: 'INT',
      inputType: 'duration',
      activity: 'Belajar',
      completed: false
    },
    {
      id: 'q_init_2',
      name: 'Workout / Push-up Rutin',
      type: 'daily',
      stat: 'STR',
      inputType: 'count',
      activity: 'Latihan Fisik',
      completed: false
    },
    {
      id: 'q_init_3',
      name: 'Minum Air Cukup (8 Gelas)',
      type: 'daily',
      stat: 'VIT',
      inputType: 'count',
      activity: 'Hidrasi',
      completed: false
    },
    {
      id: 'q_init_4',
      name: 'Rapihkan Kamar & Meja Kerja',
      type: 'side',
      stat: 'VIT',
      inputType: 'quality',
      activity: 'Kebersihan',
      completed: false
    }
  ],
  activities: {
    'Belajar': { total: 0, unit: 'menit', inputType: 'duration' },
    'Latihan Fisik': { total: 0, unit: 'reps', inputType: 'count' },
    'Hidrasi': { total: 0, unit: 'gelas', inputType: 'count' },
    'Kebersihan': { total: 0, unit: 'skala', inputType: 'quality' }
  },
  lastActiveDate: ''
};

// --- XP CONFIG BY QUEST TYPE ---
const XP_MAP = {
  main: 200,
  daily: 40,
  side: 15
};

// State in Memory
let state = null;
let activeCheckinQuest = null;

// --- UTILITY FUNCTIONS ---
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(d = new Date()) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

// Calculate XP required for level N (Exponential Curve)
function getXpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.55));
}

// Determine Visual Tier based on Level
function getTierFromLevel(level) {
  if (level >= 75) return { id: 'mythic', name: 'MYTHIC', avatar: '🌌' };
  if (level >= 50) return { id: 'gold', name: 'GOLD', avatar: '👑' };
  if (level >= 25) return { id: 'silver', name: 'SILVER', avatar: '⚔️' };
  if (level >= 10) return { id: 'bronze', name: 'BRONZE', avatar: '🛡️' };
  return { id: 'wood', name: 'WOOD', avatar: '🗡️' };
}

// Dynamic Archetype Title based on INT / STR / VIT ratio
function calculateArchetypeTitle(stats, level) {
  const { INT, STR, VIT } = stats;
  const max = Math.max(INT, STR, VIT);
  
  if (level === 1 && max === 0) return 'Novice Grinder';

  if (INT === STR && STR === VIT) return 'The All-Rounder';
  if (INT > STR && INT > VIT) {
    if (INT >= 50) return 'Grand Sage';
    if (INT >= 20) return 'Scholar Elite';
    return 'Seeker of Knowledge';
  }
  if (STR > INT && STR > VIT) {
    if (STR >= 50) return 'Iron Warlord';
    if (STR >= 20) return 'Vanguard Athlete';
    return 'Iron Striker';
  }
  if (VIT > INT && VIT > STR) {
    if (VIT >= 50) return 'Zen Master';
    if (VIT >= 20) return 'Guardian of Life';
    return 'Living Vitalist';
  }
  if (INT > 0 && STR > 0 && INT === STR) return 'Battle Mage';
  if (STR > 0 && VIT > 0 && STR === VIT) return 'Iron Paladin';
  if (INT > 0 && VIT > 0 && INT === VIT) return 'Ascetic Monk';

  return 'Disciplined Grinder';
}

// --- STATE MANAGEMENT ---
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.lastActiveDate = getTodayDateString();
    saveState();
  } else {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse state, resetting to default', e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
    }
  }

  // Check Midnight Reset
  checkMidnightReset();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Midnight Reset: uncheck quests if date has rolled over
function checkMidnightReset() {
  const today = getTodayDateString();
  if (state.lastActiveDate !== today) {
    console.log(`Midnight rollover detected! Resetting quests from ${state.lastActiveDate} to ${today}`);
    state.quests.forEach(q => {
      q.completed = false;
    });
    state.lastActiveDate = today;
    saveState();
  }
}

// --- CHARACTER PROGRESSION LOGIC ---
function addRewards(quest, inputVal) {
  // 1. Add rigid +1 to target stat
  if (state.character.stats[quest.stat] !== undefined) {
    state.character.stats[quest.stat] += 1;
  }

  // 2. Add XP based on Quest Type
  const xpGain = XP_MAP[quest.type] || 20;
  state.character.xp += xpGain;

  // Check Level-up (can level up multiple times if huge XP)
  let xpNeeded = getXpRequiredForLevel(state.character.level);
  let leveledUp = false;

  while (state.character.xp >= xpNeeded) {
    state.character.xp -= xpNeeded;
    state.character.level += 1;
    xpNeeded = getXpRequiredForLevel(state.character.level);
    leveledUp = true;
  }

  // 3. Accumulate Lifetime activity
  const actName = quest.activity || quest.name;
  if (!state.activities[actName]) {
    state.activities[actName] = {
      total: 0,
      unit: quest.inputType === 'duration' ? 'menit' : (quest.inputType === 'count' ? 'reps' : 'skala'),
      inputType: quest.inputType
    };
  }
  state.activities[actName].total += Number(inputVal) || 1;

  // 4. Update Title
  state.character.title = calculateArchetypeTitle(state.character.stats, state.character.level);

  // 5. Update Quest Completed state
  quest.completed = true;
  quest.lastCompletedDate = getTodayDateString();

  saveState();
  renderApp();

  if (leveledUp) {
    alert(`🎉 LEVEL UP! Kamu sekarang mencapai Level ${state.character.level}!`);
  }
}

function revertQuest(quest) {
  if (!quest.completed) return;
  
  if (confirm(`Batalkan penyelesaian quest "${quest.name}"? (Stat & XP akan dikurangi kembali)`)) {
    // Revert stat
    if (state.character.stats[quest.stat] > 0) {
      state.character.stats[quest.stat] -= 1;
    }
    
    // Revert XP
    const xpGain = XP_MAP[quest.type] || 20;
    state.character.xp = Math.max(0, state.character.xp - xpGain);
    
    quest.completed = false;
    state.character.title = calculateArchetypeTitle(state.character.stats, state.character.level);
    
    saveState();
    renderApp();
  }
}

// --- RENDER FUNCTIONS ---
function renderApp() {
  renderHeaderAndCard();
  renderQuests();
  renderDashboard();
}

function renderHeaderAndCard() {
  const { character } = state;
  const tier = getTierFromLevel(character.level);

  // Set Theme Class on Body
  document.body.className = `tier-${tier.id}`;

  // Date
  document.getElementById('current-date-badge').textContent = formatDateDisplay();

  // Character Card Elements
  document.getElementById('char-name').textContent = character.name;
  document.getElementById('char-title').textContent = character.title;
  document.getElementById('char-level').textContent = character.level;
  document.getElementById('char-tier-badge').textContent = tier.name;
  document.getElementById('char-avatar').textContent = tier.avatar;

  // EXP Bar
  const xpNeeded = getXpRequiredForLevel(character.level);
  const xpPct = Math.min(100, Math.floor((character.xp / xpNeeded) * 100));
  document.getElementById('exp-text').textContent = `${character.xp} / ${xpNeeded} XP`;
  document.getElementById('exp-fill').style.width = `${xpPct}%`;

  // Stats
  document.getElementById('stat-int').textContent = character.stats.INT;
  document.getElementById('stat-str').textContent = character.stats.STR;
  document.getElementById('stat-vit').textContent = character.stats.VIT;
}

function renderQuests() {
  const mainList = document.getElementById('main-quest-list');
  const dailyList = document.getElementById('daily-quest-list');
  const sideList = document.getElementById('side-quest-list');

  mainList.innerHTML = '';
  dailyList.innerHTML = '';
  sideList.innerHTML = '';

  const groups = {
    main: state.quests.filter(q => q.type === 'main'),
    daily: state.quests.filter(q => q.type === 'daily'),
    side: state.quests.filter(q => q.type === 'side')
  };

  ['main', 'daily', 'side'].forEach(type => {
    const container = type === 'main' ? mainList : (type === 'daily' ? dailyList : sideList);
    const list = groups[type];

    if (list.length === 0) {
      container.innerHTML = `<div class="quest-empty">Belum ada ${type} quest. Klik + Add untuk menambahkan.</div>`;
      return;
    }

    list.forEach(q => {
      const card = document.createElement('div');
      card.className = `quest-card ${q.completed ? 'completed' : ''}`;
      
      const statColorClass = `stat-${q.stat.toLowerCase()}`;
      const inputIcon = q.inputType === 'duration' ? '⏱️ Waktu' : (q.inputType === 'count' ? '🔢 Reps' : '⭐ Kualitas');

      card.innerHTML = `
        <div class="quest-left">
          <div class="quest-checkbox" title="${q.completed ? 'Klik untuk batalkan' : 'Centang untuk selesai'}">
            ${q.completed ? '✓' : ''}
          </div>
          <div class="quest-info">
            <span class="quest-name">${escapeHtml(q.name)}</span>
            <div class="quest-tags">
              <span class="quest-tag-stat ${statColorClass}">+1 ${q.stat}</span>
              <span class="quest-tag-input">${inputIcon} • ${escapeHtml(q.activity || 'Umum')}</span>
            </div>
          </div>
        </div>
        <div class="quest-actions">
          <button class="btn-icon-subtle btn-edit-quest" title="Edit Quest">✏️</button>
          <button class="btn-icon-subtle btn-del-quest" title="Hapus Quest">🗑️</button>
        </div>
      `;

      // Event: Click Checkbox
      const chk = card.querySelector('.quest-checkbox');
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        if (q.completed) {
          revertQuest(q);
        } else {
          openCheckinModal(q);
        }
      });

      // Event: Edit
      const editBtn = card.querySelector('.btn-edit-quest');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuestFormModal(q);
      });

      // Event: Delete
      const delBtn = card.querySelector('.btn-del-quest');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Hapus quest "${q.name}"?`)) {
          state.quests = state.quests.filter(item => item.id !== q.id);
          saveState();
          renderApp();
        }
      });

      container.appendChild(card);
    });
  });
}

function renderDashboard() {
  const grid = document.getElementById('activity-grid');
  grid.innerHTML = '';

  const entries = Object.entries(state.activities);
  if (entries.length === 0) {
    grid.innerHTML = '<div class="quest-empty" style="grid-column: span 2;">Belum ada riwayat aktivitas yang tercatat.</div>';
  } else {
    entries.forEach(([actName, data]) => {
      let displayValue = data.total;
      let displayUnit = data.unit;

      if (data.inputType === 'duration') {
        if (data.total >= 60) {
          const hours = (data.total / 60).toFixed(1);
          displayValue = hours;
          displayUnit = 'Jam';
        } else {
          displayUnit = 'Menit';
        }
      }

      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <span class="act-title">${escapeHtml(actName)}</span>
        <span class="act-value">${displayValue} <span class="act-unit">${displayUnit}</span></span>
      `;
      grid.appendChild(card);
    });
  }

  // Render Milestones
  renderMilestones();
}

function renderMilestones() {
  const list = document.getElementById('milestones-list');
  list.innerHTML = '';

  // Milestone tiers based on total level and activities
  const milestones = [
    {
      title: 'Perjalanan Dimulai (Level 5)',
      desc: 'Mencapai Level 5',
      current: state.character.level,
      target: 5,
      type: 'lvl'
    },
    {
      title: 'Status: Bronze Grinder (Level 10)',
      desc: 'Mencapai Tier Bronze pertama',
      current: state.character.level,
      target: 10,
      type: 'lvl'
    },
    {
      title: 'Status: Silver Veteran (Level 25)',
      desc: 'Mencapai Tier Silver',
      current: state.character.level,
      target: 25,
      type: 'lvl'
    },
    {
      title: 'Status: Royal Gold (Level 50)',
      desc: 'Mencapai Tier Emas Bergengsi',
      current: state.character.level,
      target: 50,
      type: 'lvl'
    }
  ];

  milestones.forEach(m => {
    const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
    const isUnlocked = m.current >= m.target;

    const item = document.createElement('div');
    item.className = 'milestone-item';
    item.innerHTML = `
      <div class="milestone-top">
        <span class="milestone-title">${isUnlocked ? '✅ ' : '🔒 '}${escapeHtml(m.title)}</span>
        <span class="milestone-target">${m.current}/${m.target}</span>
      </div>
      <div class="milestone-bar">
        <div class="milestone-fill" style="width: ${pct}%;"></div>
      </div>
    `;
    list.appendChild(item);
  });
}

// --- MODAL: CHECK-IN EFFORT ---
function openCheckinModal(quest) {
  activeCheckinQuest = quest;
  const modal = document.getElementById('modal-checkin');
  const title = document.getElementById('modal-checkin-questname');
  const prompt = document.getElementById('modal-checkin-prompt');
  const unit = document.getElementById('checkin-unit');
  const input = document.getElementById('checkin-value');
  const presetsContainer = document.getElementById('quick-presets');

  title.textContent = `Quest: ${quest.name}`;
  document.getElementById('preview-stat-reward').textContent = `+1 ${quest.stat}`;
  document.getElementById('preview-xp-reward').textContent = `+${XP_MAP[quest.type]} XP`;

  presetsContainer.innerHTML = '';

  if (quest.inputType === 'duration') {
    prompt.textContent = 'Masukkan durasi fokus kamu:';
    unit.textContent = 'Menit';
    input.value = 30;
    [15, 25, 30, 45, 60, 120].forEach(val => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = `+${val}m`;
      chip.onclick = () => { input.value = val; };
      presetsContainer.appendChild(chip);
    });
  } else if (quest.inputType === 'count') {
    prompt.textContent = 'Masukkan jumlah repetisi / hitungan:';
    unit.textContent = quest.activity.toLowerCase().includes('air') ? 'Gelas' : 'Reps';
    input.value = 20;
    [5, 10, 20, 30, 50, 100].forEach(val => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = `${val}`;
      chip.onclick = () => { input.value = val; };
      presetsContainer.appendChild(chip);
    });
  } else {
    prompt.textContent = 'Beri nilai kualitas penyelesaian (1 - 5):';
    unit.textContent = 'Skala';
    input.value = 5;
    [1, 2, 3, 4, 5].forEach(val => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = `⭐ ${val}`;
      chip.onclick = () => { input.value = val; };
      presetsContainer.appendChild(chip);
    });
  }

  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 50);
}

function closeCheckinModal() {
  document.getElementById('modal-checkin').style.display = 'none';
  activeCheckinQuest = null;
}

// --- MODAL: TAMBAH / EDIT QUEST ---
function openQuestFormModal(questToEdit = null) {
  const modal = document.getElementById('modal-quest');
  const title = document.getElementById('modal-quest-title');
  const formId = document.getElementById('quest-form-id');
  const formName = document.getElementById('quest-form-name');
  const formType = document.getElementById('quest-form-type');
  const formStat = document.getElementById('quest-form-stat');
  const formInput = document.getElementById('quest-form-input');
  const formAct = document.getElementById('quest-form-activity');

  if (questToEdit) {
    title.textContent = 'Edit Quest';
    formId.value = questToEdit.id;
    formName.value = questToEdit.name;
    formType.value = questToEdit.type;
    formStat.value = questToEdit.stat;
    formInput.value = questToEdit.inputType;
    formAct.value = questToEdit.activity;
  } else {
    title.textContent = 'Tambah Quest Baru';
    formId.value = '';
    formName.value = '';
    formType.value = 'daily';
    formStat.value = 'INT';
    formInput.value = 'duration';
    formAct.value = '';
  }

  modal.style.display = 'flex';
  setTimeout(() => formName.focus(), 50);
}

function closeQuestFormModal() {
  document.getElementById('modal-quest').style.display = 'none';
}

function saveQuestForm() {
  const formId = document.getElementById('quest-form-id').value;
  const name = document.getElementById('quest-form-name').value.trim();
  const type = document.getElementById('quest-form-type').value;
  const stat = document.getElementById('quest-form-stat').value;
  const inputType = document.getElementById('quest-form-input').value;
  let activity = document.getElementById('quest-form-activity').value.trim();

  if (!name) {
    alert('Judul quest tidak boleh kosong!');
    return;
  }

  if (!activity) {
    activity = name;
  }

  if (formId) {
    // Edit
    const q = state.quests.find(item => item.id === formId);
    if (q) {
      q.name = name;
      q.type = type;
      q.stat = stat;
      q.inputType = inputType;
      q.activity = activity;
    }
  } else {
    // New
    const newQuest = {
      id: 'q_' + Date.now(),
      name,
      type,
      stat,
      inputType,
      activity,
      completed: false
    };
    state.quests.push(newQuest);
  }

  saveState();
  renderApp();
  closeQuestFormModal();
}

// --- BACKUP & RESTORE DATA ---
function exportData() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `life-grinder-backup-${getTodayDateString()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.character && imported.quests) {
        state = imported;
        saveState();
        renderApp();
        alert('Data berhasil di-restore!');
      } else {
        alert('File JSON tidak valid untuk Life Grinder.');
      }
    } catch (err) {
      alert('Gagal membaca file JSON.');
    }
  };
  reader.readAsText(file);
}

// --- ESCAPE HTML TO PREVENT XSS ---
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- SETUP EVENT LISTENERS ---
function initEvents() {
  // Tab Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Add Quest Buttons by Section
  document.querySelectorAll('.add-quest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openQuestFormModal();
      document.getElementById('quest-form-type').value = btn.dataset.questType || 'daily';
    });
  });

  // Modal Check-in
  document.getElementById('btn-close-checkin').addEventListener('click', closeCheckinModal);
  document.getElementById('btn-cancel-checkin').addEventListener('click', closeCheckinModal);
  document.getElementById('btn-confirm-checkin').addEventListener('click', () => {
    if (activeCheckinQuest) {
      const val = document.getElementById('checkin-value').value;
      addRewards(activeCheckinQuest, val);
      closeCheckinModal();
    }
  });

  // Modal Quest Form
  document.getElementById('btn-close-quest').addEventListener('click', closeQuestFormModal);
  document.getElementById('btn-cancel-quest').addEventListener('click', closeQuestFormModal);
  document.getElementById('btn-save-quest').addEventListener('click', saveQuestForm);

  // Backup / Restore
  document.getElementById('btn-export-data').addEventListener('click', exportData);
  document.getElementById('btn-import-trigger').addEventListener('click', () => {
    document.getElementById('file-import').click();
  });
  document.getElementById('file-import').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importData(e.target.files[0]);
    }
  });

  // Reset All Data
  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('PERINGATAN: Kamu yakin ingin menghapus seluruh progres karakter dan quest? Tindakan ini tidak bisa dibatalkan!')) {
      localStorage.removeItem(STORAGE_KEY);
      loadState();
      renderApp();
      alert('Semua data berhasil direset ke status awal.');
    }
  });

  // Change character name on click
  document.getElementById('char-name').addEventListener('click', () => {
    const newName = prompt('Ubah nama karakter kamu:', state.character.name);
    if (newName && newName.trim()) {
      state.character.name = newName.trim();
      saveState();
      renderApp();
    }
  });
}

// --- INIT APP ---
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initEvents();
  renderApp();
});
