/**
 * LIFE GRINDER - Modular Repeatable RPG Engine
 * Featuring: Customizable Preset Registry, Universal Addition Math, Steep Curve
 */

// =============================================================================
// DAFTAR PRESET SATUAN & BOBOT XP (BISA DITAMBAH / DIUBAH KAPAN SAJA DI SINI!)
// Cukup tambahkan baris baru ke array ini untuk menambah satuan baru.
// =============================================================================
const UNIT_PRESETS = [
  // --- 🧠 INT (Intellectual / Mind / Skill) ---
  { id: 'menit_fokus', label: '🧠 Menit Fokus / Coding (INT)', stat: 'INT', unit: 'Menit', xp: 1, presets: [15, 30, 45, 60, 90, 120] },
  // { id: 'chapter_manga', label: '🧠 Immersion Chapter (Manga/Novel) (INT)', stat: 'INT', unit: 'Chapter', xp: 10, presets: [1, 2, 3, 5, 10] },
  // { id: 'halaman_buku', label: '🧠 Membaca Halaman Buku (INT)', stat: 'INT', unit: 'Halaman', xp: 2, presets: [5, 10, 20, 30, 50] },
  // { id: 'lesson_bahasa', label: '🧠 Lesson (Duolingo / Anki) (INT)', stat: 'INT', unit: 'Lesson', xp: 15, presets: [1, 2, 3, 5] },
  // { id: 'fitur_coding', label: '🧠 Selesai Fitur / Commit (INT)', stat: 'INT', unit: 'Fitur', xp: 50, presets: [1, 2, 3] },
  // { id: 'tamat_buku', label: '🧠 Tamat 1 Buku Penuh (INT)', stat: 'INT', unit: 'Buku', xp: 250, presets: [1] },

  // --- 💪 STR (Strength / Physical / Fitness) ---
  { id: 'reps_workout', label: '💪 Reps Workout (Push-up / Squat) (STR)', stat: 'STR', unit: 'Reps', xp: 1, presets: [10, 20, 30, 50, 100] },
  // { id: 'km_lari', label: '💪 Jarak Lari / Jogging / Gowes (STR)', stat: 'STR', unit: 'KM', xp: 30, presets: [1, 2, 3, 5, 10] },
  // { id: 'set_gym', label: '💪 Set Latihan Gym (STR)', stat: 'STR', unit: 'Set', xp: 15, presets: [1, 2, 3, 4, 5] },
  // { id: 'langkah_k', label: '💪 Langkah Kaki Ribuan (STR)', stat: 'STR', unit: 'k-Steps', xp: 20, presets: [2, 5, 8, 10] },
  // { id: 'menit_kardio', label: '💪 Menit Olahraga / Kardio (STR)', stat: 'STR', unit: 'Menit', xp: 1, presets: [15, 30, 45, 60] },

  // --- 🛡️ VIT (Vitality / Health / Habit Hidup) ---
  { id: 'air_gelas', label: '🛡️ Minum Air Putih (VIT)', stat: 'VIT', unit: 'Gelas', xp: 10, presets: [1, 2, 3, 4] },
  // { id: 'tidur_jam', label: '🛡️ Jam Tidur Cukup (VIT)', stat: 'VIT', unit: 'Jam', xp: 10, presets: [6, 7, 8, 9] },
  // { id: 'porsi_sehat', label: '🛡️ Porsi Makan Sehat / Sayur (VIT)', stat: 'VIT', unit: 'Porsi', xp: 20, presets: [1, 2, 3] },
  // { id: 'sesi_rehat', label: '🛡️ Sesi Meditasi / Rehat (VIT)', stat: 'VIT', unit: 'Sesi', xp: 25, presets: [1, 2] },
  // { id: 'area_bersih', label: '🛡️ Beresin Area / Kamar (VIT)', stat: 'VIT', unit: 'Area', xp: 25, presets: [1, 2] },
  // { id: 'hari_bersih', label: '🛡️ Hari Bersih / No-Junk / Puasa (VIT)', stat: 'VIT', unit: 'Hari', xp: 50, presets: [1] },

  // --- ✨ Kustom Sendiri ---
  { id: 'custom', label: '✨ Kustom Sendiri (Isi Bebas)', stat: 'INT', unit: '', xp: 1, presets: [1, 5, 10, 20] }
];

