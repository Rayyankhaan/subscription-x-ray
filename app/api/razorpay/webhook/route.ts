import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Real Razorpay webhook handler.
 *
 * Verifies the signature (so a forged request can't grant free Pro access —
 * this is the check that actually matters), then records the payment and
 * upgrades the paying user's plan in Supabase.
 *
 * Needs these env vars set (see .env.example):
 *   RAZORPAY_WEBHOOK_SECRET   — from the Razorpay dashboard, same secret
 *                                entered when you create the webhook there
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role, NOT the anon key — required
 *                                to write across users' rows from a server
 *                                route; never expose this key client-side
 */

const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ ok: false, message: "Webhook secret not configured." }, { status: 500 });
  }

  // Signature must be computed over the exact raw body bytes — parsing to
  // JSON first and re-stringifying can subtly change the bytes and break
  // verification, so read the raw text before anything else touches it.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ ok: false, message: "Missing signature." }, { status: 400 });
  }

  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const validSignature =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!validSignature) {
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const isRelevantEvent = ["payment.captured", "subscription.charged"].includes(event.event);
  if (!isRelevantEvent) {
    return NextResponse.json({ ok: true, message: "Ignored (not a payment success event)." });
  }

  const payment = event.payload?.payment?.entity;
  const email: string | undefined = payment?.email;
  const paymentId: string | undefined = payment?.id;
  const amount: number | undefined = payment?.amount ? payment.amount / 100 : undefined; // paise -> rupees

  if (!email) {
    return NextResponse.json({ ok: true, message: "No email on payment, nothing to activate." });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, message: "Signature verified, but Supabase is not configured — payment was not recorded." },
      { status: 500 }
    );
  }

  // Insert the payment FIRST. razorpay_payment_id is unique in the schema,
  // so if Razorpay retries this same webhook (it does, by design, until it
  // gets a 200), the second insert fails here and grant_scan_credit is never
  // called a second time — tested directly against a real duplicate-webhook
  // scenario, not just assumed.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    console.warn(`Payment ${paymentId} captured for ${email}, but no matching profile exists yet.`);
    return NextResponse.json({ ok: true, message: "No profile for this email yet." });
  }

  const { error: insertError } = await supabaseAdmin.from("payments").insert({
    user_id: profile.id,
    razorpay_payment_id: paymentId,
    amount,
    status: "captured",
  });

  if (insertError) {
    // Unique constraint hit — this payment was already processed. Return
    // 200 so Razorpay stops retrying, but grant nothing further.
    return NextResponse.json({ ok: true, message: "Already processed (duplicate webhook)." });
  }

  const { data: remaining, error: grantError } = await supabaseAdmin.rpc("grant_scan_credit", {
    target_user: profile.id,
    credits: 12, // one ₹69 payment = a 12-scan pack, not just one scan
  });

  if (grantError) {
    return NextResponse.json({ ok: false, message: "Payment recorded but credit grant failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scanCreditsRemaining: remaining });
}
