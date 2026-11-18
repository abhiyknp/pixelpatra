# Where to change things (Pixelpatra)

After any change below, run `python3 tools/make-pages.py`, then `sh tools/build-site.sh dist/site` and upload the folder (or the zip) to Netlify.

| What | Where |
|---|---|
| Template prices (Template files) | `shared/templates.json`, the `files` number of each template |
| Setup & launch fee | `shared/templates.json`, `setup_fee` (percent, minimum, rounding). Setup & launch = template price + this fee |
| Extra services and their amounts | `shared/templates.json`, `addons` |
| Custom build | has no price by design; it is quoted from the customer's needs |
| UPI ID customers pay to | `shared/pp-config.js`, `upi.id` (empty it to hide the payment step) |
| WhatsApp, email, Instagram | `shared/pp-config.js` (empty means hidden) |
| Explorer reward text | `shared/pp-config.js`, `reward.text` |
| City and state in Terms and Privacy | `tools/make-pages.py`, `LEGAL_CITY` and `LEGAL_STATE` |
| Site address for sharing and search | `tools/make-pages.py`, `SITE_URL` (and the home page `<head>`) |
| Product photos | put the files in a folder, run `python3 tools/place-photos.py <folder>` (see FLOW_PROMPTS_13_PHOTOS.md) |

Netlify: after the first deploy, turn on email notifications for the `quote` and `payment` forms (Site configuration, Forms, Form notifications) so each request and each "I have paid" message reaches your inbox.