const STORAGE_KEY = 'LIFE_GRINDER_V2_DATA';

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
  activities: [
    {
      id: 'act_1',
      name: 'Belajar Coding / Deep Work',
      presetId: 'menit_fokus',
      stat: 'INT',
      unit: 'Menit',
      xpPerUnit: 1,
      presets: [15, 30, 45, 60],
      totalAmount: 0,
      sessionCount: 0
    },
    {
      id: 'act_2',
      name: 'Immersion Manga / Light Novel',
      presetId: 'chapter_manga',
      stat: 'INT',
      unit: 'Chapter',
      xpPerUnit: 10,
      presets: [1, 2, 3, 5],
      totalAmount: 0,
      sessionCount: 0
    },
    {
      id: 'act_3',
      name: 'Push-up / Kalistenik',
      presetId: 'reps_workout',
      stat: 'STR',
      unit: 'Reps',
      xpPerUnit: 1,
      presets: [10, 20, 30, 50],
      totalAmount: 0,
      sessionCount: 0
    },
    {
      id: 'act_4',
      name: 'Minum Air Putih',
      presetId: 'air_gelas',
      stat: 'VIT',
      unit: 'Gelas',
      xpPerUnit: 10,
      presets: [1, 2, 3, 4],
      totalAmount: 0,
      sessionCount: 0
    }
  ],
  logs: []
};

// Global App State
let state = null;
let activeGrindActivity = null;

// --- STEEP EXPONENTIAL CURVE ---
function getXpRequired(level) {
  // Steep RPG formula: 200 * (level ^ 1.7)
  return Math.floor(200 * Math.pow(level, 1.7));
}

// --- TIER PRESTIGE ---
function getTier(level) {
  if (level >= 75) return { id: 'mythic', name: 'MYTHIC', avatar: '🌌' };
  if (level >= 50) return { id: 'gold', name: 'GOLD', avatar: '👑' };
  if (level >= 25) return { id: 'silver', name: 'SILVER', avatar: '⚔️' };
  if (level >= 10) return { id: 'bronze', name: 'BRONZE', avatar: '🛡️' };
  return { id: 'wood', name: 'WOOD', avatar: '🗡️' };
}

