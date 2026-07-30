/* global pianoAPI */

const $ = (id) => document.getElementById(id);

const songSelect = $('songSelect');
const songMeta = $('songMeta');
const speed = $('speed');
const speedVal = $('speedVal');
const humanize = $('humanize');
const btnPlay = $('btnPlay');
const btnStop = $('btnStop');
const statusText = $('statusText');
const progressBar = $('progressBar');
const noteInfo = $('noteInfo');
const missInfo = $('missInfo');
const btnAccess = $('btnAccess');
const btnTest = $('btnTest');
const accessBanner = $('accessBanner');
const btnGrantAccess = $('btnGrantAccess');
const btnOpenAccess2 = $('btnOpenAccess2');
const accessPath = $('accessPath');

const btnPreview = $('btnPreview');

let songs = [];
let playing = false;
let previewing = false;
const pianoPreview = window.PianoPreview ? new window.PianoPreview() : null;

function fmtMs(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function selectedId() {
  return songSelect.value;
}

function selectedSong() {
  return songs.find((s) => s.id === selectedId());
}

function updateMeta() {
  const s = selectedSong();
  if (!s) {
    songMeta.textContent = '—';
    return;
  }
  songMeta.textContent = `${s.artist} · ${s.genre} · ${s.bpm || '—'} BPM · ~${fmtMs(s.durationMs)}`;
}

function setPlayingUi(isPlaying) {
  playing = isPlaying;
  btnPlay.disabled = isPlaying;
  songSelect.disabled = isPlaying;
}

function applyStatus(st) {
  if (!st) return;
  const state = st.state || 'idle';
  if (state === 'playing') {
    setPlayingUi(true);
    statusText.textContent = `Playing — ${st.title || ''}`;
  } else if (state === 'finished') {
    setPlayingUi(false);
    statusText.textContent = 'Finished';
  } else if (state === 'stopped') {
    setPlayingUi(false);
    statusText.textContent = 'Stopped';
  } else if (state === 'error') {
    setPlayingUi(false);
    statusText.textContent = `Error: ${st.error || 'unknown'}`;
  } else {
    setPlayingUi(false);
    statusText.textContent = 'Idle';
  }

  const pct = Math.max(0, Math.min(100, (st.progress || 0) * 100));
  progressBar.style.width = `${pct}%`;
  noteInfo.textContent = `${st.noteIndex || 0} / ${st.total || 0} notes`;

  if (st.humanize) {
    missInfo.textContent = st.missed ? `missed ${st.missed}` : 'humanize on';
  } else {
    missInfo.textContent = '';
  }
}

async function startPlay() {
  if (previewing) {
    pianoPreview.stop();
    previewing = false;
    btnPreview.textContent = '▶ PREVIEW';
    btnPreview.classList.add('preview');
    btnPreview.classList.remove('active');
  }
  const id = selectedId();
  if (!id) return;
  statusText.textContent = 'Starting in 0.35s — focus the piano!';
  const res = await pianoAPI.playSong(id, {
    humanize: humanize.checked,
    speed: Number(speed.value) || 1,
  });
  if (!res.ok) {
    statusText.textContent = `Error: ${res.error}`;
    setPlayingUi(false);
    return;
  }
  setPlayingUi(true);
}

async function stopPlay() {
  await pianoAPI.stopSong();
  setPlayingUi(false);
  statusText.textContent = 'Stopped';
}

function groupSongs(list) {
  // optgroup by genre, prefer Metal / Classical order in label
  const groups = new Map();
  for (const s of list) {
    const g = s.genre || 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(s);
  }
  return groups;
}

function togglePreview() {
  if (!pianoPreview) {
    statusText.textContent = 'Preview unavailable (Web Audio not supported)';
    return;
  }

  if (previewing) {
    pianoPreview.stop();
    previewing = false;
    btnPreview.textContent = '▶ PREVIEW';
    btnPreview.classList.remove('active');
    btnPreview.classList.add('preview');
    statusText.textContent = 'Preview stopped';
    progressBar.style.width = '0%';
    noteInfo.textContent = '0 / 0 notes';
    return;
  }

  const s = selectedSong();
  if (!s) {
    statusText.textContent = 'No song selected';
    return;
  }

  pianoAPI.getSongNotes(s.id).then((notes) => {
    if (!notes || notes.length === 0) {
      statusText.textContent = 'No notes to preview';
      return;
    }

    previewing = true;
    btnPreview.textContent = '■ STOP PREVIEW';
    btnPreview.classList.add('active');
    btnPreview.classList.remove('preview');
    statusText.textContent = `Previewing — ${s.title}`;
    progressBar.style.width = '0%';
    noteInfo.textContent = `0 / ${notes.length} notes`;

    pianoPreview.play(notes, {
      speed: Number(speed.value) || 1,
      onNote(i) {
        const total = notes.length;
        const pct = Math.max(0, Math.min(100, ((i + 1) / total) * 100));
        progressBar.style.width = `${pct}%`;
        noteInfo.textContent = `${i + 1} / ${total} notes`;
      },
      onEnd() {
        previewing = false;
        btnPreview.textContent = '▶ PREVIEW';
        btnPreview.classList.add('preview');
        btnPreview.classList.remove('active');
        statusText.textContent = 'Preview finished';
      },
    });
  });
}

async function init() {
  songs = await pianoAPI.getSongs();
  songSelect.innerHTML = '';

  const groups = groupSongs(songs);
  // Preferred group order
  const order = [
    'Classical / Electronic',
    'Metal',
    'Classical',
    'Contemporary',
    'Pop',
    'Kids',
    'Other',
  ];
  const keys = [
    ...order.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !order.includes(k)).sort(),
  ];

  for (const g of keys) {
    const og = document.createElement('optgroup');
    og.label = g;
    for (const s of groups.get(g)) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.title} — ${s.artist}`;
      og.appendChild(opt);
    }
    songSelect.appendChild(og);
  }

  // Default to Beethoven Virus if present
  const bv = songs.find((s) => s.id === 'beethoven-virus');
  if (bv) songSelect.value = bv.id;
  updateMeta();

  songSelect.addEventListener('change', () => {
    if (previewing) {
      pianoPreview.stop();
      previewing = false;
      btnPreview.textContent = '▶ PREVIEW';
      btnPreview.classList.add('preview');
      btnPreview.classList.remove('active');
    }
    updateMeta();
  });
  speed.addEventListener('input', () => {
    speedVal.textContent = `${Number(speed.value).toFixed(2)}x`;
  });

  btnPlay.addEventListener('click', startPlay);
  btnStop.addEventListener('click', stopPlay);
  btnPreview.addEventListener('click', togglePreview);
  btnAccess.addEventListener('click', () => pianoAPI.openAccessibility());
  btnGrantAccess.addEventListener('click', async () => {
    const r = await pianoAPI.promptAccessibility();
    if (r.trusted) {
      accessBanner.style.display = 'none';
      statusText.textContent = 'Accessibility granted!';
    } else {
      statusText.textContent = 'Still not granted — try System Settings manually';
    }
  });
  btnOpenAccess2.addEventListener('click', () => pianoAPI.openAccessibility());
  btnTest.addEventListener('click', async () => {
    const r = await pianoAPI.testKey('a');
    statusText.textContent = r.ok ? 'Test key sent (a)' : `Test failed: ${r.error}`;
  });

  pianoAPI.onStatus(applyStatus);
  pianoAPI.onHotkeyStart(startPlay);
  pianoAPI.onHotkeyStop(stopPlay);

  // Accessibility banner
  pianoAPI.onAccessibilityStatus((trusted) => {
    if (!trusted) {
      accessBanner.style.display = 'block';
      accessPath.style.display = 'block';
    }
  });

  // Also check on init
  try {
    const acc = await pianoAPI.checkAccessibility();
    if (!acc.trusted) {
      accessBanner.style.display = 'block';
      accessPath.style.display = 'block';
    }
  } catch (_) {
    /* non-macOS or old API */
  }

  // Persist humanize preference
  try {
    const saved = localStorage.getItem('rph-humanize');
    if (saved === '1') humanize.checked = true;
  } catch (_) {
    /* ignore */
  }
  humanize.addEventListener('change', () => {
    try {
      localStorage.setItem('rph-humanize', humanize.checked ? '1' : '0');
    } catch (_) {
      /* ignore */
    }
  });
}

init().catch((err) => {
  statusText.textContent = `Init error: ${err.message || err}`;
});
