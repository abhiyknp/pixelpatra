#!/usr/bin/env python3
"""Builds Pixelpatra's own pages from one place, so the header, footer, template list and prices never drift apart.

    python3 tools/make-pages.py

Reads shared/templates.json (the template list and prices) and shared/credits.json (photo credits), writes
how-it-works.html, faq.html, about.html, quote.html, terms.html, privacy.html, refunds.html and credits.html, and refreshes
the header, footer, template cards of index.html between the <!--pp:...--> markers.
"""
import base64, html, io, json, os, re
from datetime import date
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(f'{ROOT}/shared/templates.json', encoding='utf-8'))
TEMPLATES = DATA['templates']
BASIC = DATA.get('basic', {}).get('price', 0)
for _t in TEMPLATES: _t['setup'] = max(_t['setup'], BASIC)  # Basic is the least a built site costs
CREDITS = json.load(open(f'{ROOT}/shared/credits.json', encoding='utf-8'))
TODAY = date.today().strftime('%d %B %Y').lstrip('0')
inr = lambda n: '₹' + format(int(n), ',')
esc = html.escape
SITE_URL = 'https://pixelpatra.netlify.app/'   # change to your own domain when you have one, then run this script again

LOGO = '<span class="logo-mark" aria-hidden="true"><i></i><i></i><i class="o"></i><i></i><i class="x"></i><i></i><i></i><i class="x"></i><i class="x"></i></span>'
HEADER = f'''<a class="skip-link" href="#main">Skip to the content</a>
<header class="top" id="top">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Pixelpatra home">{LOGO}Pixelpatra</a>
    <nav class="nav" aria-label="Main">
      <a href="index.html#templates">Templates</a>
      <a class="hide-sm" href="demo/">Live demos</a>
      <a class="hide-sm" href="compare.html">Compare</a>
      <a class="hide-sm" href="how-it-works.html">How it works</a>
      <a class="hide-sm" href="faq.html">FAQ</a>
      <a class="hide-sm" href="about.html">About</a>
      <a class="btn btn-sm btn-dark" href="quote.html">Request a quote</a>
    </nav>
  </div>
</header>'''
FOOTER = f'''<footer class="site-foot">
  <div class="wrap foot-grid">
    <div><a class="logo" href="index.html" aria-label="Pixelpatra home">{LOGO}Pixelpatra</a><p>Immersive website templates for portfolios, shops, makers and 3D experiences, made in India.</p></div>
    <div><h3>Templates</h3><ul><li><a href="index.html?cat=portfolio#templates">Portfolio</a></li><li><a href="index.html?cat=ecommerce#templates">E-commerce</a></li><li><a href="index.html?cat=3d#templates">3D &amp; animated</a></li><li><a href="index.html?cat=business#templates">Business</a></li></ul></div>
    <div><h3>Pixelpatra</h3><ul><li><a href="demo/">Live demos</a></li><li><a href="compare.html">Compare and choose</a></li><li><a href="how-it-works.html">How it works</a></li><li><a href="faq.html">FAQ</a></li><li><a href="about.html">About</a></li><li><a href="quote.html">Request a quote</a></li></ul></div>
    <div><h3>Legal</h3><ul><li><a href="terms.html">Terms</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="refunds.html">Refunds</a></li><li><a href="credits.html">Photo credits</a></li></ul></div>
  </div>
  <div class="wrap foot-base"><span>© <span id="yr">2026</span> Pixelpatra</span><span id="build" title="The same number on every copy of this site means the same version"></span></div>
</footer>'''
FOOT_JS = '<script>document.getElementById("yr").textContent=new Date().getFullYear();fetch("build.json").then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.version)document.getElementById("build").textContent="Version "+j.version}).catch(function(){});</script>'

def page(slug, title, desc, body, extra_head='', extra_foot=''):
    doc = f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)} · Pixelpatra</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#f6f7fb">
