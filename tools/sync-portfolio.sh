#!/bin/sh
# Brings the latest Business Analyst portfolio website from github.com/abhiyknp/Portfolio into Sample_4, so the
# Portfolio category on the Pixelpatra site always shows the current version. Run it whenever that repo changes:
#   sh tools/sync-portfolio.sh
# Two small changes are made to the copy: it is marked noindex (so search engines keep the original address), and it loads
# the shared Pixelpatra colour themes. Everything else is the repository as it is.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/abhiyknp/Portfolio "$TMP/p"
mkdir -p "$ROOT/Sample_4"
cp -r "$TMP/p/assets" "$TMP/p/index.html" "$ROOT/Sample_4/"
python3 - "$ROOT/Sample_4/index.html" <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
tag = '<meta name="robots" content="noindex">\n<script src="../shared/pp-theme.js" data-pp="ba"></script>\n'
if 'pp-theme.js' not in s:
    s = s.replace('<link rel="icon"', tag + '<link rel="icon"', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
echo "Sample_4 updated from $(cd "$TMP/p" && git log -1 --format='%h %s')"
