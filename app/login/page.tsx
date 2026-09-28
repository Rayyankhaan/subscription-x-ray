"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signup");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (resetError) { setError(resetError.message); return; }
      setNotice("Check your email for a link to reset your password.");
      return;
    }

    if (mode === "signup") {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (authError) { setError(authError.message); return; }

      // If email confirmation is required (the default), signUp succeeds
      // but returns no session yet — the account exists, but can't sign in
      // until the link in that email is clicked. Show that plainly instead
      // of silently redirecting to a page that will just look broken.
      if (!data.session) {
        setNotice("Account created — check your email to confirm it before signing in.");
        setMode("signin");
        return;
      }

      router.push("/scanner");
      router.refresh();
      return;
    }

    // mode === "signin"
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(
        authError.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email first — check your inbox for the link."
          : authError.message
      );
      return;
    }
    router.push("/scanner");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="wrap auth-wrap">
        <a href="/" className="back">← Subscription X-Ray</a>
        <h1>
          {mode === "signup" && "Create your account"}
          {mode === "signin" && "Sign in"}
          {mode === "forgot" && "Reset your password"}
        </h1>
        <p className="lede">
          {mode === "signup" && "One payment unlocks 12 scans on your account."}
          {mode === "signin" && "Welcome back."}
          {mode === "forgot" && "Enter your email and we'll send a reset link."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "forgot" && (
            <div className="field">
              <label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          {error && <div className="error-box">{error}</div>}
          {notice && <div className="notice-box">{notice}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link"}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "signup" && (
            <button className="link-btn" onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>
              New here? Create an account
            </button>
          )}
          {mode !== "signin" && (
            <button className="link-btn" onClick={() => { setMode("signin"); setError(""); setNotice(""); }}>
              Already have an account? Sign in
            </button>
          )}
          {mode !== "forgot" && (
            <button className="link-btn" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}>
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