<meta property="og:site_name" content="Pixelpatra"><meta property="og:title" content="{esc(title)} · Pixelpatra"><meta property="og:description" content="{esc(desc)}"><meta property="og:type" content="website">
<meta property="og:image" content="{SITE_URL}share.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{SITE_URL}{"" if slug == "index" else slug + ".html"}"><meta property="og:url" content="{SITE_URL}{"" if slug == "index" else slug + ".html"}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<script src="shared/pp-config.js"></script>
<script src="shared/pp-theme.js" data-pp="store"></script>
<script src="shared/pp-ui.js" defer></script>
<link rel="stylesheet" href="shared/pp-site.css">{extra_head}
</head>
<body>
{HEADER}
<main class="wrap page" id="main">
<nav class="crumbs" aria-label="You are here"><a href="index.html">Home</a><span aria-hidden="true">›</span><span aria-current="page">{esc(title.split(" · ")[0].split(" | ")[0])}</span></nav>
{body}
</main>
{FOOTER}
{FOOT_JS}{extra_foot}
</body></html>
'''
    open(f'{ROOT}/{slug}.html', 'w', encoding='utf-8').write(doc)

def head(eyebrow, h1, lede=''):
    return f'<div class="page-head"><p class="eyebrow">{esc(eyebrow)}</p><h1>{h1}</h1>' + (f'<p>{lede}</p>' if lede else '') + '</div>'

# ---------------------------------------------------------------- how it works
min_files = min(t['files'] for t in TEMPLATES); min_setup = min(t['setup'] for t in TEMPLATES)
page('how-it-works', 'How it works', 'From first look to a live website: explore the templates, send a request, get a quote, and receive your site.', f'''
{head('How it works', 'From first look to a live site', 'Four steps, and you can try everything before you decide.')}
<div class="steps4">
  <div><b>Explore and try live</b><p>Open any template, switch the colour theme, type your own name, and use the Owner view the way you would after launch.</p></div>
  <div><b>Tell us what you need</b><p>Send the short request form: which template, what you want to achieve, your timeline and budget.</p></div>
  <div><b>Get your quote</b><p>We reply within one working day with a clear quote that lists exactly what is included. Nothing starts until you say yes.</p></div>
  <div><b>We deliver</b><p>You receive the template files, or we set the site up with your content and put it live.</p></div>
</div>
<div class="prose">
<h2>Pick a package</h2>
<p>Every package starts with the same request form. Prices for each template are on its card.</p>
</div>
<div class="pkgs">
  <div class="pkg"><h3>Template files</h3><p class="from">from {inr(min_files)}</p><ul><li>The complete website files of the template you choose</li><li>A short written guide to put in your own name, photos and text</li><li>Everything runs on ordinary hosting, no server needed</li></ul></div>
  <div class="pkg"><h3>Setup &amp; launch</h3><p class="from">from {inr(min_setup)}</p><ul><li>We add your name, logo, colours, photos and text</li><li>We connect your domain and put the site live</li><li>Two rounds of changes after you review it</li></ul></div>
  <div class="pkg"><h3>Custom build</h3><p class="from">On request</p><ul><li>Changes to a template's layout or features, or a new page type</li><li>We agree the scope and price with you in writing first</li><li>Best for a business with specific needs</li></ul></div>
