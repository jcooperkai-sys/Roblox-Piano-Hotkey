#!/usr/bin/env node
/**
 * Score a converted Virtual Piano song for how hard it is for a human pianist.
 *
 * The player sends OS keystrokes, so none of this constrains playback -- the machine is unbothered
 * by anything below. The point is to say honestly where an arrangement sits relative to human hands,
 * and to find which passages are outright impossible rather than merely difficult.
 *
 * Thresholds are physical, not stylistic:
 *   - 10 fingers. More than 10 simultaneous notes cannot be struck at once, full stop.
 *   - A large adult hand spans roughly a 10th, about 16 semitones, at full stretch. 14 is a
 *     comfortable ceiling for a chord that must be struck cleanly together.
 *   - A hand covers ground at roughly 30 semitones per 100ms in a trained leap. Beyond that the
 *     arm cannot arrive in time.
 *   - One finger repeats a key at about 8-14 strikes per second; a trill alternating two fingers
 *     reaches roughly 16 per second.
 *
 * Usage: node tools/difficulty.js songs/giorno-data.js
 *        node tools/difficulty.js --song giorno        (scores a registered song by id)
 */

const path = require('path');

// Inverse of the converter's map, so spans can be measured in real semitones.
const NOTE_TO_KEY = {
  36: '1', 37: '!', 38: '2', 39: '@', 40: '3', 41: '4', 42: '$', 43: '5',
  44: '%', 45: '6', 46: '^', 47: '7', 48: '8', 49: '*', 50: '9', 51: '(',
  52: '0', 53: 'q', 54: 'Q', 55: 'w', 56: 'W', 57: 'e', 58: 'E', 59: 'r',
  60: 't', 61: 'T', 62: 'y', 63: 'Y', 64: 'u', 65: 'i', 66: 'I', 67: 'o',
  68: 'O', 69: 'p', 70: 'P', 71: 'a', 72: 's', 73: 'S', 74: 'd', 75: 'D',
  76: 'f', 77: 'g', 78: 'G', 79: 'h', 80: 'H', 81: 'j', 82: 'J', 83: 'k',
  84: 'l', 85: 'L', 86: 'z', 87: 'Z', 88: 'x', 89: 'c', 90: 'C', 91: 'v',
  92: 'V', 93: 'b', 94: 'B', 95: 'n', 96: 'm',
};
const KEY_TO_MIDI = {};
for (const [m, k] of Object.entries(NOTE_TO_KEY)) KEY_TO_MIDI[k] = Number(m);

const FINGERS = 10;
const HAND_SPAN = 14;        // semitones, struck cleanly together
const LEAP_PER_100MS = 30;   // semitones a hand can travel
const TRILL_PER_SEC = 16;    // two fingers alternating

/** Can this set of pitches be taken by two hands at all? */
function twoHandFeasible(pitches) {
  if (pitches.length > FINGERS) return false;
  const sorted = [...pitches].sort((a, b) => a - b);
  // Try every split point; each hand takes a contiguous block, which is how hands actually work.
  for (let split = 0; split <= sorted.length; split++) {
    const left = sorted.slice(0, split);
    const right = sorted.slice(split);
    const ok = (h) => h.length <= 5 && (h.length === 0 || h[h.length - 1] - h[0] <= HAND_SPAN);
    if (ok(left) && ok(right)) return true;
  }
  return false;
}

