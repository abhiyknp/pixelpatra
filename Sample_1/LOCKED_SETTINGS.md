# Locked details: how they stay locked after the site is handed over

**Status:** the Owner view side (locked rows, approved themes, request → code → wait → applied, history) works in this
sample in demo mode, where it only protects the visitor's own browser copy. The database side below is a design for a
live client site. It is **not built or tested yet** and needs a real Supabase project to try.

## The rule

| Who | Can change |
|---|---|
| Developer (once, when the site is built) | Everything: name, logo, brand, legal and tax details, approved themes (`config.js` → `setup`), domain, accounts |
| Owner | Products, prices, stock, photos, offers, text, orders, invoices, contacts (phone, WhatsApp, email, Instagram), choosing among the approved themes |
| Owner, only through a request | Locked details: business name, address, grievance officer, courts city, policy date, GST on/off, GSTIN, state, invoice prefix, HSN codes, GST rates |

Nobody has to wait for the developer after launch: a locked detail changes by itself once the owner confirms a code and
the waiting time (default 48 hours, `changeWaitHours`) has passed.

## Why a page-only lock is not enough
Anyone signed in as owner can call the database directly, so hiding buttons protects nothing. The database must refuse
the write.

## Database design (Supabase)
1. Keep locked keys out of the owner-writable `settings` table. Put them in `locked_settings (key text primary key, value jsonb)`
   with row level security that allows the owner **read** only, and no insert, update or delete for any browser role.
2. `locked_requests (id, key, value, from_value, reason, requested_at, apply_at, status, done_at)`. Owner may insert
   (through the function below, not directly) and read their own rows.
3. Function `request_locked_change(key, value, reason, code)` (security definer): checks the key is on the locked list,
   validates the value (same rules as `lockCheck` in `index.html`: GSTIN format, rates 0/5/12/18/28, prefix 1 to 3
   characters, and so on), checks the 6-digit code that was emailed to the signed-in owner's address (Supabase auth),
   stores the request with `apply_at = now() + wait`, and emails the owner "this change goes live on …, cancel here".
4. Function `cancel_locked_request(id)` for the owner, only while `status = 'waiting'`.
5. A scheduled job (pg_cron, every 10 minutes) copies due requests into `locked_settings` and marks them applied.
   It runs as the database, not as a user.
6. The site reads `settings` and `locked_settings` together, so invoices and policies use the locked values.

## Things this does not cover
- The logo, fonts and layout live in the site files; changing them is a developer job (a paid change), by design.
- If the owner's sign-in email is taken over, the attacker can still start a request. The waiting time and the
  notification email give the real owner time to cancel. Keep `ownerTwoStep: true` on live sites.