</div>
<div class="prose">
<h2>What you get after launch</h2>
<ul><li><b>An Owner view</b> to change products, prices, text, photos, offers and orders yourself, in the templates that include it.</li><li><b>Locked brand details.</b> Your business name and tax details are protected from accidental edits; real changes go through a verified request.</li><li><b>A site that works on phones</b> as well as computers.</li></ul>
<h2>About the photos you see</h2>
<p>The demos use sample photos and sample text so you can judge the design. Your own photos and words go in at setup. See the <a href="credits.html">photo credits</a>.</p>
<p><a class="btn btn-solid" href="quote.html">Request a quote</a></p>
</div>''')

# ---------------------------------------------------------------- faq
faqs = [
 ('What do I get when I order a template?', 'In the Template files package you get the complete website files and a short guide. In Setup &amp; launch we put your name, photos and text in and make it live for you. Custom build is for changes beyond that.'),
 ('Can I try a template before I order?', 'Yes. Every template opens as a live demo with a control bar: switch the colour theme, type your name to see it as the brand, change device size, and open the Owner view. Nothing you try is stored anywhere except in your own browser.'),
 ('Can I change colours, text and photos later?', 'Yes. Text and photos live in simple files, and templates with an Owner view let you change products, prices, text and offers without touching code.'),
 ('What is the Owner view?', 'A private control panel inside the three shop templates (Gift Shop, 3D House Shop and Scroll Openings) where the owner manages products, orders and text. The other templates are changed by us or through one simple settings file. Brand name, tax and legal details are locked so they cannot be changed by mistake.'),
 ('Do I need hosting or a domain?', 'You need a place to publish the files (many are free or cheap) and, if you want your own address, a domain. In Setup &amp; launch we connect these for you.'),
 ('Which devices and browsers are supported?', 'Current Chrome, Safari, Firefox and Edge on phones, tablets and computers. Templates are built phone first.'),
 ('Who owns the website after I pay?', 'You do. You receive the files and can host them anywhere. Sample photos are replaced with your own; photos that stay in the demo carry their own licences, listed on the credits page.'),
 ('How does payment work?', 'After you accept the quote we share payment details. Work starts, or files are sent, once payment is confirmed.'),
 ('What if something does not work?', 'Tell us through the request form or reply to your quote. Defects in what we delivered are fixed free of charge for 30 days after delivery.'),
 ('Can you build something that is not in the list?', 'Yes, choose Custom build in the request form and describe what you need. We will reply with a scope and a price.'),
 ('Is my information safe?', 'The details you send in the request form are used only to reply to you. Your typed name and theme choice stay in your browser. Read the <a href="privacy.html">privacy page</a>.'),
]
items = ''.join(f'<details class="faq"><summary>{q}</summary><p>{a}</p></details>' for q, a in faqs)
page('faq', 'FAQ', 'Answers about Pixelpatra templates, packages, hosting, ownership and payment.', f'''
{head('FAQ', 'Questions, answered', 'Can’t find yours? Use the request form and we will reply within one working day (Monday to Saturday).')}
{items}
<p style="margin-top:28px"><a class="btn btn-solid" href="quote.html">Request a quote</a></p>''')

# ---------------------------------------------------------------- about
page('about', 'About', 'Pixelpatra makes ready-made, immersive websites for portfolios, shops and makers, in India.', f'''
{head('About Pixelpatra', 'Websites that people remember', '')}
<div class="prose">
<p><b lang="hi">पत्र</b> (<i>patra</i>) means a page, or a letter. A website is both: a page people can visit and a letter from you to the world. Pixelpatra makes ready-made websites that read like a good letter and feel like a good room.</p>
<h2>What we make</h2>
<p>Portfolios, online shops, product websites and 3D experiences. Each one is designed once, tested on phones, and made so that its owner can run it day to day without a developer.</p>
<h2>What we care about</h2>
<ul><li><b>Calm and fast.</b> Pages that load quickly and respect people’s attention.</li><li><b>Immersive, but usable.</b> A memorable first scroll should never get in the way of buying or contacting.</li><li><b>Yours to run.</b> Owner views, locked brand details and plain files you can host anywhere.</li><li><b>Honest demos.</b> Demos use sample data only, never a real customer’s information.</li></ul>
<h2>Made in India</h2>
<p>Prices are in rupees, shops support UPI, GST invoices and Indian delivery, and every template works on the phones people actually use.</p>
<p><a class="btn btn-solid" href="quote.html">Request a quote</a> &nbsp; <a class="btn" href="demo/">Try the live demos</a></p>
</div>''')

# ---------------------------------------------------------------- legal
def legal(slug, title, desc, intro, sections):
    body = head('Legal', title, '') + f'<div class="prose"><p class="note">Last updated {TODAY}.</p><p>{intro}</p>' + ''.join(f'<h2>{h}</h2>{t}' for h, t in sections) + '</div>'
    page(slug, title, desc, body)
# Fill these in once, then run this script again; the legal pages use them. Empty values fall back to plain wording.
LEGAL_CITY, LEGAL_STATE = 'Greater Noida', 'Uttar Pradesh'
REPLY = 'within one working day (Monday to Saturday)'
PLACE = (f'{LEGAL_CITY}, {LEGAL_STATE}, India' if LEGAL_CITY and LEGAL_STATE else 'India')
COURTS = (f'the courts at {LEGAL_CITY}, {LEGAL_STATE}' if LEGAL_CITY and LEGAL_STATE else 'the courts in India')
legal('terms', 'Terms of use', 'The terms for using the Pixelpatra website and ordering templates, setup or custom websites.', f'These terms apply when you use this website or buy from Pixelpatra, which operates online only from {PLACE}. By asking us to start work or paying for a template, you agree to them.', [
 ('Using this website', '<p>You may browse the site and try the live demos to decide whether to buy. Please do not copy, scrape or resell the demos, templates or code unless you have bought them.</p>'),
 ('Demos contain sample data', '<p>Every demo uses made-up brands, products, people and prices. Nothing you try in a demo is a real order, payment or account, and demo content may be reset or changed at any time. Some film and images in demos are AI-generated or openly licensed samples; the <a href="credits.html">credits page</a> lists them.</p>'),
 ('Quotes and orders', f'<p>You ask for a quote through the <a href="quote.html">request form</a>. We reply {REPLY}. A quote lists what is included, the price and the timeline. An order begins when you accept the quote and we confirm your payment. We may decline a request we cannot deliver well.</p>'),
 ('The three packages', '<p><b>Template files:</b> you receive the files and set the site up yourself. <b>Setup &amp; launch:</b> we set the template up with your content and put it live. <b>Custom build:</b> we design and build a site for you, starting from a template. The quote says which one you are buying.</p>'),
 ('Prices and payment', '<p>Prices are in Indian rupees. Any taxes that apply are shown on the quote. Payment is taken in advance, or in the stages written in the quote, by the method we give you. Delivery starts once payment is confirmed.</p>'),
 ('Delivery', '<p>Template files are sent to you within one working day of payment. A Setup &amp; launch is usually live within 5 to 7 working days after we have your content. A Custom build follows the timeline in the quote. These are estimates; delays caused by late content, late feedback or third-party services may move them, and we will tell you.</p>'),
 ('What you may do with what you receive', '<p>You receive a licence to use the files or site for one website that you or your business own. You may edit them freely. You may not resell, share or redistribute the template itself. Pixelpatra keeps the copyright in the templates. Photos and other third-party material keep their own licences, listed on the <a href="credits.html">credits page</a>.</p>'),
 ('Your content', '<p>You are responsible for the text, photos, prices, legal details and any claims on your website, and for holding the right to use them. Do not give us material you do not own or that is unlawful.</p>'),
 ('Fixes and support', '<p>If something we delivered does not work as described, tell us within 30 days of delivery and we will fix it at no charge. Changes you ask for after delivery are quoted separately.</p>'),
 ('Third-party services', '<p>Hosting, domain names, payment gateways and delivery services are provided by other companies under their own terms. We cannot promise their availability.</p>'),
 ('Limits', '<p>We take care to deliver working websites, but we cannot promise they will earn sales or run without interruption. Our liability for any claim is limited to the amount you paid for the service in question.</p>'),
 ('Law and disputes', f'<p>These terms are governed by the laws of India. If we cannot settle a disagreement by talking, {COURTS} will have jurisdiction.</p>'),
 ('Changes', '<p>We may update these terms. The date at the top shows when they last changed. The terms in force when you accepted your quote apply to that order.</p>')])
legal('privacy', 'Privacy', 'What Pixelpatra collects, why, how long we keep it, and what stays in your own browser.', f'Pixelpatra operates online only from {PLACE}. We collect as little as possible. This page explains what, why, and your choices, in line with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.', [
 ('What we collect', '<p>If you use the request form, we receive what you type: your name, email or phone, business, what you need, budget and timeline. If you contact us by email or WhatsApp, we receive your message and number. We do not ask for card or bank details on this website.</p>'),
 ('Why we use it', '<p>To reply to you, prepare your quote, deliver what you buy, and keep the records the law requires. We do not send marketing unless you ask for it, and we never sell your details.</p>'),
 ('What stays in your browser', '<p>The name you type into the home page box, your colour theme choice, and anything you try in a live demo (cart, orders, Owner view edits) are saved in your own browser only. They are never sent to us. Clearing your browser data, or using “Reset demos” in the demo picker, removes them.</p>'),
 ('Who handles it', '<p>Only the services needed to run the site: our web host and form service (Netlify, when the request form is used on the Netlify site), email and WhatsApp for our replies, and a payment provider when you pay. Page fonts load from Google Fonts. Each handles data under its own policy, and some may store data on servers outside India.</p>'),
 ('How long we keep it', '<p>Request details are kept while we work with you and for 12 months after our last contact, then deleted. Records of paid orders are kept for 8 years, as Indian tax law requires.</p>'),
 ('Children', '<p>This service is for people aged 18 or over. We do not knowingly collect personal data of a child.</p>'),
 ('Cookies and tracking', '<p>This website does not use advertising cookies or tracking. If we add visitor statistics, we will say so here first.</p>'),
 ('Your rights', f'<p>You can ask to see, correct or delete the details you sent us, withdraw consent, or name someone to act for you. Use the <a href="quote.html">request form</a> and say so; we reply {REPLY} and finish within 30 days. If you are not satisfied, you may complain to the Data Protection Board of India.</p>'),
 ('If something goes wrong', '<p>If a breach of your personal data affects you, we will tell you and the authorities as the law requires.</p>')])
legal('refunds', 'Refunds', 'Pixelpatra’s refund and replacement policy for template files, setup and custom builds.', 'We want you to be happy with what you buy. Here is exactly how refunds work.', [
 ('In short', '<p>Digital files cannot be returned, so we do not refund for change of mind once they are delivered. If what we delivered does not work as described, we fix it, and if we cannot, we refund you. Cancelling before work starts is a full refund.</p>'),
 ('Template files', '<p>Template files are delivered by download link within one working day of payment. If they do not open or do not work as described, tell us within 7 days of delivery. We will fix the problem within 3 working days; if we cannot, we refund the full amount. We do not refund for change of mind or for files that work as described.</p>'),
 ('Setup &amp; launch', '<p>If you cancel before we start work, you get a full refund. If you cancel after work has begun, you pay for the work already done and we refund the rest. Once we have delivered the site and you have approved it, or 7 days pass after delivery without a report of a problem, the work is complete.</p>'),
 ('Custom build', '<p>The quote sets the stages and payments. If you cancel, you pay for the stages already started, and any advance for a stage that has not started is refunded. Work completed and approved is not refundable.</p>'),
 ('Something is wrong', f'<p>Tell us through the <a href="quote.html">request form</a> or by replying to your quote. We reply {REPLY}. We fix defects in what we delivered at no charge for 30 days after delivery.</p>'),
 ('Payments taken in error', '<p>If money was taken from your account but your order was not confirmed, we refund the full amount to the same payment method within 5 to 7 working days. Tell us the payment reference if you do not see it.</p>'),
 ('How refunds are paid', '<p>Refunds go back to the payment method you used, within 5 to 7 working days of approval. Your bank may take a few more days to show it.</p>')])

# ---------------------------------------------------------------- quote
opts = ''.join(f'<option value="{esc(t["name"])}" data-files="{t["files"]}" data-setup="{t["setup"]}">{esc(t["name"])} · {esc(t["tag"])}</option>' for t in TEMPLATES)
ADDONS = DATA.get('addons', [])
addon_html = ''.join(f'<label class="check addon"><input type="checkbox" name="features" value="{esc(a["label"])}" data-price="{a["price"]}"><span class="addon-t">{esc(a["label"])}<small>{esc(a["note"])}</small></span><b class="plus">+ {inr(a["price"])}</b></label>' for a in ADDONS)
quote_body = f'''
{head('Request a quote', 'Tell us what you need', 'Takes about two minutes. We reply with a clear quote; nothing starts until you agree.')}
<div class="qsummary" id="qsummary" role="alert" tabindex="-1" hidden></div>
<form class="qform" id="qform" name="quote" method="POST" action="quote.html" data-netlify="true" netlify-honeypot="bot-field" novalidate>
  <input type="hidden" name="form-name" value="quote">
  <p class="hp"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
  <fieldset><legend>About you</legend>
    <div class="row"><div class="field"><label for="q-name">Your name</label><input id="q-name" name="name" type="text" autocomplete="name" required><span class="err" id="e-name" role="alert"></span></div>
    <div class="field"><label for="q-org">Business or organisation <span class="hint">(optional)</span></label><input id="q-org" name="organisation" type="text" autocomplete="organization"></div></div>
    <div class="row"><div class="field"><label for="q-email">Email</label><input id="q-email" name="email" type="email" autocomplete="email" inputmode="email"><span class="err" id="e-email" role="alert"></span></div>
    <div class="field"><label for="q-phone">Phone or WhatsApp</label><input id="q-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"><span class="err" id="e-phone" role="alert"></span></div></div>
    <p class="hint" style="margin:-4px 0 14px;color:var(--muted)">Email or phone, at least one, so we can reach you.</p>
  </fieldset>
  <fieldset><legend>What you want</legend>
    <div class="row"><div class="field"><label for="q-template">Template</label><select id="q-template" name="template"><option value="Not sure yet">Not sure yet, help me choose</option>{opts}<option value="Something custom">Something custom</option></select></div>
    <div class="field"><label for="q-package">Package</label><select id="q-package" name="package"><option value="Template files">Template files</option><option value="Setup &amp; launch">Setup &amp; launch</option><option value="Custom build">Custom build</option></select></div></div>
    <div class="field"><label for="q-goal">What do you want your website to do?</label><textarea id="q-goal" name="goal" rows="5" placeholder="For example: show my work and get client enquiries; sell candles online with UPI payments; show our products to dealers."></textarea><span class="err" id="e-goal" role="alert"></span></div>
    <div class="field"><span class="lab">Extra services <span class="hint">(tick any; each one adds its price)</span></span><div class="checks addons">
      {addon_html}</div></div>
    <div class="estimate" id="q-estimate" role="status" aria-live="polite" data-basic="{BASIC}"></div>
    <input type="hidden" name="estimate" id="q-est" value="">
  </fieldset>
  <fieldset><legend>Practical details</legend>
    <div class="row"><div class="field"><label for="q-budget">Budget</label><select id="q-budget" name="budget"><option>Not decided</option><option>Under ₹10,000</option><option>₹10,000 to ₹25,000</option><option>₹25,000 to ₹50,000</option><option>₹50,000 or more</option></select></div>
    <div class="field"><label for="q-time">When do you need it?</label><select id="q-time" name="timeline"><option>No fixed date</option><option>As soon as possible</option><option>Within 2 weeks</option><option>Within a month</option></select></div></div>
    <div class="row"><div class="field"><label for="q-content">Is your content ready?</label><select id="q-content" name="content"><option>Not yet</option><option>Partly</option><option>Yes, text and photos are ready</option></select></div>
    <div class="field"><label for="q-url">Current website <span class="hint">(optional)</span></label><input id="q-url" name="website" type="url" inputmode="url" placeholder="https://"></div></div>
    <div class="field"><label for="q-contact">Best time to reach you <span class="hint">(optional)</span></label><input id="q-contact" name="best_time" type="text" placeholder="For example: weekdays after 5 pm"></div>
  </fieldset>
  <label class="check"><input type="checkbox" id="q-consent" name="consent" value="yes"> I agree that Pixelpatra may use these details to reply to me. <a href="privacy.html">Privacy</a></label><span class="err" id="e-consent" role="alert"></span>
  <div><button class="btn btn-solid" type="submit" id="q-send">Send my request</button></div>
