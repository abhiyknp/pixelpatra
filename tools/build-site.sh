#!/bin/sh
# Builds the whole Pixelpatra demo site into one folder, ready to publish anywhere (GitHub Pages, Netlify, Cloudflare Pages).
#   sh tools/build-site.sh [output folder]      default: dist
# Then, for a link without the GitHub name in it, drag the output folder into https://app.netlify.com/drop, or upload it
# to Cloudflare Pages, and choose the site name there (for example pixelpatra-demo.netlify.app).
# If a file called CNAME exists in the repository root (one line: the domain, for example demo.pixelpatra.com), it is
# copied in, which is how GitHub Pages is pointed at your own domain.
set -e
OUT=${1:-dist}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
rm -rf "$OUT" && mkdir -p "$OUT"
cp index.html animations.html intro.html "$OUT"/
cp -r demo "$OUT"/demo
for d in Sample_1 House_3D_Prototype Sample_2 kits; do
  mkdir -p "$OUT/$d"
  (cd "$d" && tar --exclude=./tools --exclude=./.preview --exclude=./.cache --exclude='*.md' --exclude=./.gitignore --exclude=serve.sh --exclude=page.html -cf - .) | (cd "$OUT/$d" && tar -xf -)
done
# the scroll intros page is written as page content: give it a full HTML document
{
  printf '%s' '<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'
  cat kits/scroll-intros/index.html
  printf '%s' '</body></html>'
} > "$OUT/kits/scroll-intros/index.html"
[ -f CNAME ] && cp CNAME "$OUT"/CNAME
touch "$OUT"/.nojekyll
# the security policy for the two shop samples
node Sample_1/tools/add-csp.js "$OUT/Sample_1/index.html"
node House_3D_Prototype/tools/add-csp.js "$OUT/House_3D_Prototype/index.html"
echo "Built $OUT ($(du -sh "$OUT" | cut -f1))"
