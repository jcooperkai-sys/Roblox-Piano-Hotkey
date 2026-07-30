/**
 * Piano Preview — Web Audio synthesis of Virtual Piano {k, d, hold} arrays.
 * No MIDI, no external libs — just AudioContext + accurate key→frequency mapping.
 *
 * Usage:
 *   const pv = new PianoPreview();
 *   pv.play(song.notes, { speed, onNote, onEnd });
 *   pv.stop();
 */

const SHIFT_MAP = {
  '!': '1', '@': '2', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
};

// VP key → MIDI note number (standard 36-96 mapping)
const KEY_MIDI = (() => {
  const m = {};
  // Lower octave: 1234567890 → C3..A3  (36..45)
  const nums = '1234567890';
  for (let i = 0; i < nums.length; i++) m[nums[i]] = 36 + i;
  // Middle octave: qwertyuiop → Bb3..A4  (46..57)
  const qrow = 'qwertyuiop';
  for (let i = 0; i < qrow.length; i++) m[qrow[i]] = 46 + i;
  // Upper octave: asdfghjkl → Bb4..A5  (58..69)
  const arow = 'asdfghjkl';
  for (let i = 0; i < arow.length; i++) m[arow[i]] = 58 + i;
  // Top octave: zxcvbnm → Bb5..D6  (70..74)
  const zrow = 'zxcvbnm';
  for (let i = 0; i < zrow.length; i++) m[zrow[i]] = 70 + i;
  return m;
})();

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function keyToMidi(k) {
  if (k == null) return -1;
  const s = String(k);
  if (s === '' || s === ' ' || s === '-' || s === '.') return -1;
  const base = s.length === 1 && s >= 'A' && s <= 'Z' ? s.toLowerCase() : (SHIFT_MAP[s] || s);
  const val = KEY_MIDI[base];
  if (val === undefined) return -1;
  // Uppercase original = sharp (+1 semitone)
  if (s.length === 1 && s >= 'A' && s <= 'Z') return val + 1;
  if (SHIFT_MAP[s] !== undefined) return val + 1;
  return val;
}

class PianoPreview {
  constructor() {
    this._ctx = null;
    this._playing = false;
    this._stopFlag = false;
    this._gainNode = null;
  }

  get isPlaying() { return this._playing; }

  _ensureCtx() {
    if (!this._ctx || this._ctx.state === 'closed') {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    if (!this._gainNode) {
      this._gainNode = this._ctx.createGain();
      this._gainNode.gain.value = 0.35;
      this._gainNode.connect(this._ctx.destination);
    }
  }

  stop() {
    this._stopFlag = true;
    this._playing = false;
  }

  /**
   * Play notes array through Web Audio.
   * @param {Array} notes - [{k, d, hold}] arrays
   * @param {object} opts - { speed, onNote(index), onEnd() }
   * @returns {Promise} resolves when finished or stopped
   */
  play(notes, opts = {}) {
    this.stop();
    this._ensureCtx();
    const ctx = this._ctx;
    const speed = Math.max(0.25, Math.min(4, Number(opts.speed) || 1));
    const onNote = typeof opts.onNote === 'function' ? opts.onNote : null;
    const onEnd = typeof opts.onEnd === 'function' ? opts.onEnd : null;

    this._playing = true;
    this._stopFlag = false;

    const startCtxTime = ctx.currentTime + 0.05;
    let currentTime = startCtxTime;

    // Schedule all notes immediately — AudioContext handles the rest
    const scheduled = [];

    for (let i = 0; i < notes.length; i++) {
      if (this._stopFlag) break;

      const note = notes[i];
      const delay = (note.d || 100) / speed / 1000; // seconds
      currentTime += delay;

      const keys = this._parseKeys(note.k);
      if (keys.length === 0) continue;

      const holdSec = (note.hold || 0) / 1000;

      for (const midi of keys) {
        if (midi < 0) continue;
        const freq = midiToFreq(midi);
        this._schedulePianoNote(ctx, freq, currentTime, holdSec);
      }

      if (onNote) {
        const idx = i;
        const when = (currentTime - startCtxTime) * 1000;
        const tid = setTimeout(() => onNote(idx), Math.max(0, when));
        scheduled.push(tid);
      }
    }

    // Detect end
    const totalMs = (currentTime - startCtxTime) * 1000;
    const endTid = setTimeout(() => {
      this._playing = false;
      if (onEnd) onEnd();
    }, totalMs + 50);
    scheduled.push(endTid);

    this._scheduled = scheduled;
    return this;
  }

  _parseKeys(k) {
    if (k == null || k === '' || k === ' ' || k === '-' || k === '.') return [];
    if (Array.isArray(k)) return k.map(c => keyToMidi(c)).filter(m => m >= 0);
    return String(k).split('').map(c => keyToMidi(c)).filter(m => m >= 0);
  }

  /**
   * Schedule a single piano-like tone.
   * Layers: fundamental (triangle) + 2 harmonics (sine) + bright attack (sawtooth).
   */
  _schedulePianoNote(ctx, freq, startTime, holdSec) {
    const dest = this._gainNode;
    const hold = Math.max(0.08, holdSec + 0.5); // sustain at least 500ms after hold

    // --- Master envelope ---
    const master = ctx.createGain();
    master.connect(dest);

    // Attack: ~5ms
    master.gain.setValueAtTime(0, startTime);
    master.gain.linearRampToValueAtTime(1, startTime + 0.005);

    // Quick initial drop (piano-like percussive envelope)
    master.gain.setTargetAtTime(0.72, startTime + 0.005, 0.03);

    // Sustain phase
    if (hold > 0.1) {
      master.gain.setTargetAtTime(0.45, startTime + 0.15, hold * 0.5);
    }

    // Release
    master.gain.setTargetAtTime(0, startTime + hold, 0.15);

    const endTime = startTime + hold + 0.8;

    // --- Fundamental: triangle (warm, close to piano) ---
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    const g1 = ctx.createGain();
    g1.gain.value = 0.55;
    osc1.connect(g1).connect(master);
    osc1.start(startTime);
    osc1.stop(endTime);

    // --- 2nd harmonic: sine (adds body) ---
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const g2 = ctx.createGain();
    g2.gain.value = 0.22;
    osc2.connect(g2).connect(master);
    osc2.start(startTime);
    osc2.stop(endTime);

    // --- 3rd harmonic: sine (brightness) ---
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, startTime);
    const g3 = ctx.createGain();
    g3.gain.value = 0.09;
    osc3.connect(g3).connect(master);
    osc3.start(startTime);
    osc3.stop(endTime);

    // --- Attack transient: short bright burst (piano hammer noise) ---
    const noise = ctx.createOscillator();
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(freq * 6.2, startTime);
    const gN = ctx.createGain();
    gN.gain.setValueAtTime(0.12, startTime);
    gN.gain.setTargetAtTime(0, startTime + 0.004, 0.008);
    noise.connect(gN).connect(master);
    noise.start(startTime);
    noise.stop(startTime + 0.06);

    // --- Sub: soft low octave for depth ---
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq / 2, startTime);
    const gS = ctx.createGain();
    gS.gain.value = 0.1;
    sub.connect(gS).connect(master);
    sub.start(startTime);
    sub.stop(endTime);
  }
}

// Expose globally for renderer.js
window.PianoPreview = PianoPreview;
