// SAMPLE STUDIO · where the shop would keep everything that changes without a code change: products, prices, stock,
// photos and videos, site text, settings, orders, reviews and sign-ups.
//
// This is a prototype: no database is connected, so the site runs on its built-in sample content and every Owner view
// change stays in the visitor's own browser ("demo mode"). For a paying client, put their Supabase Project URL and
// anon key here (Supabase → Project Settings → API). Never put a service_role key in the site.
window.SHOP_CONFIG = {
  // Owner sign-in asks for an authenticator app code after the password when this is true (needs a database).
  ownerTwoStep: false,
  supabase: {
    url: '',
    anonKey: ''
  }
};
