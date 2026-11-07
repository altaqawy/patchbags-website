/* PatCh.BaGs commerce service configuration.
   Safe to publish: only PUBLIC client credentials belong here.
   Never place Paymob API keys, payment secrets or Supabase service-role keys in this file.

   For real account access, connect your Supabase project using the public URL and
   publishable/anon key below. HTTPS + email verification are recommended.
   For online payment, provision an independently hosted server endpoint that
   validates product IDs, prices, stock, shipping and order identity server-side,
   then requests a hosted checkout session from your payment provider. */
window.PATCH_STORE_CONFIG = Object.freeze({
  supabaseUrl: "",
  supabasePublishableKey: "",
  paymentApiEndpoint: ""
});
