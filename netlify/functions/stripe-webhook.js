// netlify/functions/stripe-webhook.js
//
// Point a Stripe webhook at: https://yourdomain.com/api/stripe-webhook
// Subscribe it to the "payment_intent.succeeded" event in the Stripe
// dashboard (Developers → Webhooks → Add endpoint).
//
// This is what actually marks an order "paid" in the admin panel —
// relying on the browser alone to report success isn't trustworthy,
// since a closed tab or a network drop shouldn't be able to fake a paid order.
//
// Required environment variables:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   (shown when you create the webhook in Stripe)

const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

exports.handler = async (event) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = event.headers["stripe-signature"];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook signature verification failed: ${err.message}` };
  }

  if (stripeEvent.type === "payment_intent.succeeded") {
    const intent = stripeEvent.data.object;
    const submissionId = intent.metadata && intent.metadata.submission_id;

    if (submissionId) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase
        .from("submissions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", submissionId);
    }
  }

  return { statusCode: 200, body: "ok" };
};
