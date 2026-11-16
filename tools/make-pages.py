#!/usr/bin/env python3
"""Builds Pixelpatra's own pages from one place, so the header, footer, template list and prices never drift apart.

    python3 tools/make-pages.py

Reads shared/templates.json (the template list and prices) and shared/credits.json (photo credits), writes
how-it-works.html, faq.html, about.html, quote.html, terms.html, privacy.html, refunds.html and credits.html, and refreshes
the header, footer, template cards and bundle block of index.html between the <!--pp:...--> markers.
"""
import base64, html, io, json, os, re
from datetime import date
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(f'{ROOT}/shared/templates.json', encoding='utf-8'))
TEMPLATES, BUNDLE = DATA['templates'], DATA['bundle']['price']
CREDITS = json.load(open(f'{ROOT}/shared/credits.json', encoding='utf-8'))
TODAY = date.today().strftime('%d %B %Y').lstrip('0')
inr = lambda n: '₹' + format(int(n), ',')
esc = html.escape

LOGO = '<span class="logo-mark" aria-hidden="true"><i></i><i></i><i class="o"></i><i></i><i class="x"></i><i></i><i></i><i class="x"></i><i class="x"></i></span>'
HEADER = f'''<a class="skip-link" href="#main">Skip to the content</a>
<header class="top" id="top">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="Pixelpatra home">{LOGO}Pixelpatra</a>
    <nav class="nav" aria-label="Main">
      <a href="index.html#templates">Templates</a>
      <a class="hide-sm" href="demo/">Live demos</a>
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
    <div><h3>Pixelpatra</h3><ul><li><a href="demo/">Live demos</a></li><li><a href="how-it-works.html">How it works</a></li><li><a href="faq.html">FAQ</a></li><li><a href="about.html">About</a></li><li><a href="quote.html">Request a quote</a></li></ul></div>
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
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<script src="shared/pp-config.js"></script>
<script src="shared/pp-theme.js" data-pp="store"></script>
<link rel="stylesheet" href="shared/pp-site.css">{extra_head}
</head>
<body>
{HEADER}
<main class="wrap page" id="main">
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
  <div><b>Get your quote</b><p>We reply with a clear quote that lists exactly what is included. Nothing starts until you say yes.</p></div>
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
 ('What is the Owner view?', 'A private control panel inside the shop and portfolio templates where the owner manages day-to-day content. Brand name, tax and legal details are locked so they cannot be changed by mistake.'),
 ('Do I need hosting or a domain?', 'You need a place to publish the files (many are free or cheap) and, if you want your own address, a domain. In Setup &amp; launch we connect these for you.'),
 ('Which devices and browsers are supported?', 'Current Chrome, Safari, Firefox and Edge on phones, tablets and computers. Templates are built phone first.'),
 ('Who owns the website after I pay?', 'You do. You receive the files and can host them anywhere. Sample photos are replaced with your own; photos that stay in the demo carry their own licences, listed on the credits page.'),
 ('How does payment work?', 'After you accept the quote we share payment details. Work starts, or files are sent, once payment is confirmed.'),
 ('What if something does not work?', 'Tell us through the request form or reply to your quote. Defects in what we delivered are fixed free of charge.'),
 ('Can you build something that is not in the list?', 'Yes, choose Custom build in the request form and describe what you need. We will reply with a scope and a price.'),
 ('Is my information safe?', 'The details you send in the request form are used only to reply to you. Your typed name and theme choice stay in your browser. Read the <a href="privacy.html">privacy page</a>.'),
]
items = ''.join(f'<details class="faq"><summary>{q}</summary><p>{a}</p></details>' for q, a in faqs)
page('faq', 'FAQ', 'Answers about Pixelpatra templates, packages, hosting, ownership and payment.', f'''
{head('FAQ', 'Questions, answered', 'Can’t find yours? Use the request form and we will reply.')}
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
legal('terms', 'Terms of use', 'The terms for using the Pixelpatra website and ordering templates.', 'These terms cover your use of this website and of the templates and services offered through it.', [
 ('Using this website', '<p>You may browse the site and try the live demos for your own evaluation. Please do not copy the demos, templates or code, or resell them, unless you have bought them.</p>'),
 ('Demos', '<p>The demos contain sample data only. Nothing you try in a demo is a real order, payment or account, and demo content may be reset at any time.</p>'),
 ('Quotes and orders', '<p>A quote lists what is included and its price. An order begins when you accept the quote and payment is confirmed. We may decline a request we cannot deliver well.</p>'),
 ('What you receive', '<p>You receive the files or the live site described in your quote. You may use them for your own or your business’s website. Photos and other third-party material keep their own licences, listed on the <a href="credits.html">credits page</a>.</p>'),
 ('Your content', '<p>You are responsible for the text, photos, prices, legal details and any claims you put on your website, and for holding the right to use them.</p>'),
 ('Limits', '<p>We take care to deliver working websites, but we cannot promise uninterrupted availability of third-party hosting, payment or delivery services. Our liability is limited to the amount you paid for the service in question.</p>'),
 ('Changes', '<p>We may update these terms. The date at the top shows when they last changed.</p>')])
