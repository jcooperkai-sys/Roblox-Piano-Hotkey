# Roblox Piano Hotkey

Smart **legal** Roblox piano player (Electron). Sends real OS keystrokes with correct tempo, rests, chords, and runs — **no injection**, no memory reads.

## Features

- **Timed playback engine** — every note has a millisecond gap (not a raw key dump)
- **Global hotkeys:** `+` start · `−` stop
- **Song dropdown** — Beethoven Virus, Slipknot, Megadeth, classics
- **Humanize toggle** — rare missed keys + slight timing jitter for realism
- **Speed control** — 0.5x–1.5x
- **UI** — black background, white primary, Arial

## Run

```bash
cd ~/Projects/roblox-piano-hotkey
npm install
npm start
```

### macOS Accessibility

System Settings → Privacy & Security → **Accessibility** → enable **Electron** (or your terminal if launching from there).

1. Open Roblox piano and **click it** so it has keyboard focus  
2. Pick a song  
3. Press **`+`** to play · **`−`** to stop  

## Beethoven Virus

Built as real timed events: rapid single-key machine-gun, isolated hits, scale stairs up/down, then **double-time** of the same figure — not plain text spam.

## Anime pack

**Giorno's Theme (il vento d'oro)** — real MIDI-to-VP conversion of the **full band** arrangement:
alto sax melody, both string parts, and the bass line, drums excluded. 4:43, 1,655 events, 3,001
keystrokes.

Four instrument parts on one keyboard is what makes it brutal. `tools/difficulty.js` reports it as
**not humanly playable** — 46 chords no two hands can strike, 12 leaps faster than a hand travels,
chords spanning 4.8 octaves, and a peak of 31 keystrokes/second against a two-finger trill ceiling of
roughly 16. The player does not care.

```bash
node tools/difficulty.js --song giorno
```

## Metal pack

**Slipknot:** Eyeless, Wait and Bleed, Duality, Before I Forget, Psychosocial, Snuff, Vermilion  

**Megadeth:** Holy Wars, Hangar 18, Peace Sells, Symphony of Destruction, Tornado of Souls, A Tout le Monde, Sweating Bullets, Trust, Skin O' My Teeth, Almost Honest, Addicted to Chaos  

Arrangements are melodic/rhythmic reductions of main hooks for Virtual Piano layout.

## Tools

**`tools/midi-to-vp.js`** — MIDI → timed VP events.

- `--tracks 2,4,5,7` pick tracks · `--transpose N` · `--chord-gap S` · `--verbose`
- `--fold` octave-folds notes outside the VP range instead of discarding them. Band arrangements put
  the bass below the keyboard floor; on Giorno's Theme dropping those deleted 770 of 3,550 notes,
  essentially the entire bass part.

**`tools/difficulty.js`** — scores a song against human hands: 10 fingers, a ~14-semitone clean
chord span, ~30 semitones of hand travel per 100 ms, and a ~16/second two-finger trill ceiling.
Reports which passages are outright impossible and why. None of it constrains playback — it exists to
say honestly where an arrangement sits relative to a pianist.

## Legal

This app only simulates keyboard input at the OS level (like a macro pad). It does **not** inject into Roblox, modify memory, or automate the Roblox client process.
