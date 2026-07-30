const { n, rest, merge, repeat, run, durationOf, sheet } = require('./helpers');

function furElise() {
  // a minor classic — correct relative timing
  const a = sheet(
    'u:160 y:160 u:160 y:160 u:160 r:160 t:160 e:200 _:80 a:140 e:140 t:140 u:220 _:60 e:140 u:140 p:140 a:280',
    160
  );
  const b = sheet(
    'e:140 u:140 p:140 a:200 _:50 e:130 u:130 a:130 t:180 _:50 e:130 t:130 u:200',
    140
  );
  return merge(a, rest(100), b, rest(80), a, [n('ua', 500, 120)], rest(300));
}

function riverFlowsInYou() {
  const main = sheet(
    'a:200 s:200 d:240 _:40 d:160 s:160 a:200 p:260 _:80 a:180 s:180 d:200 f:280 _:60 d:160 s:180 a:320',
    200
  );
  const bridge = sheet(
    'f:180 g:180 h:220 _:40 h:150 g:150 f:180 d:220 _:60 f:160 g:170 h:190 j:300',
    180
  );
  return merge(main, rest(120), bridge, main, [n('ad', 600, 150)], rest(350));
}

function canonInD() {
  const progression = sheet(
    '8:300 f:300 0:300 d:300 9:300 s:300 8:300 a:300 7:300 p:300 0:300 d:300 8:300 a:300 8:300 f:360',
    300
  );
  return merge(repeat(progression, 2), [n('8f', 500, 120)], rest(300));
}

function twinkle() {
  return merge(
    sheet('a:280 a:280 p:280 p:280 s:280 s:280 a:400 _:100 p:280 p:280 o:280 o:280 i:280 i:280 p:400', 280),
    rest(200)
  );
}

function happyBirthday() {
  return merge(
    sheet(
      'a:180 a:180 s:280 a:280 d:320 _:60 a:180 a:180 s:280 a:280 f:320 _:60 a:180 a:180 h:280 g:280 d:280 s:320 _:80 g:180 g:180 f:280 d:280 f:360',
      200
    ),
    rest(250)
  );
}

function neverGonnaGiveYouUp() {
  // Because every hotkey list needs one
  const line = sheet(
    'w:140 e:140 r:140 e:140 t:200 _:40 r:130 e:130 w:160 _:60 w:130 e:130 r:130 e:130 y:220 _:50 t:280',
    140
  );
  return merge(repeat(line, 3), [n('wt', 400, 80)], rest(250));
}

function moonlightSonata() {
  const arps = sheet(
    'a:220 d:220 g:220 d:220 a:220 d:220 g:220 d:220 s:220 f:220 h:220 f:220 s:220 f:220 h:220 f:220',
    220
  );
  return merge(repeat(arps, 2), [n('adg', 600, 180)], rest(350));
}

function smashMouthAllStar() {
  const line = sheet(
    'e:140 e:140 r:180 e:140 t:200 _:40 y:160 t:280 _:80 e:140 e:140 r:180 e:140 t:200 y:160 t:200 r:160 e:200 w:240',
    140
  );
  return merge(repeat(line, 2), rest(200));
}

const songs = [
  {
    id: 'fur-elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    genre: 'Classical',
    bpm: 110,
    notes: furElise(),
  },
  {
    id: 'moonlight-sonata',
    title: 'Moonlight Sonata (1st mvt theme)',
    artist: 'Beethoven',
    genre: 'Classical',
    bpm: 54,
    notes: moonlightSonata(),
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    genre: 'Classical',
    bpm: 70,
    notes: canonInD(),
  },
  {
    id: 'river-flows-in-you',
    title: 'River Flows in You',
    artist: 'Yiruma',
    genre: 'Contemporary',
    bpm: 70,
    notes: riverFlowsInYou(),
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    genre: 'Kids',
    bpm: 100,
    notes: twinkle(),
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    artist: 'Traditional',
    genre: 'Kids',
    bpm: 100,
    notes: happyBirthday(),
  },
  {
    id: 'rickroll',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    genre: 'Pop',
    bpm: 113,
    notes: neverGonnaGiveYouUp(),
  },
  {
    id: 'all-star',
    title: 'All Star',
    artist: 'Smash Mouth',
    genre: 'Pop',
    bpm: 104,
    notes: smashMouthAllStar(),
  },
].map((s) => ({ ...s, durationMs: durationOf(s.notes) }));

module.exports = songs;