legal('privacy', 'Privacy', 'What Pixelpatra collects, why, and what stays in your own browser.', 'We collect as little as possible. This page explains what, and why.', [
 ('Details you send us', '<p>If you use the request form, we receive the details you type (name, email or phone, business, what you need). We use them only to reply to you and prepare your quote, and keep them while we are working with you or until you ask us to delete them.</p>'),
 ('What stays in your browser', '<p>The name you type into the home page box, your colour theme choice, and anything you try in a live demo (cart, orders, Owner view edits) are saved in your own browser only. They are never sent to us. Clearing your browser data, or using “Reset demos” in the demo picker, removes them.</p>'),
 ('Cookies and tracking', '<p>This website does not use advertising cookies or tracking. If we add visitor statistics, we will say so here.</p>'),
 ('Third parties', '<p>Page fonts load from Google Fonts. If you choose to contact us on WhatsApp or email, those services handle your message under their own policies.</p>'),
 ('Your choices', '<p>You can ask us to show, correct or delete the details you sent. Use the <a href="quote.html">request form</a> and say so.</p>')])
legal('refunds', 'Refunds', 'Pixelpatra’s refund and replacement policy for templates and services.', 'We want you to be happy with what you buy. Here is how refunds work.', [
 ('Template files', '<p>Template files are digital and delivered immediately. Once delivered they cannot be returned, so they are not refundable, except where they do not work as described and we cannot fix the problem. In that case we will fix it, or refund you.</p>'),
 ('Setup &amp; launch and Custom build', '<p>If you cancel before work begins, you receive a full refund. If you cancel after work has begun, you pay for the work already done. Once we have delivered the site and you have approved it, the work is complete.</p>'),
 ('Something is wrong', '<p>Tell us through the <a href="quote.html">request form</a> or by replying to your quote. We fix defects in what we delivered at no charge.</p>'),
 ('How refunds are paid', '<p>Refunds go back to the original payment method and may take several working days to appear.</p>')])

# ---------------------------------------------------------------- quote
opts = ''.join(f'<option value="{esc(t["name"])}">{esc(t["name"])} · {esc(t["tag"])}</option>' for t in TEMPLATES)
quote_body = f'''
{head('Request a quote', 'Tell us what you need', 'Takes about two minutes. We reply with a clear quote; nothing starts until you agree.')}
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
    <div class="field"><span class="lab">Features you need <span class="hint">(tick any)</span></span><div class="checks">
      <label class="check"><input type="checkbox" name="features" value="Online ordering"> Online ordering</label><label class="check"><input type="checkbox" name="features" value="Payments"> Payments</label><label class="check"><input type="checkbox" name="features" value="Owner view"> Owner view</label><label class="check"><input type="checkbox" name="features" value="Blog or journal"> Blog or journal</label><label class="check"><input type="checkbox" name="features" value="More than one language"> More than one language</label><label class="check"><input type="checkbox" name="features" value="Domain and hosting help"> Domain and hosting help</label><label class="check"><input type="checkbox" name="features" value="Logo and branding"> Logo and branding</label></div></div>
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
                <a class="btn btn-sm demo" href="demo/?demo={t['id']}">Open live demo</a>
                <a class="btn btn-sm btn-solid buy" href="quote.html?template={esc(t['name'])}">Request quote</a>
              </div>
            </div>
          </div>
        </article>
'''
total = sum(t['files'] for t in TEMPLATES)
bundle = f'''<div class="bundle reveal">
        <div class="px" aria-hidden="true"><i></i><i class="x"></i><i></i><i></i><i class="x"></i><i></i><i></i><i class="x"></i><i></i><i></i><i class="x"></i><i></i><i></i><i></i><i class="x"></i></div>
        <div>
          <p class="eyebrow">Bundle</p>
          <h2>All {len(TEMPLATES)} templates, one price</h2>
          <p>Get every template together. Use them for yourself, your business, or your next client.</p>
          <ul>
            <li><span>All {len(TEMPLATES)} templates, bought separately</span><span class="price">{inr(total)}</span></li>
          </ul>
        </div>
        <div class="deal">
          <span class="save">You save {inr(total - BUNDLE)}</span>
          <div class="big price">{inr(BUNDLE)}</div>
          <a class="btn btn-solid buy" id="buy-bundle" href="quote.html?template=Bundle">Request the bundle</a>
        </div>
      </div>'''

def patch_index():
    p = f'{ROOT}/index.html'; s = open(p, encoding='utf-8').read()
    def block(name, content):
        nonlocal s
        a, b = f'<!--pp:{name}-->', f'<!--/pp:{name}-->'
        if a in s: s = re.sub(re.escape(a) + r'.*?' + re.escape(b), lambda m: a + '\n' + content + '\n' + b, s, flags=re.S)
        else: raise SystemExit(f'marker {a} missing in index.html')
    block('header', HEADER); block('footer', FOOTER); block('cards', cards.rstrip('\n')); block('bundle', bundle)
    s = re.sub(r'<span id="tcount">[^<]*</span>', f'<span id="tcount">{len(TEMPLATES)} templates in 4 categories</span>', s)
    s = re.sub(r'Get all \d+ for ₹[\d,]+', f'Get all {len(TEMPLATES)} for {inr(BUNDLE)}', s)
    open(p, 'w', encoding='utf-8').write(s)

if __name__ == '__main__':
    if os.path.exists(f'{ROOT}/index.html') and '<!--pp:header-->' in open(f'{ROOT}/index.html', encoding='utf-8').read(): patch_index()
    print('pages written:', ', '.join(['how-it-works', 'faq', 'about', 'quote', 'terms', 'privacy', 'refunds', 'credits']))
