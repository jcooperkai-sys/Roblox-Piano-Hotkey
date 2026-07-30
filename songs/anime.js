const { durationOf } = require('./helpers');
const giornoNotes = require('./giorno-data.js');

/**
 * Anime pack.
 *
 * Giorno's Theme is a real MIDI-to-VP conversion of the full band arrangement -- alto sax melody,
 * both string parts, and the bass line -- not a piano reduction. Drums are excluded. Four
 * instrument parts landing on one keyboard is what makes it brutal: tools/difficulty.js reports 58
 * events no human hands can execute, including chords spanning 4.8 octaves and a peak of 31
 * keystrokes per second against a two-finger trill ceiling of about 16.
 *
 * The player is unbothered by all of it. That is the point.
 */

const songs = [
  {
    id: 'giorno',
    title: "Giorno's Theme (il vento d'oro) — full band",
    artist: 'Yugo Kanno',
    genre: 'Anime',
    bpm: 135,
    notes: giornoNotes,
  },
].map((s) => ({ ...s, durationMs: durationOf(s.notes) }));

module.exports = songs;
