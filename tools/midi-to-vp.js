#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var MIDI = require("@tonejs/midi").Midi;

var NOTE_TO_KEY = {
  36: "1", 37: "!", 38: "2", 39: "@", 40: "3", 41: "4", 42: "$", 43: "5",
  44: "%", 45: "6", 46: "^", 47: "7", 48: "8", 49: "*", 50: "9", 51: "(",
  52: "0", 53: "q", 54: "Q", 55: "w", 56: "W", 57: "e", 58: "E", 59: "r",
  60: "t", 61: "T", 62: "y", 63: "Y", 64: "u", 65: "i", 66: "I", 67: "o",
  68: "O", 69: "p", 70: "P", 71: "a", 72: "s", 73: "S", 74: "d", 75: "D",
  76: "f", 77: "g", 78: "G", 79: "h", 80: "H", 81: "j", 82: "J", 83: "k",
  84: "l", 85: "L", 86: "z", 87: "Z", 88: "x", 89: "c", 90: "C", 91: "v",
  92: "V", 93: "b", 94: "B", 95: "n", 96: "m"
};

var args = process.argv.slice(2);
var file = null;
var trackFilter = null;
var trackList = null;
var transpose = 0;
var verbose = false;
var maxChordGap = 0.015;
var fold = false;

for (var i = 0; i < args.length; i++) {
  if (args[i] === "--track" && args[i + 1]) { trackFilter = parseInt(args[++i], 10); }
  else if (args[i] === "--tracks" && args[i + 1]) { trackList = args[++i].split(",").map(function(s) { return parseInt(s, 10); }); }
  else if (args[i] === "--transpose" && args[i + 1]) { transpose = parseInt(args[++i], 10); }
  else if (args[i] === "--verbose") { verbose = true; }
  else if (args[i] === "--chord-gap" && args[i + 1]) { maxChordGap = parseFloat(args[++i]); }
  else if (args[i] === "--fold") { fold = true; }
  else if (!args[i].startsWith("-")) { file = args[i]; }
}

if (!file) {
  console.error("Usage: node midi-to-vp.js <midi-file> [--track N] [--transpose N] [--verbose]");
  process.exit(1);
}

var midiData = fs.readFileSync(file);
var midi = new MIDI(midiData);

if (verbose) {
  console.error("Duration: " + midi.duration.toFixed(1) + "s");
  midi.tracks.forEach(function (t, idx) {
    var label = t.name || "unnamed";
    console.error("  Track " + idx + ": " + label + " - " + t.notes.length + " notes, ch " + t.channel);
  });
}

// Pick tracks
var selected;
if (trackList !== null) {
  selected = trackList.map(function(idx) { return midi.tracks[idx]; }).filter(Boolean);
} else if (trackFilter !== null) {
  selected = [midi.tracks[trackFilter]];
} else {
  // Auto-select: pick tracks with most notes (likely melody/harmony, not drums)
  var candidates = midi.tracks.filter(function (t) {
    return t.notes.length > 0 && t.channel !== 9;
  });
  candidates.sort(function (a, b) { return b.notes.length - a.notes.length; });
  selected = candidates.slice(0, Math.min(4, candidates.length));
}

if (verbose) {
  console.error("Using " + selected.length + " tracks");
}

// Collect notes
var allNotes = [];
selected.forEach(function (track) {
  track.notes.forEach(function (note) {
    var midiNum = note.midi + transpose;
    if (fold) {
      // Octave-fold instead of discarding. A band arrangement's bass often sits below the Virtual
      // Piano floor, and dropping those notes deletes the whole line -- on Giorno's Theme that was
      // 770 of 3550 notes, essentially all of the bass part. Shifting by whole octaves keeps the
      // pitch class and the musical line, at the cost of octave displacement, which is what a human
      // arranger does for a limited keyboard anyway.
      while (midiNum < 36) midiNum += 12;
      while (midiNum > 96) midiNum -= 12;
    }
    if (midiNum < 36 || midiNum > 96) return;
    var key = NOTE_TO_KEY[midiNum];
    if (!key) return;
    allNotes.push({
      midi: midiNum,
      key: key,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity
    });
  });
});

allNotes.sort(function (a, b) { return a.time - b.time || b.duration - a.duration; });

if (verbose) {
  console.error("Notes in range: " + allNotes.length);
}

// Build output
var output = [];
var idx = 0;

while (idx < allNotes.length) {
  var note = allNotes[idx];
  var chord = [note];
  var j = idx + 1;
  while (j < allNotes.length && Math.abs(allNotes[j].time - note.time) < maxChordGap) {
    chord.push(allNotes[j]);
    j++;
  }

  var nextTime = j < allNotes.length ? allNotes[j].time : note.time + note.duration;
  var delayMs = Math.max(1, Math.round((nextTime - note.time) * 1000));

  var maxDur = 0;
  for (var c = 0; c < chord.length; c++) {
    if (chord[c].duration > maxDur) maxDur = chord[c].duration;
  }
  var holdMs = Math.max(0, Math.round(maxDur * 1000) - delayMs);

  // Deduplicate. Two tracks doubling the same pitch in unison -- two string parts, or a note the
  // octave fold landed on top of an existing one -- produced the same key twice in one chord, e.g.
  // "77". The player taps sequentially, so a repeat re-triggers the note as an audible stutter and
  // costs another 4ms of blocking spin. On this arrangement that was 549 wasted taps across 21% of
  // all entries. One key per pitch per chord.
  var seen = {};
  var keyList = [];
  for (var q = 0; q < chord.length; q++) {
    var kk = chord[q].key;
    if (!seen[kk]) { seen[kk] = true; keyList.push(kk); }
  }
  var keys = keyList.sort().join("");
  var entry = { k: keys, d: delayMs };
  if (holdMs > 20) entry.hold = Math.min(400, holdMs);
  output.push(entry);

  idx = j;
}

// Trim trailing long rests
while (output.length > 0 && output[output.length - 1].d > 3000 && output[output.length - 1].k === "") {
  output.pop();
}

var totalMs = 0;
for (var m = 0; m < output.length; m++) totalMs += output[m].d;

if (verbose) {
  console.error("Output: " + output.length + " entries, Duration: " + (totalMs / 1000).toFixed(1) + "s (" + (totalMs / 60000).toFixed(1) + " min)");
}

// Write output
console.log("// Auto-generated from MIDI -- do not edit");
console.log("const notes = " + JSON.stringify(output) + ";");
console.log("module.exports = notes;");
