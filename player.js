/**
 * Smart Roblox Virtual Piano player.
 * Sends real OS keystrokes (no game injection) with correct tempo, rests, chords.
 * Optional humanize: timing jitter + rare missed notes for realism.
 */

let robot = null;
try {
  robot = require('@jitsi/robotjs');
  robot.setKeyboardDelay(0);
} catch (err) {
  console.warn('[player] robotjs unavailable:', err.message);
}

const VALID_KEYS = new Set(
  '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM!@$%^&*()'.split('')
);

const NATURAL_FROM_SHIFT = {
  '!': '1',
  '@': '2',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
};

class Player {
  constructor() {
    this._timer = null;
    this._playing = false;
    this._stopped = true;
    this._song = null;
    this._index = 0;
    this._options = { humanize: false, speed: 1 };
    this._onStatus = null;
    this._totalNotes = 0;
    this._missed = 0;
    this._played = 0;
  }

  getStatus() {
    return {
      state: this._playing ? 'playing' : this._stopped ? 'stopped' : 'idle',
      songId: this._song ? this._song.id : null,
      title: this._song ? this._song.title : null,
      noteIndex: this._index,
      total: this._totalNotes,
      progress: this._totalNotes ? this._index / this._totalNotes : 0,
      missed: this._missed,
      played: this._played,
      humanize: !!this._options.humanize,
    };
  }

  stop() {
    this._playing = false;
    this._stopped = true;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    try {
      if (robot) robot.keyToggle('shift', 'up');
    } catch (_) {
      /* ignore */
    }
  }

  play(song, options = {}) {
    if (!song || !Array.isArray(song.notes) || song.notes.length === 0) {
      throw new Error('Song has no notes');
    }
    if (!robot) {
      throw new Error(
        'Keyboard driver not loaded. Run npm install, then grant Accessibility to Electron.'
      );
    }

    this.stop();
    this._song = song;
    this._index = 0;
    this._missed = 0;
    this._played = 0;
    this._totalNotes = song.notes.length;
    this._options = {
      humanize: !!options.humanize,
      speed: Math.max(0.25, Math.min(2, Number(options.speed) || 1)),
    };
    this._onStatus = typeof options.onStatus === 'function' ? options.onStatus : null;
    this._playing = true;
    this._stopped = false;

    this._emit({
      state: 'playing',
      songId: song.id,
      title: song.title,
      noteIndex: 0,
      total: this._totalNotes,
      progress: 0,
      missed: 0,
      played: 0,
      humanize: this._options.humanize,
    });

    // Brief delay so user can alt-tab / click the Roblox piano after pressing +
    this._timer = setTimeout(() => this._tick(), 350);
  }

  tapKey(keyChar) {
    if (!robot) throw new Error('robotjs not available');
    this._pressKeys(String(keyChar));
  }

  _emit(extra = {}) {
    if (!this._onStatus) return;
    this._onStatus({ ...this.getStatus(), ...extra });
  }

  _tick() {
    if (!this._playing || !this._song) return;

    const notes = this._song.notes;
    if (this._index >= notes.length) {
      this._playing = false;
      this._stopped = true;
      this._emit({ state: 'finished', progress: 1, noteIndex: notes.length });
      return;
    }

    const note = notes[this._index];
    const speed = this._options.speed;
    let delay = Math.max(1, Math.round((note.d || 100) / speed));

    if (this._options.humanize) {
      const jitter = 1 + (Math.random() * 0.08 - 0.04);
      delay = Math.max(1, Math.round(delay * jitter));
    }

    const keys = normalizeKeys(note.k);
    const isRest = keys.length === 0;

    // ~1.2% miss rate on non-rests when humanize is on
    let miss = false;
    if (this._options.humanize && !isRest && Math.random() < 0.012) {
      miss = true;
      this._missed += 1;
    }

    // Rare hesitation before very fast notes
    if (this._options.humanize && !isRest && note.d && note.d < 90 && Math.random() < 0.03) {
      delay += 15 + Math.floor(Math.random() * 40);
    }

    if (!isRest && !miss) {
      try {
        this._pressKeys(keys, note.hold);
        this._played += 1;
      } catch (err) {
        this._playing = false;
        this._emit({ state: 'error', error: err.message || String(err) });
        return;
      }
    }

    this._index += 1;

    if (this._index % 8 === 0 || this._index >= notes.length) {
      this._emit({
        state: 'playing',
        noteIndex: this._index,
        progress: this._index / this._totalNotes,
        lastKeys: keys.join(''),
        missed: this._missed,
        played: this._played,
        missedThis: miss,
      });
    }

    this._timer = setTimeout(() => this._tick(), delay);
  }

  /**
   * Fire one or more Virtual Piano keys.
   * Chords: ultra-fast sequential taps (Roblox VP registers these as a chord).
   * holdMs: optional extra sustain for long expressive notes.
   */
  _pressKeys(keys, holdMs = 0) {
    const list = Array.isArray(keys) ? keys : normalizeKeys(keys);
    if (!list.length) return;

    const hold = Math.max(0, Math.min(400, holdMs || 0));

    for (let i = 0; i < list.length; i++) {
      tapOne(list[i]);
      if (i < list.length - 1) busyWait(4);
    }

    if (hold > 0) busyWait(hold);
  }
}

function tapOne(k) {
  const { key, shift } = mapToRobotKey(k);
  if (shift) {
    robot.keyTap(key, 'shift');
  } else {
    robot.keyTap(key);
  }
}

function busyWait(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* intentional short spin for key sustain gaps */
  }
}

function normalizeKeys(k) {
  if (k == null || k === '' || k === ' ' || k === '-' || k === '.') return [];
  if (Array.isArray(k)) return k.filter((c) => c && VALID_KEYS.has(c));
  return String(k)
    .split('')
    .filter((c) => VALID_KEYS.has(c));
}

function mapToRobotKey(k) {
  if (NATURAL_FROM_SHIFT[k]) {
    return { key: NATURAL_FROM_SHIFT[k], shift: true };
  }
  if (k.length === 1 && k >= 'A' && k <= 'Z') {
    return { key: k.toLowerCase(), shift: true };
  }
  return { key: String(k).toLowerCase(), shift: false };
}

module.exports = { Player };