// --- DYNAMIC ARCHETYPE TITLE ---
function calculateTitle(stats, level) {
  const { INT, STR, VIT } = stats;
  const max = Math.max(INT, STR, VIT);
  
  if (level === 1 && max === 0) return 'Novice Grinder';

  if (INT === STR && STR === VIT && INT > 0) return 'The All-Rounder';
  if (INT > STR && INT > VIT) {
    if (INT >= 100) return 'Grand Sage';
    if (INT >= 40) return 'Scholar Elite';
    return 'Seeker of Knowledge';
  }
  if (STR > INT && STR > VIT) {
    if (STR >= 100) return 'Iron Warlord';
    if (STR >= 40) return 'Vanguard Athlete';
    return 'Iron Striker';
  }
  if (VIT > INT && VIT > STR) {
    if (VIT >= 100) return 'Zen Master';
    if (VIT >= 40) return 'Guardian of Life';
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
    saveState();
  } else {
    try {
      state = JSON.parse(raw);
      // Ensure all activities have xpPerUnit
      state.activities.forEach(a => {
        if (!a.xpPerUnit) a.xpPerUnit = 1;
        if (!a.presets) a.presets = [1, 5, 10, 20];
      });
    } catch (e) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
    }
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- LOGGING & REWARDING ---
function submitGrind(activity, amount) {
  const val = Math.max(1, Number(amount) || 1);
  const rate = activity.xpPerUnit || 1;
  const xpGained = Math.round(val * rate);

  // 1. Stat update (+1 kaku per sesi)
  if (state.character.stats[activity.stat] !== undefined) {
    state.character.stats[activity.stat] += 1;
  }

  // 2. XP & Level Update (Steep Curve)
  state.character.xp += xpGained;
  let xpNeeded = getXpRequired(state.character.level);
  let leveledUp = false;

  while (state.character.xp >= xpNeeded) {
    state.character.xp -= xpNeeded;
    state.character.level += 1;
    xpNeeded = getXpRequired(state.character.level);
    leveledUp = true;
  }

  // 3. Activity Pure Addition Math (Dashboard accumulator)
  activity.totalAmount += val;
  activity.sessionCount = (activity.sessionCount || 0) + 1;

  // 4. Title recalculation
  state.character.title = calculateTitle(state.character.stats, state.character.level);

  // 5. Append to Logs
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}`;

  const logEntry = {
    id: 'log_' + Date.now(),
    actId: activity.id,
    actName: activity.name,
    stat: activity.stat,
    amount: val,
    unit: activity.unit,
    xp: xpGained,
    time: `${dateStr} ${timeStr}`
  };

  if (!state.logs) state.logs = [];
  state.logs.unshift(logEntry);
  if (state.logs.length > 50) state.logs.pop(); // keep last 50 logs

  saveState();
  renderApp();

  // Instant Visual Dopamine (Toast)
  showToast(`⚔️ +${xpGained} XP • +1 ${activity.stat}! (${val} ${activity.unit})`);

  if (leveledUp) {
    setTimeout(() => {
      alert(`🎉 LEVEL UP! Karaktermu sekarang mencapai Level ${state.character.level}!`);
    }, 200);
  }
}

function deleteLogEntry(logId) {
  const log = state.logs.find(l => l.id === logId);
  if (!log) return;

  if (confirm(`Hapus catatan "${log.actName} (${log.amount} ${log.unit})"? (XP & Stat akan dikurangi kembali)`)) {
    // Revert activity
    const act = state.activities.find(a => a.id === log.actId);
    if (act) {
      act.totalAmount = Math.max(0, act.totalAmount - log.amount);
      act.sessionCount = Math.max(0, (act.sessionCount || 1) - 1);
    }

    // Revert stat
    if (state.character.stats[log.stat] > 0) {
      state.character.stats[log.stat] -= 1;
    }

    // Revert XP
    state.character.xp = Math.max(0, state.character.xp - log.xp);
    state.character.title = calculateTitle(state.character.stats, state.character.level);

    // Remove log
    state.logs = state.logs.filter(l => l.id !== logId);

    saveState();
    renderApp();
  }
}

// --- TOAST HELPER ---
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

// --- RENDER APP ---
function renderApp() {
  renderCharacterCard();
  renderGrindCards();
  renderDashboard();
}

function renderCharacterCard() {
  const { character } = state;
  const tier = getTier(character.level);

  // Set Theme Class
  document.body.className = `tier-${tier.id}`;

  // Date
  const d = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  document.getElementById('current-date-badge').textContent = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;

  // Card details
  document.getElementById('char-name').textContent = character.name;
  document.getElementById('char-title').textContent = character.title;
  document.getElementById('char-level').textContent = character.level;
  document.getElementById('char-tier-badge').textContent = tier.name;
  document.getElementById('char-avatar').textContent = tier.avatar;

  // EXP Bar
  const xpNeeded = getXpRequired(character.level);
  const xpPct = Math.min(100, Math.floor((character.xp / xpNeeded) * 100));
  document.getElementById('exp-text').textContent = `${character.xp} / ${xpNeeded} XP`;
  document.getElementById('exp-fill').style.width = `${xpPct}%`;

  // Stats
  document.getElementById('stat-int').textContent = character.stats.INT;
  document.getElementById('stat-str').textContent = character.stats.STR;
  document.getElementById('stat-vit').textContent = character.stats.VIT;
}

function renderGrindCards() {
  const container = document.getElementById('grind-cards-list');
  container.innerHTML = '';

  if (state.activities.length === 0) {
    container.innerHTML = '<div class="quest-empty">Belum ada aktivitas. Klik + Tambah Aktivitas untuk memulai!</div>';
    return;
  }

  state.activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'grind-card';

    // Format total accumulation (Universal Addition Math)
    let totalText = `${act.totalAmount} ${act.unit}`;
    if (act.unit.toLowerCase() === 'menit' && act.totalAmount >= 60) {
      totalText = `${(act.totalAmount / 60).toFixed(1)} Jam`;
    }

    const statClass = `stat-${act.stat.toLowerCase()}`;
    const sessions = act.sessionCount || 0;
    const rateText = `${act.xpPerUnit || 1} XP/${act.unit}`;

    card.innerHTML = `
      <div class="grind-card-info">
        <span class="grind-card-title">${escapeHtml(act.name)}</span>
        <div class="grind-card-meta">
          <span class="grind-stat-badge ${statClass}">+1 ${act.stat}</span>
          <span class="grind-xp-rate-badge">${rateText}</span>
          <span class="grind-total-badge">Total: ${totalText} (${sessions} sesi)</span>
        </div>
      </div>
      <div class="grind-card-actions">
        <button class="btn-grind-action" title="Catat Sesi Grind">
          <span>⚔️</span> GRIND
        </button>
        <button class="btn-icon-subtle btn-edit-act" title="Edit">✏️</button>
        <button class="btn-icon-subtle btn-del-act" title="Hapus">🗑️</button>
      </div>
    `;

    // Event: Grind
    card.querySelector('.btn-grind-action').addEventListener('click', () => {
      openGrindModal(act);
    });

    // Event: Edit
    card.querySelector('.btn-edit-act').addEventListener('click', () => {
      openActivityModal(act);
    });

    // Event: Delete
    card.querySelector('.btn-del-act').addEventListener('click', () => {
      if (confirm(`Hapus aktivitas "${act.name}"? (Data riwayat tetap tersimpan di log)`)) {
        state.activities = state.activities.filter(a => a.id !== act.id);
        saveState();
        renderApp();
      }
    });

    container.appendChild(card);
  });
}

function renderDashboard() {
  // 1. Lifetime accumulation cards (Universal Addition Display)
  const grid = document.getElementById('activity-grid');
  grid.innerHTML = '';

  if (state.activities.length === 0) {
    grid.innerHTML = '<div class="quest-empty" style="grid-column: span 2;">Belum ada aktivitas yang dicatat.</div>';
  } else {
    state.activities.forEach(act => {
      let displayValue = act.totalAmount;
      let displayUnit = act.unit;

      if (act.unit.toLowerCase() === 'menit' && act.totalAmount >= 60) {
        displayValue = (act.totalAmount / 60).toFixed(1);
        displayUnit = 'Jam';
      }

      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <span class="act-title">${escapeHtml(act.name)}</span>
        <span class="act-value">${displayValue} <span class="act-unit">${displayUnit}</span></span>
        <span class="act-sessions">${act.sessionCount || 0} sesi tercatat</span>
      `;
      grid.appendChild(card);
    });
  }

  // 2. Log Feed (Recent Sesi)
  const logFeed = document.getElementById('log-feed');
  logFeed.innerHTML = '';

  if (!state.logs || state.logs.length === 0) {
    logFeed.innerHTML = '<div class="quest-empty">Belum ada sesi yang dicatat hari ini.</div>';
  } else {
    state.logs.slice(0, 15).forEach(log => {
      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <div class="log-left">
          <span class="log-act-name">${escapeHtml(log.actName)} (+${log.amount} ${log.unit})</span>
          <span class="log-time">${log.time}</span>
        </div>
        <div class="log-right">
          <span class="log-xp">+${log.xp} XP</span>
          <button class="btn-icon-subtle" title="Batalkan/Hapus Sesi Ini" style="font-size:0.75rem;">✕</button>
        </div>
      `;

      item.querySelector('button').addEventListener('click', () => {
        deleteLogEntry(log.id);
      });

      logFeed.appendChild(item);
    });
  }

  // 3. Milestones
  renderMilestones();
}

function renderMilestones() {
  const list = document.getElementById('milestones-list');
  list.innerHTML = '';

  const milestones = [
    { title: 'Pemula Konsisten (Level 5)', current: state.character.level, target: 5 },
    { title: 'Status: Bronze Grinder (Level 10)', current: state.character.level, target: 10 },
    { title: 'Status: Silver Veteran (Level 25)', current: state.character.level, target: 25 },
    { title: 'Status: Royal Gold (Level 50)', current: state.character.level, target: 50 },
    { title: 'Status: Mythic Legend (Level 75)', current: state.character.level, target: 75 }
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

// --- POPULATE PRESET DROPDOWN IN MODAL ---
function populatePresetDropdown() {
  const select = document.getElementById('form-act-preset');
  select.innerHTML = '';

  UNIT_PRESETS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const selectedPreset = UNIT_PRESETS.find(p => p.id === select.value);
    if (selectedPreset && selectedPreset.id !== 'custom') {
      document.getElementById('form-act-stat').value = selectedPreset.stat;
      document.getElementById('form-act-unit').value = selectedPreset.unit;
      document.getElementById('form-act-xp').value = selectedPreset.xp;

      // Suggest name if currently empty
      const nameField = document.getElementById('form-act-name');
      if (!nameField.value.trim()) {
        const cleanName = selectedPreset.label.replace(/^[^\w]+/, '').replace(/\s*\([A-Z]+\)$/, '');
        nameField.value = cleanName;
      }
      updateFormCalcHint();
    }
  });
}

function updateFormCalcHint() {
  const unit = document.getElementById('form-act-unit').value || 'Unit';
  const xp = Number(document.getElementById('form-act-xp').value) || 1;
  const sample = unit.toLowerCase() === 'menit' ? 30 : 3;
  document.getElementById('form-act-calc-hint').textContent = `Contoh: Input ${sample} ${unit} × ${xp} XP = +${sample * xp} XP`;
}

// --- MODAL: GRIND / INPUT EFFORT ---
function openGrindModal(activity) {
  activeGrindActivity = activity;
  const modal = document.getElementById('modal-grind');
  const title = document.getElementById('modal-grind-activity-name');
  const prompt = document.getElementById('modal-grind-prompt');
  const unit = document.getElementById('grind-input-unit');
  const input = document.getElementById('grind-input-value');
  const presetsContainer = document.getElementById('grind-presets');

  title.textContent = `Aktivitas: ${activity.name}`;
  prompt.textContent = `Berapa ${activity.unit} yang kamu selesaikan?`;
  unit.textContent = activity.unit;

  presetsContainer.innerHTML = '';

  const updatePreview = () => {
    const val = Number(input.value) || 1;
    const xp = Math.round(val * (activity.xpPerUnit || 1));
    document.getElementById('preview-grind-stat').textContent = `+1 ${activity.stat}`;
    document.getElementById('preview-grind-xp').textContent = `+${xp} XP`;
  };

  input.oninput = updatePreview;

  // Use activity's presets or fallback
  const presets = activity.presets && activity.presets.length > 0 
    ? activity.presets 
    : (activity.unit.toLowerCase() === 'menit' ? [15, 30, 45, 60] : [1, 2, 5, 10]);

  input.value = presets[0] || 1;

  presets.forEach(val => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'preset-chip';
    chip.textContent = `+${val} ${activity.unit}`;
    chip.onclick = () => { input.value = val; updatePreview(); };
    presetsContainer.appendChild(chip);
  });

  updatePreview();
  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 50);
}

function closeGrindModal() {
  document.getElementById('modal-grind').style.display = 'none';
  activeGrindActivity = null;
}

// --- MODAL: ACTIVITY FORM (ADD / EDIT) ---
function openActivityModal(actToEdit = null) {
  const modal = document.getElementById('modal-activity');
  const title = document.getElementById('modal-activity-title');
  const formId = document.getElementById('form-act-id');
  const formPreset = document.getElementById('form-act-preset');
  const formName = document.getElementById('form-act-name');
  const formStat = document.getElementById('form-act-stat');
  const formUnit = document.getElementById('form-act-unit');
  const formXp = document.getElementById('form-act-xp');

  if (actToEdit) {
    title.textContent = 'Edit Aktivitas';
    formId.value = actToEdit.id;
    formPreset.value = actToEdit.presetId || 'custom';
    formName.value = actToEdit.name;
    formStat.value = actToEdit.stat;
    formUnit.value = actToEdit.unit;
    formXp.value = actToEdit.xpPerUnit || 1;
  } else {
    title.textContent = 'Tambah Aktivitas Baru';
    formId.value = '';
    formPreset.value = 'chapter_manga'; // friendly default
    formName.value = 'Immersion Manga';
    formStat.value = 'INT';
    formUnit.value = 'Chapter';
    formXp.value = 10;
  }

  updateFormCalcHint();
  modal.style.display = 'flex';
  setTimeout(() => formName.focus(), 50);
}

function closeActivityModal() {
  document.getElementById('modal-activity').style.display = 'none';
}

function saveActivityForm() {
  const id = document.getElementById('form-act-id').value;
  const presetId = document.getElementById('form-act-preset').value;
  const name = document.getElementById('form-act-name').value.trim();
  const stat = document.getElementById('form-act-stat').value;
  const unit = document.getElementById('form-act-unit').value.trim();
  const xpPerUnit = Math.max(1, Number(document.getElementById('form-act-xp').value) || 1);

  if (!name) {
    alert('Nama aktivitas tidak boleh kosong!');
    return;
  }
  if (!unit) {
    alert('Nama satuan tidak boleh kosong!');
    return;
  }

  // Derive quick presets from template if matched
  const matchedPreset = UNIT_PRESETS.find(p => p.id === presetId);
  const presets = (matchedPreset && matchedPreset.presets) ? matchedPreset.presets : [1, 2, 5, 10];

  if (id) {
    // Edit existing
    const act = state.activities.find(a => a.id === id);
    if (act) {
      act.name = name;
      act.presetId = presetId;
      act.stat = stat;
      act.unit = unit;
      act.xpPerUnit = xpPerUnit;
      act.presets = presets;
    }
  } else {
    // Add new
    const newAct = {
      id: 'act_' + Date.now(),
      name,
      presetId,
      stat,
      unit,
      xpPerUnit,
      presets,
      totalAmount: 0,
      sessionCount: 0
    };
    state.activities.push(newAct);
  }

  saveState();
  renderApp();
  closeActivityModal();
}

// --- BACKUP & RESTORE ---
function exportData() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `life-grinder-backup-${dateStr}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.character && imported.activities) {
        state = imported;
        saveState();
        renderApp();
        alert('Data berhasil di-restore!');
      } else {
        alert('Format file JSON tidak sesuai.');
      }
    } catch (err) {
      alert('Gagal memproses file JSON.');
    }
  };
  reader.readAsText(file);
}

