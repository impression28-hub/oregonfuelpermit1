// netlify/functions/create-payment-intent.js
//
// Called from payment.html right before the customer pays.
// 1. Saves the application as a "pending" row in Supabase (this is
//    what makes it show up in the admin panel as a "request").
// 2. Creates a Stripe PaymentIntent tagged with that row's id.
// 3. Returns the client secret so the browser can complete payment.
//
// Required environment variables (set in Netlify → Site settings →
// Environment variables):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (service role key — never expose this in the browser)
//   STRIPE_SECRET_KEY

const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Basic sanity check — the real fee validation should eventually live
  // here too (recomputing price server-side), rather than trusting the
  // price the browser sends. See the note in the project README.
  const price = Number(data.price);
  if (!price || price <= 0) {
    return { statusCode: 400, body: "Missing or invalid price" };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const row = {
    order_type: data.orderType === "extended-weight" ? "extended-weight" : "trip",
    status: "pending",
    company: data.company || null,
    usdot: data.usdot || null,
    email: data.email || null,
    phone: data.phone || null,
    price,

    driver: data.driver || null,
    vehicle_year: data.year || null,
    vehicle_make: data.make || null,
    vin: data.vin || null,
    plate: data.plate || null,
    plate_state: data.plateState || null,
    plate_type: data.plateType || null,
    weight: data.weight || null,
    axles: data.axles || null,
    ownership: data.ownership || null,
    leasing_company: data.leasingCompany || null,
    commodity: data.commodity || null,
    direction: data.direction || null,
    trip_type: data.tripType || null,
    entrance: data.entrance || null,
    exit: data.exit || null,
    stops: data.stops || null,
    miles: data.miles || null,

    unit_number: data.unitNumber || null,
    permit_type: data.permitType || null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("submissions")
    .insert(row)
    .select()
    .single();

  if (insertError) {
    return { statusCode: 500, body: `Database error: ${insertError.message}` };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(price * 100),
    currency: "usd",
    receipt_email: data.email || undefined,
    metadata: {
      submission_id: inserted.id,
      order_type: row.order_type,
    },
  });

  await supabase
    .from("submissions")
    .update({ payment_intent_id: paymentIntent.id })
    .eq("id", inserted.id);

  return {
    statusCode: 200,
    body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
  };
};
