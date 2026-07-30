const { n, rest, merge, repeat, run, climb, durationOf, sheet } = require('./helpers');
const holyWarsNotes = require('./holy-wars-data.js');

/**
 * Megadeth - top tracks across albums, VP piano reductions of main riffs/hooks.
 * Holy Wars uses real MIDI-to-VP conversion for full 5+ minute accuracy.
 */

function holyWars() {
  return holyWarsNotes;
}

function hangar18() {
  const riff = sheet(
    '4:90 4:90 5:110 4:90 6:120 _:40 4:90 5:100 6:110 7:140 6:100 5:120 4:160',
    90
  );
  const lead = sheet(
    'e:120 r:120 t:140 y:180 _:40 t:110 r:110 e:140 w:160 _:60 e:120 r:130 t:150 y:200 u:160 y:140 t:220',
    120
  );
  return merge(repeat(riff, 4), lead, repeat(riff, 2), lead, [n('4e', 400, 80)], rest(280));
}

function peaceSells() {
  // Groove bass-line style on low keys + chorus figure
  const bass = sheet(
    '1:160 1:160 3:200 1:160 4:220 _:60 1:140 1:140 3:180 2:180 1:240',
    160
  );
  const hook = sheet(
    'w:150 e:150 r:180 _:40 e:130 w:130 q:170 _:70 w:140 e:140 r:160 t:240',
    150
  );
  return merge(repeat(bass, 4), hook, repeat(bass, 2), hook, [n('1w', 450, 100)], rest(300));
}

function symphonyOfDestruction() {
  // One of the most recognizable metal riffs
  const riff = sheet(
    '5:140 5:140 8:180 5:140 7:160 5:140 6:160 5:200 _:80 5:120 5:120 8:160 7:140 6:140 5:240',
    140
  );
  const chorus = sheet(
    't:150 t:150 y:150 u:200 _:50 t:130 y:130 u:150 i:230 _:70 u:140 y:150 t:300',
    150
  );
  return merge(
    repeat(riff, 4),
    chorus,
    repeat(riff, 2),
    chorus,
    // Half-time stomp end
    [n('5', 240, 50), n('5', 240, 50), n('8', 280), n('5t', 500, 120)],
    rest(300)
  );
}

function tornadoOfSouls() {
  // Famous melodic solo theme reduced
  const theme = sheet(
    'e:120 r:120 t:140 y:160 u:140 y:120 t:140 r:160 _:50 e:110 r:110 t:130 y:150 u:170 i:150 u:130 y:200',
    120
  );
  const riff = sheet(
    '2:80 2:80 4:100 2:80 5:110 2:80 4:100 2:130 _:40 2:80 3:90 4:100 5:120 4:90 2:160',
    80
  );
  return merge(
    repeat(riff, 3),
    theme,
    rest(100),
    theme,
    // Solo cascade
    climb('wertyui', 38, 2),
    rest(80),
    theme,
    [n('2e', 420, 90)],
    rest(260)
  );
}

function aToutLeMonde() {
  // Ballad / power-ballad feel
  const verse = sheet(
    's:280 d:280 f:320 _:60 f:240 d:240 s:280 a:360 _:100 s:250 d:250 f:280 g:400',
    280
  );
  const chorus = sheet(
    'g:260 h:260 j:300 _:50 j:220 h:220 g:260 f:300 _:80 g:240 h:240 j:260 k:420',
    260
  );
  return merge(verse, rest(150), chorus, verse, chorus, [n('sg', 650, 180)], rest(350));
}

function sweatingBullets() {
  const riff = sheet(
    '3:100 3:100 5:130 3:100 6:140 _:40 3:100 3:100 5:120 4:120 3:180',
    100
  );
  const vocal = sheet(
    'e:140 e:140 r:140 t:180 _:40 r:120 e:120 w:160 _:60 e:130 r:140 t:160 y:240',
    140
  );
  return merge(repeat(riff, 4), vocal, repeat(riff, 2), vocal, [n('3e', 400, 90)], rest(280));
}

function trust() {
  const riff = sheet(
    '4:120 4:120 6:150 4:120 7:160 _:50 4:110 5:120 6:130 7:170 6:130 4:200',
    120
  );
  const hook = sheet(
    'r:140 t:140 y:170 _:40 y:120 t:120 r:150 e:180 _:60 r:130 t:140 y:160 u:240',
    140
  );
  return merge(repeat(riff, 3), hook, repeat(riff, 2), hook, [n('4r', 420, 90)], rest(280));
}

function skinOMyTeeth() {
  const riff = sheet(
    '5:75 5:75 5:75 7:100 5:75 8:110 5:75 7:95 5:130 _:35 5:75 6:85 7:95 8:110 5:150',
    75
  );
  return merge(repeat(riff, 6), run('5', 40, 10), [n('5', 400, 80)], rest(250));
}

function almostHonest() {
  const line = sheet(
    'w:200 e:200 r:240 _:50 r:170 e:170 w:200 q:260 _:80 w:180 e:180 r:200 t:320',
    200
  );
  const chorus = sheet(
    't:180 y:180 u:220 _:40 u:150 y:150 t:180 r:220 _:60 t:160 y:170 u:190 i:300',
    180
  );
  return merge(line, chorus, line, chorus, [n('wt', 480, 110)], rest(300));
}

function addictedToChaos() {
  const riff = sheet(
    '2:95 2:95 4:120 2:95 5:130 2:95 4:115 2:150 _:40 2:90 3:100 4:110 5:130 2:180',
    95
  );
  return merge(repeat(riff, 5), climb('234567', 50, 1), [n('2', 380, 70)], rest(250));
}

const songs = [
  {
    id: 'megadeth-holy-wars',
    title: 'Holy Wars... The Punishment Due',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 170,
    notes: holyWars(),
  },
  {
    id: 'megadeth-hangar-18',
    title: 'Hangar 18',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 152,
    notes: hangar18(),
  },
  {
    id: 'megadeth-peace-sells',
    title: 'Peace Sells',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 138,
    notes: peaceSells(),
  },
  {
    id: 'megadeth-symphony',
    title: 'Symphony of Destruction',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 140,
    notes: symphonyOfDestruction(),
  },
  {
    id: 'megadeth-tornado',
    title: 'Tornado of Souls',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 160,
    notes: tornadoOfSouls(),
  },
  {
    id: 'megadeth-a-tout-le-monde',
    title: 'A Tout le Monde',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 92,
    notes: aToutLeMonde(),
  },
  {
    id: 'megadeth-sweating-bullets',
    title: 'Sweating Bullets',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 148,
    notes: sweatingBullets(),
  },
  {
    id: 'megadeth-trust',
    title: 'Trust',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 120,
    notes: trust(),
  },
  {
    id: 'megadeth-skin-o-my-teeth',
    title: "Skin O' My Teeth",
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 175,
    notes: skinOMyTeeth(),
  },
  {
    id: 'megadeth-almost-honest',
    title: 'Almost Honest',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 110,
    notes: almostHonest(),
  },
  {
    id: 'megadeth-addicted-to-chaos',
    title: 'Addicted to Chaos',
    artist: 'Megadeth',
    genre: 'Metal',
    bpm: 145,
    notes: addictedToChaos(),
  },
].map((s) => ({ ...s, durationMs: durationOf(s.notes) }));

module.exports = songs;
