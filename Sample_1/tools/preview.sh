#!/bin/sh
# Serves a local preview of Sample_1 on http://localhost:8765/ (with the same security policy a published copy would have)
#   PORT=8766      serve on another port
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
OUT=${OUT:-$HERE/.preview}
rm -rf "$OUT" && mkdir -p "$OUT"
(cd "$HERE" && tar --exclude=./.preview --exclude=./tools -cf - .) | (cd "$OUT" && tar -xf -)
node "$HERE/tools/add-csp.js" "$OUT/index.html" >/dev/null
cd "$OUT" && echo "Serving http://localhost:${PORT:-8765}/" && exec python3 -m http.server "${PORT:-8765}"
