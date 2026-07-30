const { n, rest, merge, repeat, run, climb, durationOf, sheet } = require('./helpers');

/**
 * Slipknot piano riff arrangements for Roblox Virtual Piano.
 * Melodic / rhythmic reductions of main hooks — legal keystroke playback only.
 */

function eyeless() {
  // Drop-tuned nu-metal chug feel → low octave pulse + dissonant stabs
  // Main rhythmic cell ~140 BPM, palm-mute like short notes
  const chug = [
    n('1', 90),
    n('1', 90),
    n('1', 90),
    n('1', 90),
    n('q', 120),
    n('1', 90),
    n('1', 90),
    n('2', 140),
  ];
  const stab = [
    n('1q', 160, 40),
    rest(40),
    n('2w', 160, 40),
    rest(40),
    n('1q', 120),
    n('4', 100),
    n('5', 180),
  ];
  // "You can't see..." style melodic top line (simplified)
  const vocalish = sheet(
    'e:160 e:160 r:160 t:200 _:80 t:140 r:140 e:180 w:200 _:120 e:140 r:140 t:160 y:220 _:100 t:140 r:160 e:240',
    140
  );
  return merge(
    repeat(chug, 4),
    rest(200),
    stab,
    rest(160),
    repeat(chug, 2),
    vocalish,
    rest(120),
    repeat(chug, 4),
    // Breakdown: slower heavier hits
    [
      n('1', 200, 50),
      n('1', 200, 50),
      n('q', 280, 60),
      n('1', 200),
      n('2', 200),
      n('1q', 400, 80),
    ],
    rest(200),
    repeat(chug, 4),
    vocalish,
    // Ending slam
    run('1', 70, 8),
    [n('1q', 500, 120)],
    rest(300)
  );
}

function waitAndBleed() {
  // Famous acoustic/intro-friendly melody + chorus punch
  // ~140 BPM feel
  const intro = sheet(
    'e:200 r:200 t:240 _:60 t:180 r:180 e:220 w:260 _:100 e:180 e:180 r:180 t:200 y:280 _:80 t:160 r:180 e:320',
    180
  );
  const verseRiff = [
    n('w', 140),
    n('e', 140),
    n('r', 140),
    n('e', 140),
    n('w', 140),
    n('q', 180),
    n('w', 200),
    rest(80),
    n('w', 140),
    n('e', 140),
    n('r', 140),
    n('t', 180),
    n('r', 140),
    n('e', 200),
  ];
  const chorus = sheet(
    't:160 t:160 y:160 u:200 _:40 u:140 y:140 t:160 r:180 _:60 t:140 y:140 u:160 i:240 _:80 u:140 y:160 t:280',
    150
  );
  return merge(
    intro,
    rest(160),
    repeat(verseRiff, 2),
    rest(100),
    chorus,
    rest(120),
    repeat(verseRiff, 2),
    chorus,
    // Bridge intensity
    run('e', 55, 8),
    run('r', 50, 8),
    run('t', 45, 8),
    rest(100),
    chorus,
    [n('wt', 500, 150)],
    rest(300)
  );
}

function duality() {
  // "I push my fingers into my eyes..." — driving mid-tempo hook
  const riff = sheet(
    '4:120 4:120 5:120 4:120 6:160 5:120 4:140 _:60 4:100 4:100 5:120 7:160 6:120 5:140 4:200',
    120
  );
  const chorus = sheet(
    'e:140 r:140 t:160 y:200 _:50 y:120 t:120 r:140 e:180 _:80 w:140 e:140 r:160 t:220 _:60 r:140 e:280',
    140
  );
  return merge(
    repeat(riff, 4),
    rest(150),
    chorus,
    rest(100),
    repeat(riff, 2),
    chorus,
    // Half-time stomp
    [
      n('4', 220, 40),
      n('4', 220, 40),
      n('5', 220),
      n('4q', 360, 70),
    ],
    rest(120),
    chorus,
    [n('4e', 450, 100)],
    rest(280)
  );
}

function beforeIForget() {
  const riff = sheet(
    '5:110 5:110 5:110 7:150 5:110 5:110 8:160 5:110 5:110 7:140 6:140 5:180',
    110
  );
  const melody = sheet(
    't:150 y:150 u:180 _:40 u:130 y:130 t:150 r:170 _:70 t:140 y:150 u:160 i:220 o:180 i:160 u:200',
    150
  );
  return merge(
    repeat(riff, 4),
    melody,
    repeat(riff, 2),
    melody,
    run('5', 60, 8),
    [n('5t', 400, 90)],
    rest(250)
  );
}

function psychosocial() {
  // Iconic opening gallop-ish + chorus
  const open = sheet(
    '1:100 1:100 3:140 1:100 1:100 4:160 _:50 1:100 1:100 3:120 2:120 1:180',
    100
  );
  const chorus = sheet(
    'e:130 e:130 r:130 t:170 _:40 e:120 r:120 t:140 y:200 _:60 t:130 r:140 e:260',
    130
  );
  return merge(
    repeat(open, 4),
    rest(120),
    chorus,
    repeat(open, 2),
    chorus,
    // Chaos fill
    climb('12345678', 45, 1),
    rest(80),
    run('1', 40, 12),
    chorus,
    [n('1e', 480, 110)],
    rest(280)
  );
}

function snuff() {
  // Ballad — slower, emotional, longer holds
  const line = sheet(
    's:320 d:320 f:360 _:80 f:280 d:280 s:320 a:400 _:120 s:280 d:280 f:300 g:420 _:100 f:260 d:280 s:500',
    300
  );
  const chorus = sheet(
    'g:300 h:300 j:360 _:80 j:260 h:260 g:300 f:340 _:100 g:280 h:280 j:300 k:480 _:120 j:260 h:300 g:520',
    280
  );
  return merge(line, rest(200), chorus, rest(160), line, chorus, [n('sg', 700, 200)], rest(400));
}

function vermilion() {
  const riff = sheet(
    'w:150 e:150 e:150 r:200 _:60 e:140 w:140 q:180 _:80 w:140 e:140 r:160 t:240',
    150
  );
  const hook = sheet(
    't:160 y:160 y:160 u:210 _:50 y:140 t:140 r:180 _:70 t:150 y:150 u:170 i:280',
    160
  );
  return merge(repeat(riff, 3), hook, repeat(riff, 2), hook, [n('wt', 450, 100)], rest(300));
}

function dualities() {
  return duality();
}

const songs = [
  {
    id: 'slipknot-eyeless',
    title: 'Eyeless',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 140,
    notes: eyeless(),
  },
  {
    id: 'slipknot-wait-and-bleed',
    title: 'Wait and Bleed',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 140,
    notes: waitAndBleed(),
  },
  {
    id: 'slipknot-duality',
    title: 'Duality',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 144,
    notes: dualities(),
  },
  {
    id: 'slipknot-before-i-forget',
    title: 'Before I Forget',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 133,
    notes: beforeIForget(),
  },
  {
    id: 'slipknot-psychosocial',
    title: 'Psychosocial',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 135,
    notes: psychosocial(),
  },
  {
    id: 'slipknot-snuff',
    title: 'Snuff',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 72,
    notes: snuff(),
  },
  {
    id: 'slipknot-vermilion',
    title: 'Vermilion',
    artist: 'Slipknot',
    genre: 'Metal',
    bpm: 120,
    notes: vermilion(),
  },
].map((s) => ({ ...s, durationMs: durationOf(s.notes) }));

module.exports = songs;
