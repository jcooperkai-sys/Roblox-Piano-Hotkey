#!/usr/bin/env bash
#
# Turn a MIDI file into a playable song in one step: convert, register, and score it.
#
#   ./tools/add-song.sh midi/runaway.mid runaway "Runaway" "Kanye West" Hip-Hop
#   ./tools/add-song.sh midi/erika.mid erika "Erika" "Herms Niel" March --local
#
# Arguments: <midi-file> <id> <title> <artist> <genre> [--local] [-- extra converter flags]
#
# --local writes the song into songs/local/ instead of songs/, which is gitignored. Use it for
# anything that should stay on this machine and never reach the public repo.
#
# Everything after a bare `--` is passed straight to midi-to-vp.js, so track selection and
# transposition work as usual:
#   ./tools/add-song.sh midi/x.mid x "X" "Y" Pop -- --tracks 0,1 --transpose -12

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ $# -lt 5 ]; then
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
  exit 1
fi

MIDI="$1"; ID="$2"; TITLE="$3"; ARTIST="$4"; GENRE="$5"; shift 5

LOCAL=0
EXTRA=()
while [ $# -gt 0 ]; do
  case "$1" in
    --local) LOCAL=1; shift ;;
    --) shift; EXTRA=("$@"); break ;;
    *) EXTRA+=("$1"); shift ;;
  esac
done

[ -f "$MIDI" ] || { echo "No such MIDI: $MIDI" >&2; exit 1; }

if [ "$LOCAL" -eq 1 ]; then
  OUTDIR="songs/local"
  mkdir -p "$OUTDIR"
else
  OUTDIR="songs"
fi
DATA="$OUTDIR/${ID}-data.js"
ENTRY="$OUTDIR/${ID}.js"

echo "── inspecting $MIDI"
node tools/midi-to-vp.js "$MIDI" --verbose "${EXTRA[@]+"${EXTRA[@]}"}" >/dev/null 2>/tmp/add-song-tracks.txt || true
sed 's/^/   /' /tmp/add-song-tracks.txt

echo "── converting"
# --fold keeps notes that fall outside the Virtual Piano range instead of dropping them.
node tools/midi-to-vp.js "$MIDI" --fold "${EXTRA[@]+"${EXTRA[@]}"}" > "$DATA"
node -e "const n=require('./$DATA');if(!Array.isArray(n)||!n.length){console.error('conversion produced no notes');process.exit(1)}console.log('   '+n.length+' events, '+(n.reduce((a,e)=>a+e.d,0)/1000).toFixed(1)+'s')"

cat > "$ENTRY" <<EOF
const { durationOf } = require('$([ "$LOCAL" -eq 1 ] && echo ../helpers || echo ./helpers)');
const notes = require('./${ID}-data.js');

module.exports = [{
  id: '${ID}',
  title: ${TITLE@Q},
  artist: ${ARTIST@Q},
  genre: ${GENRE@Q},
  notes,
  durationMs: durationOf(notes),
}];
EOF

echo "── scoring against human hands"
node tools/difficulty.js "$DATA" | sed 's/^/   /'

if [ "$LOCAL" -eq 1 ]; then
  cat <<EOF
── done (LOCAL ONLY)
   $DATA
   $ENTRY
   songs/local/ is gitignored, so this stays on this machine.
   It is loaded automatically if songs/index.js picks up songs/local — see the note there.
EOF
else
  echo "── done: $DATA and $ENTRY — add it to songs/index.js to make it selectable"
fi
