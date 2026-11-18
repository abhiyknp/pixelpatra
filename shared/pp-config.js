// Pixelpatra settings. Fill these in before going live; nothing else needs editing.
// Anything left empty is simply hidden or falls back, so the site never shows a broken button.
window.PP_CONFIG = {
  brand: 'Pixelpatra',
  whatsapp: '',       // digits with country code, no plus, e.g. 919876543210. Empty: WhatsApp buttons are hidden
  email: '',          // where quote requests are sent when the form cannot post to Netlify, e.g. hello@yourdomain.com
  instagram: '',      // handle without @, optional
  // Quote form delivery order: 1) Netlify Forms (works automatically on Netlify), 2) email, 3) WhatsApp, 4) copy-to-clipboard
  reward: { text: 'A free 15-minute planning call' },   // unlocked when a visitor explores five things; change it to a discount if you prefer, for example 'Rs 2,000 off your first order'
  payLinks: {}        // optional per-template payment links, e.g. { "Gift Shop": { files: "https://rzp.io/...", setup: "" } }
};