</form>
<div class="qdone" id="qdone" hidden tabindex="-1" role="status"></div>'''
page('quote', 'Request a quote', 'Tell Pixelpatra what you need and get a clear quote for a website template, setup or custom build.', quote_body, extra_foot='<script src="shared/pp-quote.js"></script>')

# ---------------------------------------------------------------- credits
rows = ''.join(f'<tr><td>{esc(x["where"])}</td><td><a href="{esc(x["page"])}" rel="noopener">{esc(x["title"].rsplit(".", 1)[0])}</a></td><td>{esc(x["artist"] or "Unknown")}</td><td>' + (f'<a href="{esc(x["license_url"])}" rel="noopener">{esc(x["license"])}</a>' if x.get('license_url') else esc(x['license'])) + '</td></tr>' for x in CREDITS)
page('credits', 'Photo credits', 'Credits and licences for the photographs and media used in the Pixelpatra demos.', f'''
{head('Credits', 'Photo credits', 'The demos use openly licensed photographs. Your own site uses your own photos.')}
<div class="prose"><div style="overflow-x:auto"><table class="credits-table"><thead><tr><th>Where</th><th>Photo</th><th>Author</th><th>Licence</th></tr></thead><tbody>{rows}</tbody></table></div>
<h2>Film</h2><p>The seed-to-bottle film in the Product Website demo is AI-generated sample footage. It is not a record of any real factory.</p>
<h2>Software</h2><p>3D uses <a href="https://threejs.org" rel="noopener">three.js</a> (MIT licence).</p></div>''',
 extra_head='<style>.credits-table{width:100%;border-collapse:collapse;background:var(--surface);border-radius:12px;overflow:hidden}.credits-table th,.credits-table td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:14.5px;vertical-align:top}.credits-table th{background:color-mix(in srgb,var(--ink) 6%,var(--surface))}</style>')

# ---------------------------------------------------------------- compare and choose
def yn(v): return '<span class="yes" aria-label="Yes">✓</span>' if v else '<span class="no" aria-label="No">—</span>'
cmp_rows = ''.join(f"""<tr><th scope="row"><a href="demo/?demo={t['id']}">{esc(t['name'])}</a><small>{esc(t['tag'])}</small></th><td class="best">{esc(t['best'])}</td><td>{yn(t['has']['anim'])}</td><td>{yn(t['has']['shop'])}</td><td>{yn(t['has']['owner'])}</td><td>{yn(t['has']['app'])}</td><td>{inr(t['files'])}</td><td>{inr(t['setup'])}</td></tr>""" for t in TEMPLATES)
finder_data = json.dumps([{'id': t['id'], 'name': t['name'], 'best': t['best'], 'desc': t['desc']} for t in TEMPLATES], ensure_ascii=False)
FINDER_JS = """<script>
(function () {
  var T = __DATA__, byId = {}; T.forEach(function (t) { byId[t.id] = t; });
  var Q = { start: { q: 'What is your website for?', o: [['Showing my work, or myself', 'work'], ['Selling products online', 'shop'], ['Showing a factory or product to dealers', 'oil'], ['Keeping lists of people or records', 'records'], ['I just want a striking opening effect', 'pixel']] },
    work: { q: 'What feel do you want?', o: [['Bold and 3D, to be remembered', 'portfolio'], ['Clear and professional, to win clients or a job', 'ba']] },
    shop: { q: 'How should the shop open?', o: [['A clean, simple shop that is ready fast', 'sample1'], ['A 3D walk through a house', 'house'], ['A cinematic scroll opening', 'intros']] } };
  var box = document.getElementById('finder'), hist = [];
  function esc(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function show(key) {
    if (byId[key]) { var t = byId[key];
      box.innerHTML = '<h3>We suggest: ' + esc(t.name) + '</h3><p>' + esc(t.desc) + '</p><p class="fnote">Best for: ' + esc(t.best) + '.</p><p class="factions"><a class="btn btn-solid" href="demo/?demo=' + t.id + '">Open the live demo</a> <a class="btn" href="quote.html?template=' + encodeURIComponent(t.name) + '">Request this template</a> <button type="button" class="btn" id="f-again">Start again</button></p>';
      document.getElementById('f-again').addEventListener('click', function () { hist = []; show('start'); }); box.focus(); return; }
    var n = Q[key]; box.innerHTML = '<h3>' + esc(n.q) + '</h3><div class="fopts">' + n.o.map(function (o) { return '<button type="button" class="btn fopt" data-k="' + o[1] + '">' + esc(o[0]) + '</button>'; }).join('') + '</div>' + (hist.length ? '<p><button type="button" class="linkbtn" id="f-back">Back</button></p>' : '');
    [].forEach.call(box.querySelectorAll('.fopt'), function (b) { b.addEventListener('click', function () { hist.push(key); show(b.dataset.k); }); });
    var bk = document.getElementById('f-back'); if (bk) bk.addEventListener('click', function () { show(hist.pop()); }); if (hist.length) box.focus();
  }
  show('start');
})();
</script>""".replace('__DATA__', finder_data)
CMP_CSS = '<style>.finder{border:1px solid var(--line);background:var(--surface);border-radius:16px;padding:22px;margin:0 0 34px}.finder h3{margin:0 0 12px;font-size:22px}.fopts{display:grid;gap:10px}.fopt{justify-content:flex-start;text-align:left;min-height:48px;white-space:normal}.fnote{color:var(--muted)}.factions{display:flex;gap:10px;flex-wrap:wrap}.cmp-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--surface)}.cmp{border-collapse:collapse;width:100%;min-width:860px}.cmp th,.cmp td{padding:11px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:14.5px}.cmp thead th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}.cmp tbody th{position:sticky;left:0;background:var(--surface);min-width:170px}.cmp th small{display:block;font-weight:400;color:var(--muted)}.cmp .best{min-width:190px;color:var(--muted)}.cmp .yes{color:#15803d;font-weight:800}.cmp .no{color:var(--muted)}.cmp tr:last-child th,.cmp tr:last-child td{border-bottom:0}.cmp-note{color:var(--muted);margin-top:14px}.cmp-wrap:focus-visible{outline:3px solid var(--saffron);outline-offset:2px}</style>'
page('compare', 'Compare and choose', 'Compare all Pixelpatra templates side by side, or answer a short question to find the one that suits your business.', f"""
{head('Compare', 'Find the right template', 'Answer one or two questions, or compare all of them in one table.')}
<section class="finder" aria-labelledby="f-h"><h2 id="f-h" class="sr">Which template suits me?</h2><div id="finder" tabindex="-1" aria-live="polite"></div></section>
<h2>All templates side by side</h2>
<div class="cmp-wrap" tabindex="0" role="region" aria-label="Template comparison. Scrolls sideways on small screens."><table class="cmp"><thead><tr><th scope="col">Template</th><th scope="col">Best for</th><th scope="col">Animation or 3D</th><th scope="col">Online shop</th><th scope="col">Owner view</th><th scope="col">Installed-app view</th><th scope="col">Files from</th><th scope="col">Setup from</th></tr></thead><tbody>{cmp_rows}</tbody></table></div>
<p class="cmp-note">Setup &amp; launch starts at the Basic price and grows with the extra services you choose. A Custom build is priced from your needs. <a href="quote.html">Request a quote</a> for any of them.</p>
""", extra_head=CMP_CSS, extra_foot=FINDER_JS)

# ---------------------------------------------------------------- 404, sitemap, robots
page('404', 'Page not found', 'That page does not exist. Pick a template or go back to the home page.', f"""
{head('404', 'We could not find that page', 'The link may be old or mistyped. These will get you back on track.')}
<p style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-solid" href="index.html">Go to the home page</a> <a class="btn" href="index.html#templates">See the templates</a> <a class="btn" href="demo/">Try the live demos</a> <a class="btn" href="quote.html">Request a quote</a></p>
""")
# a missing page can be asked for at any depth, so the 404 page works out where the site starts
_p = f'{ROOT}/404.html'; _s = open(_p, encoding='utf-8').read()
_s = _s.replace('<head>', '<head>\n<script>document.write(\'<base href="\' + (/github\\.io$/.test(location.hostname) ? "/" + location.pathname.split("/")[1] + "/" : "/") + \'">\');</script>', 1)
_s = _s.replace('<meta name="theme-color"', '<meta name="robots" content="noindex"><meta name="theme-color"', 1)
_s = re.sub(r'<link rel="canonical"[^>]*><meta property="og:url"[^>]*>', '', _s)
open(_p, 'w', encoding='utf-8').write(_s)
_urls = ['', 'compare.html', 'how-it-works.html', 'faq.html', 'about.html', 'quote.html', 'demo/', 'terms.html', 'privacy.html', 'refunds.html', 'credits.html']
open(f'{ROOT}/sitemap.xml', 'w', encoding='utf-8').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{SITE_URL}{u}</loc></url>\n' for u in _urls) + '</urlset>\n')
open(f'{ROOT}/robots.txt', 'w', encoding='utf-8').write(f'User-agent: *\nAllow: /\nDisallow: /Sample_1/\nDisallow: /Sample_2/\nDisallow: /Sample_3/\nDisallow: /Sample_4/\nDisallow: /Sample_5/\nDisallow: /Sample_6/\nDisallow: /House_3D_Prototype/\nDisallow: /kits/\n\nSitemap: {SITE_URL}sitemap.xml\n')

# ---------------------------------------------------------------- home page blocks
def lqip(img):
    p = f'{ROOT}/previews/{img}.jpg'
    if not os.path.exists(p): return ''
    b = io.BytesIO(); Image.open(p).convert('RGB').resize((24, 15), Image.LANCZOS).save(b, 'JPEG', quality=40)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

cards = ''
for t in TEMPLATES:
    bg = f' style="background:url({lqip(t["img"])}) center/cover"' if lqip(t['img']) else ''
    cards += f'''        <article class="card reveal" data-name="{esc(t['name'])}" data-cat="{t['cats']}" data-id="{t['id']}" data-files="{t['files']}" data-setup="{t['setup']}" data-demo="demo/?demo={t['id']}">
          <span class="glare"></span>
          <div class="tshot"{bg}>
            <span class="brandchip" hidden aria-hidden="true"><i class="bi"></i><span>as <b class="nm"></b></span></span>
            <div class="bar"><i></i><i></i><i></i></div>
            <img class="dt" src="previews/{t['img']}.jpg" width="1000" height="625" alt="{esc(t['name'])} template, desktop view" loading="lazy">
            <img class="ph" src="previews/{t['img']}-m.jpg" alt="{esc(t['name'])} template, phone view" loading="lazy">
            <span class="live">▶ Try it live</span>
          </div>
          <div class="card-body">
            <div class="card-top"><h3>{esc(t['name'])}</h3><span class="tag">{esc(t['tag'])}</span></div>
            <p class="desc">{esc(t['desc'])}</p>
            <div class="card-foot">
              <p class="price"><span class="num">{inr(t['files'])}</span><small class="lbl">template files</small></p>
              <div class="actions">
                <button type="button" class="btn btn-sm copylink" data-copy="demo/?demo={t['id']}" aria-label="Copy a link to the {esc(t['name'])} demo" data-tip="Copy a link to share this demo. Anyone who opens it sees this template."><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.7-1.7"/></svg></button>
                <a class="btn btn-sm demo" href="demo/?demo={t['id']}">Open live demo</a>
                <a class="btn btn-sm btn-solid buy" href="quote.html?template={esc(t['name'])}">Request quote</a>
              </div>
            </div>
          </div>
        </article>
