"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Supabase automatically establishes a temporary recovery session from
    // the link the user clicked — updateUser() here sets the new password
    // against that session.
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <main className="auth-page">
        <div className="wrap auth-wrap">
          <h1>Password updated</h1>
          <p className="lede">You can now sign in with your new password.</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => router.push("/login")}>
            Go to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="wrap auth-wrap">
        <a href="/" className="back">← Subscription X-Ray</a>
        <h1>Set a new password</h1>
        <p className="lede">Choose a new password for your account.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>New password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Please wait…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
