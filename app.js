// ===== Epley 1RM Formula =====
function epley(weight, reps) {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// ===== Helpers =====
function fmt(val) {
  if (val === Infinity || isNaN(val) || val === 0) return '—';
  return val.toFixed(1);
}

function pctFmt(val) {
  if (val === Infinity || isNaN(val)) return '—';
  return val.toFixed(1) + '%';
}

function getVal(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function getInt(id) {
  return parseInt(document.getElementById(id).value) || 0;
}

function calc1RM(weight, reps) {
  if (weight <= 0 || reps <= 0) return 0;
  return epley(weight, reps);
}

// Color-code symmetry: >=90 green, >=80 yellow, <80 red
function colorClass(pct) {
  if (pct >= 90) return 'good';
  if (pct >= 80) return 'warning';
  return 'danger';
}

// H:Q ratio color: 50-80% is ideal
function hqColorClass(pct) {
  if (pct >= 50 && pct <= 80) return 'good';
  if (pct >= 40 && pct <= 90) return 'warning';
  return 'danger';
}

function setColoredValue(el, text, cls) {
  el.textContent = text;
  el.classList.remove('good', 'warning', 'danger');
  if (cls) el.classList.add(cls);
}

// ===== Store computed 1RM values =====
let quad1RM = { left: 0, right: 0 };
let ham1RM  = { left: 0, right: 0 };

// ===== Current Exercise Type =====
let currentExerciseType = 'Leg Press';

// ===== Auto-fill date on load =====
function initDate() {
  const dateInput = document.getElementById('assessment-date');
  if (dateInput && !dateInput.value) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}

// ===== Exercise Type Switching =====
function setExerciseType(btn) {
  // Remove active from all pills
  document.querySelectorAll('.exercise-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  const type = btn.getAttribute('data-type');
  currentExerciseType = type;

  const othersRow = document.getElementById('others-input-row');
  const exerciseTitle = document.getElementById('exercise-title');
  const symmetryTitle = document.getElementById('symmetry-title');

  if (type === 'Others') {
    othersRow.style.display = 'block';
    const customName = document.getElementById('others-name').value.trim();
    const displayName = customName || 'Others';
    exerciseTitle.textContent = displayName;
    symmetryTitle.textContent = displayName;
  } else {
    othersRow.style.display = 'none';
    exerciseTitle.textContent = type;
    symmetryTitle.textContent = type;
  }
}

function updateOthersName() {
  const customName = document.getElementById('others-name').value.trim();
  const displayName = customName || 'Others';
  document.getElementById('exercise-title').textContent = displayName;
  document.getElementById('symmetry-title').textContent = displayName;
  currentExerciseType = displayName;
}

// ===== Main Calculation (Segments 1–3) =====
function calculateAll() {
  // ── SEGMENT 1: Quad 1RM ──
  const qlw = getVal('quad-left-weight');
  const qlr = getInt('quad-left-reps');
  const qrw = getVal('quad-right-weight');
  const qrr = getInt('quad-right-reps');

  quad1RM.left  = calc1RM(qlw, qlr);
  quad1RM.right = calc1RM(qrw, qrr);

  const quadLeftEl  = document.getElementById('quad-1rm-left');
  const quadRightEl = document.getElementById('quad-1rm-right');
  quadLeftEl.textContent  = quad1RM.left  > 0 ? fmt(quad1RM.left)  + ' kg' : '—';
  quadRightEl.textContent = quad1RM.right > 0 ? fmt(quad1RM.right) + ' kg' : '—';

  // ── SEGMENT 2: Symmetry + BW Ratio ──
  const isRL = document.getElementById('quad-sym-toggle').checked;
  const toggleLR = document.getElementById('quad-toggle-lr');
  const toggleRL = document.getElementById('quad-toggle-rl');
  const symLabel = document.getElementById('sym-direction-label');
  const symValue = document.getElementById('quad-sym-value');
  const symBar   = document.getElementById('quad-sym-bar');

  toggleLR.classList.toggle('active-left', !isRL);
  toggleLR.classList.remove('active-right');
  toggleRL.classList.toggle('active-right', isRL);
  toggleRL.classList.remove('active-left');

  symLabel.textContent = isRL ? 'R / L Symmetry' : 'L / R Symmetry';

  if (quad1RM.left > 0 && quad1RM.right > 0) {
    let ratio;
    if (isRL) {
      ratio = (quad1RM.right / quad1RM.left) * 100;
    } else {
      ratio = (quad1RM.left / quad1RM.right) * 100;
    }
    // Symmetry index is always the smaller/larger percentage
    const symPct = Math.min(ratio, (10000 / ratio));
    setColoredValue(symValue, pctFmt(ratio), colorClass(symPct));
    symBar.style.width = Math.min(100, symPct) + '%';
  } else {
    setColoredValue(symValue, '—', null);
    symBar.style.width = '0%';
  }

  // BW Ratio (always show Left/BW and Right/BW, no toggle)
  const bw = getVal('bodyweight');
  const bwLeftEl  = document.getElementById('bw-ratio-left');
  const bwRightEl = document.getElementById('bw-ratio-right');

  if (bw > 0 && quad1RM.left > 0) {
    bwLeftEl.textContent = pctFmt((quad1RM.left / bw) * 100);
  } else {
    bwLeftEl.textContent = '—';
  }

  if (bw > 0 && quad1RM.right > 0) {
    bwRightEl.textContent = pctFmt((quad1RM.right / bw) * 100);
  } else {
    bwRightEl.textContent = '—';
  }

  // ── SEGMENT 3: Hamstring 1RM + H:Q Ratio ──
  const hlw = getVal('ham-left-weight');
  const hlr = getInt('ham-left-reps');
  const hrw = getVal('ham-right-weight');
  const hrr = getInt('ham-right-reps');

  ham1RM.left  = calc1RM(hlw, hlr);
  ham1RM.right = calc1RM(hrw, hrr);

  const hamLeftEl  = document.getElementById('ham-1rm-left');
  const hamRightEl = document.getElementById('ham-1rm-right');
  hamLeftEl.textContent  = ham1RM.left  > 0 ? fmt(ham1RM.left)  + ' kg' : '—';
  hamRightEl.textContent = ham1RM.right > 0 ? fmt(ham1RM.right) + ' kg' : '—';

  // H:Q Ratio (hamstring 1RM / quad 1RM)
  const hqLeftEl  = document.getElementById('hq-left');
  const hqRightEl = document.getElementById('hq-right');

  if (ham1RM.left > 0 && quad1RM.left > 0) {
    const hqLeft = (ham1RM.left / quad1RM.left) * 100;
    setColoredValue(hqLeftEl, pctFmt(hqLeft), hqColorClass(hqLeft));
  } else {
    setColoredValue(hqLeftEl, '—', null);
  }

  if (ham1RM.right > 0 && quad1RM.right > 0) {
    const hqRight = (ham1RM.right / quad1RM.right) * 100;
    setColoredValue(hqRightEl, pctFmt(hqRight), hqColorClass(hqRight));
  } else {
    setColoredValue(hqRightEl, '—', null);
  }
}

// ===== Segment 4: Hop Test Calculations =====
function calculateHops() {
  const tests = [
    { prefix: 'hop1', sumId: 'hop-sum-1' },
    { prefix: 'hop3', sumId: 'hop-sum-3' },
    { prefix: 'hop3x', sumId: 'hop-sum-3x' }
  ];

  let hasAnyResult = false;

  tests.forEach(test => {
    const left  = getVal(`${test.prefix}-left`);
    const right = getVal(`${test.prefix}-right`);
    const lsiEl = document.getElementById(`${test.prefix}-lsi`);
    const sumEl = document.getElementById(test.sumId);

    if (left > 0 && right > 0) {
      const lsi = (Math.min(left, right) / Math.max(left, right)) * 100;
      const cls = colorClass(lsi);

      setColoredValue(lsiEl, lsi.toFixed(1) + '%', cls);
      setColoredValue(sumEl, lsi.toFixed(1) + '%', cls);
      hasAnyResult = true;
    } else {
      setColoredValue(lsiEl, '—', null);
      setColoredValue(sumEl, '—', null);
    }
  });

  document.getElementById('hop-summary').style.display = hasAnyResult ? 'block' : 'none';
}

// ═══════════════════════════════════════════════
// EXPORT SUMMARY PAGE
// ═══════════════════════════════════════════════

function getExerciseDisplayName() {
  const activeBtn = document.querySelector('.exercise-pill.active');
  if (!activeBtn) return 'Leg Press';
  const type = activeBtn.getAttribute('data-type');
  if (type === 'Others') {
    const customName = document.getElementById('others-name').value.trim();
    return customName || 'Others';
  }
  return type;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function showExportPage() {
  const overlay = document.getElementById('export-overlay');
  const exerciseName = getExerciseDisplayName();

  // Header
  document.getElementById('export-exercise-label').textContent = exerciseName;

  // Patient info
  const name = document.getElementById('patient-name').value.trim();
  document.getElementById('export-name').textContent = name || '—';

  const dateVal = document.getElementById('assessment-date').value;
  document.getElementById('export-date').textContent = formatDate(dateVal);

  const bw = getVal('bodyweight');
  document.getElementById('export-bw').textContent = bw > 0 ? bw.toFixed(1) + ' kg' : '—';

  // Strength title
  document.getElementById('export-strength-title').textContent =
    `${exerciseName} — Est. 1RM (Epley)`;

  // Quad weights & reps
  const qlw = getVal('quad-left-weight');
  const qlr = getInt('quad-left-reps');
  const qrw = getVal('quad-right-weight');
  const qrr = getInt('quad-right-reps');

  document.getElementById('exp-quad-wt-l').textContent = qlw > 0 ? qlw + ' kg' : '—';
  document.getElementById('exp-quad-wt-r').textContent = qrw > 0 ? qrw + ' kg' : '—';
  document.getElementById('exp-quad-reps-l').textContent = qlr > 0 ? qlr : '—';
  document.getElementById('exp-quad-reps-r').textContent = qrr > 0 ? qrr : '—';
  document.getElementById('exp-quad-1rm-l').textContent = quad1RM.left > 0 ? fmt(quad1RM.left) + ' kg' : '—';
  document.getElementById('exp-quad-1rm-r').textContent = quad1RM.right > 0 ? fmt(quad1RM.right) + ' kg' : '—';

  // Symmetry index (always show the min/max symmetry)
  const symEl = document.getElementById('exp-sym-index');
  if (quad1RM.left > 0 && quad1RM.right > 0) {
    const symPct = (Math.min(quad1RM.left, quad1RM.right) / Math.max(quad1RM.left, quad1RM.right)) * 100;
    setColoredValue(symEl, pctFmt(symPct), colorClass(symPct));
  } else {
    setColoredValue(symEl, '—', null);
  }

  // BW ratios
  const bwLEl = document.getElementById('exp-bw-l');
  const bwREl = document.getElementById('exp-bw-r');
  if (bw > 0 && quad1RM.left > 0) {
    bwLEl.textContent = pctFmt((quad1RM.left / bw) * 100);
  } else {
    bwLEl.textContent = '—';
  }
  if (bw > 0 && quad1RM.right > 0) {
    bwREl.textContent = pctFmt((quad1RM.right / bw) * 100);
  } else {
    bwREl.textContent = '—';
  }

  // Hamstring section
  const hlw = getVal('ham-left-weight');
  const hlr = getInt('ham-left-reps');
  const hrw = getVal('ham-right-weight');
  const hrr = getInt('ham-right-reps');
  const hasHam = hlw > 0 || hrw > 0;

  const hamSection = document.getElementById('export-ham-section');
  hamSection.style.display = hasHam ? 'block' : 'none';

  document.getElementById('exp-ham-wt-l').textContent = hlw > 0 ? hlw + ' kg' : '—';
  document.getElementById('exp-ham-wt-r').textContent = hrw > 0 ? hrw + ' kg' : '—';
  document.getElementById('exp-ham-reps-l').textContent = hlr > 0 ? hlr : '—';
  document.getElementById('exp-ham-reps-r').textContent = hrr > 0 ? hrr : '—';
  document.getElementById('exp-ham-1rm-l').textContent = ham1RM.left > 0 ? fmt(ham1RM.left) + ' kg' : '—';
  document.getElementById('exp-ham-1rm-r').textContent = ham1RM.right > 0 ? fmt(ham1RM.right) + ' kg' : '—';

  // H:Q ratios
  const hqLEl = document.getElementById('exp-hq-l');
  const hqREl = document.getElementById('exp-hq-r');
  if (ham1RM.left > 0 && quad1RM.left > 0) {
    const hqL = (ham1RM.left / quad1RM.left) * 100;
    setColoredValue(hqLEl, pctFmt(hqL), hqColorClass(hqL));
  } else {
    setColoredValue(hqLEl, '—', null);
  }
  if (ham1RM.right > 0 && quad1RM.right > 0) {
    const hqR = (ham1RM.right / quad1RM.right) * 100;
    setColoredValue(hqREl, pctFmt(hqR), hqColorClass(hqR));
  } else {
    setColoredValue(hqREl, '—', null);
  }

  // Hop tests
  const hopTests = [
    { prefix: 'hop1', expId: 'exp-hop1' },
    { prefix: 'hop3', expId: 'exp-hop3' },
    { prefix: 'hop3x', expId: 'exp-hop3x' }
  ];
  let hasAnyHop = false;

  hopTests.forEach(t => {
    const left  = getVal(`${t.prefix}-left`);
    const right = getVal(`${t.prefix}-right`);
    const el = document.getElementById(t.expId);
    if (left > 0 && right > 0) {
      const lsi = (Math.min(left, right) / Math.max(left, right)) * 100;
      setColoredValue(el, pctFmt(lsi), colorClass(lsi));
      hasAnyHop = true;
    } else {
      setColoredValue(el, '—', null);
    }
  });

  document.getElementById('export-hop-section').style.display = hasAnyHop ? 'block' : 'none';

  // Show overlay
  overlay.style.display = 'block';
  // Force reflow then animate
  overlay.offsetHeight;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function hideExportPage() {
  const overlay = document.getElementById('export-overlay');
  overlay.classList.remove('visible');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ===== Initialize on load =====
document.addEventListener('DOMContentLoaded', () => {
  initDate();
});