'''
total = sum(t['files'] for t in TEMPLATES)

def patch_index():
    p = f'{ROOT}/index.html'; s = open(p, encoding='utf-8').read()
    def block(name, content):
        nonlocal s
        a, b = f'<!--pp:{name}-->', f'<!--/pp:{name}-->'
        if a in s: s = re.sub(re.escape(a) + r'.*?' + re.escape(b), lambda m: a + '\n' + content + '\n' + b, s, flags=re.S)
        else: raise SystemExit(f'marker {a} missing in index.html')
    block('header', HEADER); block('footer', FOOTER); block('cards', cards.rstrip('\n'))
    s = re.sub(r'<span id="tcount">[^<]*</span>', f'<span id="tcount">{len(TEMPLATES)} templates in 4 categories</span>', s)
    open(p, 'w', encoding='utf-8').write(s)

def patch_hub():
    p = f'{ROOT}/demo/index.html'; s = open(p, encoding='utf-8').read()
    demos = [{'id': t['id'], 'cats': t['cats'].split(), 'group': t['group'], 'name': f"{t['name']} · {t['tag']}", 'url': t['url'], 'owner': bool(t.get('owner')), 'note': t['note'], 'try': t.get('try', '')} for t in TEMPLATES]
    block = '/*pp:demos*/\n  var DEMOS = ' + json.dumps(demos, ensure_ascii=False, indent=2).replace('\n', '\n  ') + ';\n  /*/pp:demos*/'
    s = re.sub(r'/\*pp:demos\*/.*?/\*/pp:demos\*/', lambda m: block, s, flags=re.S)
    open(p, 'w', encoding='utf-8').write(s)

if __name__ == '__main__':
    patch_hub()
    if os.path.exists(f'{ROOT}/index.html') and '<!--pp:header-->' in open(f'{ROOT}/index.html', encoding='utf-8').read(): patch_index()
    print('pages written:', ', '.join(['how-it-works', 'faq', 'about', 'quote', 'compare', '404', 'terms', 'privacy', 'refunds', 'credits']))
