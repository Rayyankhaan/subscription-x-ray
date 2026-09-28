"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeCsv, type ScanResult } from "@/lib/detection";
import { supabase } from "@/lib/supabaseClient";

type PastScan = {
  id: string;
  scanned_at: string;
  subscription_count: number;
  monthly_total: number;
};

export default function Scanner({
  userId,
  onScanComplete,
}: {
  userId?: string;
  onScanComplete?: () => void;
}) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [pastScans, setPastScans] = useState<PastScan[]>([]);

  const annual = useMemo(
    () => (result ? result.monthlyTotal * 12 : 0),
    [result]
  );

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("scans")
      .select("id, scanned_at, subscription_count, monthly_total")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: false })
      .then(({ data }) => setPastScans(data ?? []));
  }, [userId]);

  async function saveScan(data: ScanResult) {
    if (!userId) return; // no account context (e.g. preview mode) — nothing to save to
    setSaveNotice("");

    const { data: scanRow, error: scanError } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        subscription_count: data.subscriptions.length,
        monthly_total: data.monthlyTotal,
        annual_total: data.monthlyTotal * 12,
      })
      .select()
      .single();

    // A save failure shouldn't hide the result already on screen — the scan
    // still counts as used (that's tied to credit-consumption separately),
    // this just means the history list won't have this one.
    if (scanError || !scanRow) {
      setSaveNotice("Result shown below, but couldn't be saved to your history.");
      return;
    }

    if (data.subscriptions.length) {
      await supabase.from("detected_subscriptions").insert(
        data.subscriptions.map((sub) => ({
          scan_id: scanRow.id,
          user_id: userId,
          merchant: sub.merchant,
          amount: sub.amount,
          frequency: sub.frequency,
          occurrences: sub.occurrences,
          monthly_equivalent: sub.monthlyEquivalent,
        }))
      );
    }

    setPastScans((prev) => [
      { id: scanRow.id, scanned_at: scanRow.scanned_at, subscription_count: data.subscriptions.length, monthly_total: data.monthlyTotal },
      ...prev,
    ]);
  }

  async function handleFile(file: File) {
    setError("");
    setSaveNotice("");
    setFilename(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const data = analyzeCsv(text);
      setResult(data);
      await saveScan(data);
      onScanComplete?.(); // spends one credit from the pack — only on a real result
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Could not read this CSV.");
    }
  }

  function onInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="scanner">
      <div className="scanner-header">
        <div>
          <p className="eyebrow">Statement scan</p>
          <h1>Find the recurring charges hiding in your CSV.</h1>
          <p className="lede">
            Your file stays on this device — only the results below are saved to your account.
          </p>
        </div>
        <label className="upload-btn">
          Choose CSV
          <input type="file" accept=".csv,text/csv" onChange={onInput} />
        </label>
      </div>

      <div className="dropzone">
        <div className="drop-icon">↥</div>
        <h2>Drop your statement here</h2>
        <p>CSV files with date, description/merchant and amount columns work best.</p>
        <label className="btn btn-primary">
          Select statement
          <input className="hidden-input" type="file" accept=".csv,text/csv" onChange={onInput} />
        </label>
        {filename && <div className="file-name">Loaded: {filename}</div>}
      </div>

      {error && <div className="error-box">{error}</div>}
      {saveNotice && <div className="notice-box">{saveNotice}</div>}

      {result && (
        <div className="results">
          <div className="result-grid">
            <div className="metric">
              <span>Monthly recurring</span>
              <strong>₹{result.monthlyTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="metric">
              <span>Annual projection</span>
              <strong>₹{annual.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="metric">
              <span>Recurring charges</span>
              <strong>{result.subscriptions.length}</strong>
            </div>
          </div>

          <div className="result-heading">
            <div>
              <p className="eyebrow">Detected subscriptions</p>
              <h2>Your recurring charges</h2>
            </div>
          </div>

          <div className="subscription-list">
            {result.subscriptions.map((sub) => (
              <div className="subscription" key={`${sub.merchant}-${sub.amount}-${sub.frequency}`}>
                <div>
                  <strong>{sub.merchant}</strong>
                  <span>{sub.frequency} · {sub.occurrences} occurrences</span>
                </div>
                <div className="subscription-price">
                  ₹{sub.monthlyEquivalent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}<small>/mo</small>
                </div>
              </div>
            ))}
          </div>

          {!result.subscriptions.length && (
            <div className="empty-state">
              No recurring charges were confidently detected. Try a CSV with multiple months of transactions.
            </div>
          )}

          <div className="privacy-card">
            <strong>Privacy note</strong>
            <p>
              Your raw statement was never uploaded — only the merchant names and amounts shown above are saved to your account, so you can look back at this scan later.
            </p>
          </div>
        </div>
      )}

      {pastScans.length > 0 && (
        <div className="history">
          <p className="eyebrow">Your scan history</p>
          <div className="history-list">
            {pastScans.map((s) => (
              <div className="history-row" key={s.id}>
                <span>{new Date(s.scanned_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>{s.subscription_count} recurring charges</span>
                <span>₹{Number(s.monthly_total).toLocaleString("en-IN")}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

