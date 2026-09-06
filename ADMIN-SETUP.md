# Admin panel setup

This adds a database-backed admin panel so you can see every application
that reaches checkout — paid or still pending. It requires two free
accounts (Supabase and Stripe) and deploying to Netlify.

## 1. Create a Supabase project
1. Go to supabase.com, sign up, create a new project.
2. In the SQL Editor, paste and run the contents of `supabase-schema.sql`
   (in this folder). This creates the `submissions` table and locks it
   down so only a logged-in admin can read it.
3. Go to Project Settings → API. Copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **anon public key** → this is `SUPABASE_ANON_KEY`
   - **service_role key** → this is `SUPABASE_SERVICE_ROLE_KEY`
     (keep this one secret — never put it in a browser-facing file)

## 2. Create your admin login
1. In Supabase, go to Authentication → Users → Add user.
2. Enter the email/password you want to use to log into `/admin.html`.
   This is the only account that will be able to see submissions.

## 3. Fill in the admin panel's Supabase keys
Open `admin.html` and replace:
```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```
with your actual Project URL and anon public key from step 1.

## 4. Set environment variables in Netlify
In Netlify → Site settings → Environment variables, add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (from step 5)

## 5. Add the Stripe webhook
1. In the Stripe dashboard, go to Developers → Webhooks → Add endpoint.
2. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
3. Select event: `payment_intent.succeeded`
4. Stripe will show you a signing secret (`whsec_...`) — set that as
   `STRIPE_WEBHOOK_SECRET` in Netlify.

## 6. Deploy
Push this whole folder to Netlify (or connect the Git repo). Netlify
will pick up `netlify.toml` automatically and deploy the two functions
in `netlify/functions/`.

## 7. Fill in your Stripe publishable key
In `payment.html`, replace:
```js
const STRIPE_PUBLISHABLE_KEY = "pk_test_REPLACE_WITH_YOUR_KEY";
```
with your real Stripe publishable key (test key while testing, live key
when you go live).

## How it works
- When a customer reaches the payment page and submits their card,
  `create-payment-intent` saves their application to Supabase as
  **pending** and creates a Stripe PaymentIntent.
- When Stripe actually confirms the charge, it calls your
  `stripe-webhook` function, which flips that row to **paid**.
- `/admin.html` is a login-gated page that lists everything in that
  table, filterable by status.

## Worth knowing before you rely on this
- **Price isn't re-verified server-side yet.** The fee shown to the
  customer is trusted as-is when creating the PaymentIntent. Before
  handling real money, it's worth having the function recompute the
  price from the submitted weight/mileage rather than trusting the
  number the browser sends — otherwise someone could tamper with it
  before checkout.
- **This hasn't been tested end-to-end**, since it depends on your own
  Supabase project, Stripe account, and Netlify deployment — none of
  which exist yet in this conversation. Test the whole flow with a
  Stripe test card before going live.
