"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Scanner from "@/components/Scanner";

type Gate = "checking" | "needs-login" | "needs-payment" | "unlocked";

const PACK_SIZE = 12;
const PACK_PRICE = "₹69";

export default function ScannerPage() {
  const [gate, setGate] = useState<Gate>("checking");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState(0);

  async function refreshCredits(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("scan_credits")
      .eq("id", userId)
      .maybeSingle();

    const remaining = profile?.scan_credits ?? 0;
    setCredits(remaining);
    setGate(remaining > 0 ? "unlocked" : "needs-payment");
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setGate("needs-login");
        return;
      }
      setEmail(session.user.email ?? "");
      setUserId(session.user.id);
      await refreshCredits(session.user.id);
    })();
  }, []);

  // Spends one credit from the pack. Stays unlocked and shows the new
  // remaining count as long as credits > 0 — only re-locks once the whole
  // pack of 12 is actually used up.
  async function onScanComplete() {
    const { data: remaining, error } = await supabase.rpc("consume_scan_credit");
    if (error) {
      setGate("needs-payment");
      setCredits(0);
      return;
    }
    setCredits(remaining);
    if (remaining <= 0) setGate("needs-payment");
  }

  if (gate === "checking") {
    return <main className="scanner-page"><div className="wrap"><p className="lede">Checking your account…</p></div></main>;
  }

  if (gate === "needs-login") {
    return (
      <main className="scanner-page">
        <div className="wrap gate-card">
          <h1>Sign in to scan your statements</h1>
          <p className="lede">One payment unlocks {PACK_SIZE} scans on your account — sign in or create an account to continue.</p>
          <a className="btn btn-primary" href="/login">Sign in / create account</a>
        </div>
      </main>
    );
  }

  if (gate === "needs-payment") {
    return (
      <main className="scanner-page">
        <div className="wrap gate-card">
          <h1>{PACK_SIZE} scans for {PACK_PRICE} — locked until payment</h1>
          <p className="lede">
            {email && <>Signed in as {email}. </>}
            {credits === 0 && "You're out of scans. "}
            Pay once, get {PACK_SIZE} scans to use whenever — check every card statement in the house, recheck
            next month, whatever you need. Nothing repeats automatically; buy another pack only when you actually want one.
          </p>
          <div id="razorpay-mount">
            {/* Real Razorpay Payment Button goes here once deployed on your
               own domain — see chat for the exact embed + setup steps. */}
            <a className="btn btn-primary" href="/#pricing">Pay {PACK_PRICE} to unlock {PACK_SIZE} scans</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="scanner-page">
      <div className="wrap">
        <div className="scanner-top">
          <a href="/" className="back">← Subscription X-Ray</a>
          <span className="privacy-pill">🔒 {credits} of {PACK_SIZE} scans left</span>
        </div>
        <Scanner userId={userId} onScanComplete={onScanComplete} />
      </div>
    </main>
  );
}
