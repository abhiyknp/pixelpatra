# Go-live checklist (the parts only you can do)

Everything else is built and tested. These take about 15 minutes in total.

## 1. Get every request in your inbox (Netlify, about 3 minutes)

The site sends two forms to Netlify: `quote` (a new request) and `payment` (a customer's UPI reference).
By default they only collect in the Netlify dashboard. Turn on email alerts so you see them straight away.

1. Upload the latest `pixelpatra-demo-site.zip` to your Netlify site (Deploys, then drag the zip onto the page).
2. Open the site in Netlify, then **Forms** in the left menu.
   - If you see **"Form detection is off"**, switch it on and **redeploy** (upload the zip again). Both forms should then appear: `quote` and `payment`.
3. Open **Site configuration, Notifications, Emails and webhooks** (the label can read *Form submission notifications*).
4. Click **Add notification, Email notification**.
   - Event to listen for: **New form submission**
   - Form: **quote**. Email to notify: your own email address. Save.
5. Add a second notification the same way for the form **payment**.
6. **Test it:** open your live link, send a test request (Gift Shop, any package) with your own email, then enter a fake UPI reference such as `TEST123456789` on the payment screen. You should receive two emails within a minute. Delete the two test submissions from the Forms page afterwards.
7. Check your spam folder the first time, and mark the sender as not spam.

Notes
- Netlify's free plan keeps a limited number of form submissions each month. Check the number under Forms, Usage.
- Anything sent through the form is also shown to the customer as a summary they can copy, so a request is never lost, even if the email is delayed.

## 2. Try it on your own iPhone (about 10 minutes)

I tested an iPhone-sized touch screen on a desktop browser, but not Safari itself, and not a real finger. Please run through this once in **Safari** on your iPhone, using your Netlify link.

Home page
- [ ] The page opens and the opening cloth tears away (tap or swipe).
- [ ] Tap the name in the preview, type a business name. Keyboard opens and the page does **not** jump or zoom.
- [ ] Add your logo (tap the small avatar). Pick a photo. It appears in the preview.
- [ ] Tap the rainbow circle, choose a colour. The whole page changes colour.
- [ ] Tap "Open live demo" on a card. The demo opens, shows your name, and you can close it.
- [ ] The corner "explored" pill and the "Request a quote" bar at the bottom do not cover buttons.

Request page
- [ ] Step 1: the template shows a small preview with **your name and logo**. Tap each package card.
- [ ] The total at the bottom changes when you change package. It stays at the bottom while you scroll.
- [ ] Step 2: type in the box. Tap an extra; the total goes up.
- [ ] Step 3: fill your name and email. Tap **Send my request**.
- [ ] The payment screen shows the amount and a QR code. Tap **Pay with a UPI app**; your UPI app should open with the amount filled in. (You can cancel there.)
- [ ] Leave the page half-filled, come back later: "Welcome back" appears with your answers.

Other
- [ ] Turn the phone sideways and back. Nothing breaks.
- [ ] Open a shop demo, tap "Installed app" (phone view) and the Owner view link.
- [ ] Open the site in a **Private** tab. It should still work; you may see a note that settings are not saved.

Write down anything odd (a screenshot is perfect) and send it to me.

## 3. Decisions to keep in mind
- Your UPI ID contains a phone number and is shown publicly. You decided to keep it.
- WhatsApp, email and Instagram are intentionally empty. When you add them in `shared/pp-config.js`, the buttons appear by themselves.
- The legal pages are my drafts. Have someone you trust read Terms, Privacy and Refunds once before you take real money.
