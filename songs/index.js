const beethovenVirus = require('./beethoven-virus');
const slipknot = require('./slipknot');
const megadeth = require('./megadeth');
const classics = require('./classics');
const anime = require('./anime');

const SONGS = [beethovenVirus, ...slipknot, ...megadeth, ...classics, ...anime].map((s) => ({
  ...s,
  // Ensure every song has duration
  durationMs: s.durationMs || (s.notes || []).reduce((a, n) => a + (n.d || 0), 0),
}));

// Stable sort: genre groups, then title
SONGS.sort((a, b) => {
  const g = String(a.genre).localeCompare(String(b.genre));
  if (g !== 0) return g;
  return String(a.title).localeCompare(String(b.title));
});

module.exports = { SONGS };