// --- ESCAPE HTML ---
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

// --- INIT EVENTS ---
function initEvents() {
  populatePresetDropdown();

  // Dynamic Calc Hint on form changes
  document.getElementById('form-act-unit').addEventListener('input', updateFormCalcHint);
  document.getElementById('form-act-xp').addEventListener('input', updateFormCalcHint);

  // Tab Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Open Add Activity Modal
  document.getElementById('btn-add-activity').addEventListener('click', () => {
    openActivityModal();
  });

  // Grind Modal Events
  document.getElementById('btn-close-grind').addEventListener('click', closeGrindModal);
  document.getElementById('btn-cancel-grind').addEventListener('click', closeGrindModal);
  document.getElementById('btn-confirm-grind').addEventListener('click', () => {
    if (activeGrindActivity) {
      const val = document.getElementById('grind-input-value').value;
      submitGrind(activeGrindActivity, val);
      closeGrindModal();
    }
  });

  // Activity Form Modal Events
  document.getElementById('btn-close-activity').addEventListener('click', closeActivityModal);
  document.getElementById('btn-cancel-activity').addEventListener('click', closeActivityModal);
  document.getElementById('btn-save-activity').addEventListener('click', saveActivityForm);

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

  // Reset Progres
  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('PERINGATAN: Kamu yakin ingin menghapus seluruh progres karakter dan log aktivitas?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('LIFE_GRINDER_DATA_V1');
      loadState();
      renderApp();
      alert('Semua data berhasil direset ke awal.');
    }
  });

  // Ubah Nama Karakter
  document.getElementById('char-name').addEventListener('click', () => {
    const newName = prompt('Ubah nama karakter kamu:', state.character.name);
    if (newName && newName.trim()) {
      state.character.name = newName.trim();
      saveState();
      renderApp();
    }
  });
}

// --- BOOTSTRAP ---
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initEvents();
  renderApp();
});