function analyze(notes) {
  const findings = [];
  let tMs = 0;
  let prevPitches = null;
  let prevT = 0;

  let maxSimul = 0;
  let maxSpan = 0;
  let impossibleChords = 0;
  let overSpanChords = 0;
  let impossibleLeaps = 0;
  let taps = 0;

  const events = [];

  for (const e of notes) {
    const keys = String(e.k || '').split('').filter((c) => KEY_TO_MIDI[c] !== undefined);
    const pitches = keys.map((c) => KEY_TO_MIDI[c]);
    taps += pitches.length;

    if (pitches.length) {
      events.push({ t: tMs, n: pitches.length });
      maxSimul = Math.max(maxSimul, pitches.length);

      const span = Math.max(...pitches) - Math.min(...pitches);
      maxSpan = Math.max(maxSpan, span);

      if (pitches.length > FINGERS) {
        impossibleChords++;
        findings.push({ tMs, kind: 'more notes than fingers', detail: `${pitches.length} notes at once`, keys: e.k });
      } else if (!twoHandFeasible(pitches)) {
        impossibleChords++;
        findings.push({ tMs, kind: 'no two-hand partition', detail: `${pitches.length} notes spanning ${span} semitones`, keys: e.k });
      } else if (span > HAND_SPAN * 2) {
        overSpanChords++;
      }

      if (prevPitches) {
        const dt = tMs - prevT;
        // Cheapest possible reassignment: how far the nearer hand must travel.
        const move = Math.min(
          Math.abs(Math.min(...pitches) - Math.min(...prevPitches)),
          Math.abs(Math.max(...pitches) - Math.max(...prevPitches)),
        );
        const budget = (LEAP_PER_100MS * Math.max(dt, 1)) / 100;
        if (move > budget) {
          impossibleLeaps++;
          findings.push({ tMs, kind: 'leap too fast', detail: `${move} semitones in ${dt}ms`, keys: e.k });
        }
      }
      prevPitches = pitches;
      prevT = tMs;
    }
    tMs += e.d || 0;
  }

  // Densest one-second window, measured in keystrokes.
  let peak = 0;
  let peakAt = 0;
  for (let i = 0; i < events.length; i++) {
    let sum = 0;
    for (let j = i; j < events.length && events[j].t - events[i].t < 1000; j++) sum += events[j].n;
    if (sum > peak) { peak = sum; peakAt = events[i].t; }
  }

  return {
    durationMs: tMs,
    entries: notes.length,
    taps,
    maxSimul,
    maxSpan,
    impossibleChords,
    overSpanChords,
    impossibleLeaps,
    peakTapsPerSec: peak,
    peakAt,
    findings,
  };
}

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function main() {
  const args = process.argv.slice(2);
  let notes;
  let label;

  if (args[0] === '--song' && args[1]) {
    const { SONGS } = require(path.join(__dirname, '..', 'songs'));
    const song = SONGS.find((s) => s.id === args[1]);
    if (!song) {
      console.error(`No song with id "${args[1]}". Known: ${SONGS.map((s) => s.id).join(', ')}`);
      process.exit(1);
    }
    notes = song.notes;
    label = `${song.title} — ${song.artist}`;
  } else if (args[0]) {
    const loaded = require(path.resolve(args[0]));
    notes = Array.isArray(loaded) ? loaded : loaded.notes;
    label = args[0];
  } else {
    console.error('Usage: difficulty.js <notes-file.js> | --song <id>');
    process.exit(1);
  }

  const r = analyze(notes);
  const impossible = r.impossibleChords + r.impossibleLeaps;

  console.log(`\n${label}`);
  console.log('='.repeat(label.length));
  console.log(`duration              ${fmt(r.durationMs)}`);
  console.log(`entries / keystrokes  ${r.entries} / ${r.taps}`);
  console.log(`peak keystrokes/sec   ${r.peakTapsPerSec}  (at ${fmt(r.peakAt)})`);
  console.log(`widest chord          ${r.maxSimul} notes`);
  console.log(`widest span           ${r.maxSpan} semitones (${(r.maxSpan / 12).toFixed(1)} octaves)`);
  console.log('');
  console.log(`chords a human cannot strike   ${r.impossibleChords}`);
  console.log(`chords needing both hands wide ${r.overSpanChords}`);
  console.log(`leaps faster than a hand moves ${r.impossibleLeaps}`);
  console.log('');

  const verdict =
    impossible === 0 && r.peakTapsPerSec <= TRILL_PER_SEC
      ? 'PLAYABLE by a trained pianist'
      : impossible === 0
        ? 'PLAYABLE but at or past comfortable speed'
        : `NOT humanly playable — ${impossible} impossible events`;
  console.log(`verdict: ${verdict}`);

  if (r.findings.length) {
    console.log(`\nfirst impossible events (${r.findings.length} total):`);
    for (const f of r.findings.slice(0, 12)) {
      console.log(`  ${fmt(f.tMs).padStart(5)}  ${f.kind.padEnd(24)} ${f.detail}  [${f.keys}]`);
    }
  }
  console.log('');
}

if (require.main === module) main();
module.exports = { analyze, twoHandFeasible, KEY_TO_MIDI };
