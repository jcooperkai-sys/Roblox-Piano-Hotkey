/** Shared builders for timed Virtual Piano note sequences. */

function run(keyOrKeys, gap, times = 1) {
  const keys = String(keyOrKeys).split('');
  const seq = [];
  for (let t = 0; t < times; t++) {
    for (const k of keys) seq.push({ k, d: gap });
  }
  return seq;
}

/** Ascend then descend a scale string. rounds = full up-down cycles. */
function stair(scale, gap, rounds = 1) {
  const up = scale.split('');
  const down = up.slice(0, -1).reverse();
  const cycle = up.concat(down);
  const seq = [];
  for (let r = 0; r < rounds; r++) {
    for (const k of cycle) seq.push({ k, d: gap });
  }
  return seq;
}

/** Climb only (no descent). */
function climb(scale, gap, times = 1) {
  const keys = scale.split('');
  const seq = [];
  for (let t = 0; t < times; t++) {
    for (const k of keys) seq.push({ k, d: gap });
  }
  return seq;
}

function rest(ms) {
  return [{ k: '', d: ms }];
}

function n(k, d, hold) {
  const note = { k, d };
  if (hold) note.hold = hold;
  return note;
}

function chord(keys, d, hold) {
  return n(keys, d, hold);
}

function merge(...parts) {
  return parts.flat();
}

function repeat(seq, times) {
  const out = [];
  for (let i = 0; i < times; i++) out.push(...seq);
  return out;
}

function durationOf(notes) {
  return notes.reduce((s, x) => s + (x.d || 0), 0);
}

/**
 * Convert a simple spaced sheet with optional :ms suffixes.
 * Example: "d:80 d:80 _:200 e:120"
 */
function sheet(str, defaultGap = 120) {
  return str
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      if (tok === '-' || tok === '_' || tok.startsWith('_:') || tok.startsWith('-:')) {
        const parts = tok.split(':');
        return { k: '', d: parts[1] ? Number(parts[1]) : defaultGap };
      }
      const idx = tok.lastIndexOf(':');
      if (idx > 0 && /^\d+$/.test(tok.slice(idx + 1))) {
        return { k: tok.slice(0, idx), d: Number(tok.slice(idx + 1)) };
      }
      return { k: tok, d: defaultGap };
    });
}

module.exports = {
  run,
  stair,
  climb,
  rest,
  n,
  chord,
  merge,
  repeat,
  durationOf,
  sheet,
};
