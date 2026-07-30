/**
 * Beethoven Virus — Roblox Virtual Piano arrangement
 * Focus: the viral "robot" run — rapid single-key machine-gun, climb, drop, double-time.
 * Timing is event-based (ms gaps), not dump-all-keys.
 */
const { run, stair, climb, rest, n, merge, repeat, durationOf } = require('./helpers');

// Core motif people mean by "dddddddd d d dddddd"
// Fast 16th-feel at ~150 BPM → ~100ms quarter, ~50ms 8th, ~25ms 16th burst
function virusBurst(baseKey, gap = 42) {
  // 8 rapid hits
  return merge(
    run(baseKey, gap, 8),
    rest(gap * 2),
    // isolated hits with space (the "d  d  d" part)
    [{ k: baseKey, d: gap * 3 }],
    [{ k: baseKey, d: gap * 3 }],
    [{ k: baseKey, d: gap * 2 }],
    rest(gap),
    // 6 rapid
    run(baseKey, gap, 6),
    rest(gap * 2),
    [{ k: baseKey, d: gap * 2 }],
    rest(gap),
    [{ k: baseKey, d: gap * 4 }]
  );
}

// One key, then walk UP the scale, back DOWN, then double-speed the whole thing
function virusStairDouble(scale, slowGap = 55) {
  const upDown = stair(scale, slowGap, 1);
  const doubled = stair(scale, Math.max(22, Math.round(slowGap / 2)), 1);
  return merge(
    // single anchor hits
    run(scale[0], slowGap, 1),
    rest(slowGap),
    upDown,
    rest(slowGap * 2),
    // double-time mirror
    doubled,
    rest(slowGap * 3)
  );
}

// Classic BV-style right-hand machine section on E (d key in mid VP)
function machineSection() {
  const d = 'd'; // E4-ish on common VP
  return merge(
    // Intro stutter
    run(d, 70, 4),
    rest(140),
    run(d, 48, 8),
    rest(96),
    [{ k: d, d: 120 }],
    [{ k: d, d: 120 }],
    [{ k: d, d: 90 }],
    rest(60),
    run(d, 38, 12),
    rest(150),

    // The meme line: dddddddd  d  d  dddddd  d  d
    virusBurst(d, 40),
    rest(180),

    // Climb: d f g h j then back, then double
    virusStairDouble('dfghj', 50),

    // Higher register climb on h j k l
    virusStairDouble('hjkl', 46),

    // Full speed robot cascade across a longer scale
    stair('asdfghjkl', 36, 2),
    rest(200),
    stair('asdfghjkl', 22, 2), // double-time
    rest(240),

    // Alternating pulse (robot offbeat)
    ...Array.from({ length: 16 }, (_, i) => ({
      k: i % 2 === 0 ? 'd' : 'f',
      d: i < 8 ? 55 : 40,
    })),
    rest(160),

    // Triple burst crescendo
    run(d, 55, 4),
    rest(80),
    run(d, 40, 8),
    rest(60),
    run(d, 28, 16),
    rest(200),

    // Final stair double + landing chord
    virusStairDouble('sdfghj', 44),
    [{ k: 'adg', d: 400, hold: 180 }],
    rest(300)
  );
}

// Soft melodic intro before the virus hits (recognizable BV vibe in minor)
function melodicIntro() {
  // Simplified minor motif — slow expressive, then tighten
  return merge(
    [
      n('s', 280, 40),
      n('d', 280, 40),
      n('f', 280, 40),
      n('g', 400, 60),
      n('f', 200),
      n('d', 200),
      n('s', 360, 50),
    ],
    rest(200),
    [
      n('a', 200),
      n('s', 200),
      n('d', 200),
      n('f', 320, 40),
      n('d', 180),
      n('s', 400, 50),
    ],
    rest(280),
    // Tension build: accelerating repeated note
    run('d', 120, 2),
    run('d', 90, 2),
    run('d', 70, 4),
    run('d', 50, 4),
    run('d', 36, 8),
    rest(220)
  );
}

// Mid section: call-response between low and high
function callResponse() {
  return merge(
    climb('asdf', 70, 1),
    rest(40),
    climb('ghjk', 70, 1),
    rest(80),
    climb('asdf', 50, 1),
    climb('ghjk', 50, 1),
    rest(100),
    // reverse answers
    climb('kjih', 55, 1),
    climb('gfed', 55, 1),
    rest(160),
    virusBurst('g', 36),
    rest(200)
  );
}

const notes = merge(
  melodicIntro(),
  machineSection(),
  callResponse(),
  // Reprise super-fast virus — this is the "robot playing" peak
  virusBurst('d', 34),
  rest(120),
  stair('adfghjkl', 30, 3),
  rest(100),
  stair('adfghjkl', 20, 2),
  rest(160),
  run('d', 25, 24),
  rest(80),
  run('f', 25, 16),
  rest(80),
  run('g', 22, 16),
  rest(120),
  // Ending: stair once slow, once double, land
  stair('dfghjk', 48, 1),
  stair('dfghjk', 24, 1),
  rest(150),
  [n('d', 200), n('g', 200), n('adg', 600, 220)],
  rest(400)
);

module.exports = {
  id: 'beethoven-virus',
  title: 'Beethoven Virus',
  artist: 'Diana Boncheva / Classical Remix',
  genre: 'Classical / Electronic',
  bpm: 150,
  notes,
  durationMs: durationOf(notes),
};
