# Patra Control: research and plan

A private control panel for Pixelpatra: see what is happening, run requests and payments, and change the site without touching code.
The clickable concept is `concepts/patra-control.html` (sample data only, not connected to anything).

## 1. What we found

- The site is static (GitHub Pages and Netlify). It stores nothing, so there is **nothing for a panel to read yet**. Requests land in Netlify Forms; payments are matched by hand from the UPI reference; visits are not recorded.
- So the panel needs a small **data layer**. That is the real work. The dashboard on top of it is the easy, fun part.
- Bud & Things already runs this pattern (Supabase tables, a visit-events table, payment webhooks, an Owner dashboard). It works. For Pixelpatra we reuse the pattern in a **new, separate project**. The two businesses never share data.

## 2. Options for the data layer

| Option | How it works | Good | Watch out | Effort |
|---|---|---|---|---|
| **A. Supabase (recommended)** | Forms and visit events go to tables; the panel logs in with email link or passkey and reads them; the site reads its settings (prices, services, reward, banner) from a table | One place for requests, payments, events, settings. Real-time feed. Row-level security keeps it private. Free tier to start. Same skills as Bud & Things | A new project to set up and back up | Medium |
| B. Netlify Forms + Functions | Keep Netlify Forms; a small function reads submissions into the panel | Nothing new to sign up for | Limited storage and quota; no events; settings still need somewhere to live | Medium |
| C. Google Sheets + Apps Script | Forms post to a Sheet; panel reads the Sheet | Cheapest, easy to edit by hand | Slow, easy to break, weak security, no real-time | Low |
| D. Cloudflare Workers + D1 | Edge functions with a small SQL database | Fast, cheap | Newer to us; more moving parts | Medium-high |

**Recommendation: A.** Keep Netlify Forms as a backup copy of every request.

## 3. How it fits together

```
Visitor  ->  pixelpatra site (static)  ->  quote form / payment reference / visit events
                                   |                  |
                          reads settings              v
                                   |           Supabase (requests, payments, events, settings)
                                   |                  |
                                   +------<-----------+
                                                      |
Owner  ->  /admin  (login required, noindex)  ->  Patra Control
                                                      |
                                       notifications: email (and WhatsApp when you add it)
```

Visit events are first-party and anonymous: no cookies, no names, no tracking of people (consistent with the Privacy page).

## 4. What the panel can contain

**Overview (the front page)**
- KPI tiles with animated counters and sparklines: visitors, demos opened, quote requests, paid orders, revenue.
- Revenue chart with hover detail; 7, 30 and 90 day views.
- Journey funnel: visited, typed a name, opened a demo, sent a request, paid, with drop-off at each step.
- Template demand: which demos people open most.
- Mix: Template files vs Setup & launch vs Custom build, and which extra services sell (Analytics, Shipping, Payments...).
- Pixel heatmap of when visitors arrive (weekday by hour).
- Live activity feed, updating as people use the site.

**Requests**
- Pipeline board: New, Replied, Paid, Building, Delivered.
- Open a request to see everything they asked for, their estimate, notes, and a one-tap reply template.
- Reply-speed gauge against your promise (one working day) and overdue alerts.

**Payments**
- Queue of UPI references waiting to be matched to your bank statement; tap to confirm.
- Revenue by template, by package and by month; average order value; refunds.
- Later, automatic confirmation through a payment gateway webhook.

**Site controls (the part that "controls the website")**
- Edit template prices, the setup fee and the extra-service amounts.
- Change the Explorer reward; switch the UPI step on or off.
- Announcement banner with a live preview of what visitors see.
- Edit FAQ and page text; switch a template on or off; maintenance mode.
- Changes publish to the site in about a minute, with a history so any change can be undone.

**Experience insights**
- How many people finish the tour; Explorer completion per step; reward claims; how many add a logo or colour (and whether they request more often).

**Claude insights (optional)**
- A short weekly note written from your numbers: what grew, what to try, when to reply. Only sees totals, never customer details.

**Health and safety**
- Speed, accessibility and SEO scores; broken-link checks; last deploy; form delivery test.
- Audit log of who changed what; automatic backups; export of requests as CSV.

## 5. Design language

- **Look:** deep midnight background with soft aurora glows, glass cards in a bento grid, a pixel-grid motif taken from the Pixelpatra logo (pixel heatmaps, pixel pulses), mono labels, bold display numbers.
- **Feel:** animated counters, drawing sparklines, spotlight that follows the pointer, live pulse, smooth transitions; all switched off for people who prefer reduced motion.
- **Power features:** a command palette (Ctrl or Cmd + K) to jump anywhere or run an action; five accent themes that match the site.
- **Phone first:** collapses to a bottom tab bar and single column; works as an installable app on your phone.
- **Accessible:** keyboard friendly, visible focus, charts have text descriptions.

## 6. Security and privacy

- Login with an email link (or passkey) for you only; later, roles for a helper.
- The panel lives at a private address, is not indexed, and every table is protected by row-level security.
- The public form can only add rows; it cannot read anything. Spam is blocked with a hidden field and rate limits.
- Keep personal data minimal and delete old requests after the retention period in the Privacy page (12 months).
- Your UPI ID contains a phone number and is shown on the public site. A separate business UPI ID is safer if you can get one.

## 7. Phases

| Phase | What you get | Size |
|---|---|---|
| 0. Concept (done) | The clickable design you can judge | done |
| 1. Data layer | Supabase project, tables, forms and events saved, email alerts for new requests and payment references | 1 to 2 sessions |
| 2. Live read-only panel | Real KPIs, charts, funnel, pipeline and payments from real data | 2 to 3 sessions |
| 3. Controls | Edit prices, services, reward, banner; publish and undo | 2 sessions |
| 4. Automation | Auto reply templates, overdue alerts, payment gateway webhook | 1 to 2 sessions |
| 5. Insights and polish | Weekly Claude note, health checks, installable app | 1 session |

## 8. Decisions we need

1. Data layer: **Supabase** (recommended), or one of the others?
2. First controls: prices and services, the banner, the reward, all three?
3. Alerts: email now, WhatsApp later when you add a number?
4. Panel name and look: keep **Patra Control** and the midnight style, or lighter?
5. Do you want a helper (a second login with limited rights) now or later?
