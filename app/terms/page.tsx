import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — Subscription X-Ray" };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <a href="/" className="back">← Subscription X-Ray</a>
        <h1>Terms of Service</h1>
        <p className="lede">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="legal-disclaimer">
          This is a plain-language starting draft, not legal advice. Have it reviewed by a
          lawyer familiar with Indian consumer and IT law before relying on it for a live,
          paying product.
        </div>

        <section>
          <h2>1. What this service is</h2>
          <p>Subscription X-Ray ("we", "the service") lets you upload a bank or card statement
             (CSV format) to detect recurring charges. Analysis runs in your browser; the raw
             statement file is not transmitted to or stored on our servers.</p>
        </section>

        <section>
          <h2>2. Accounts</h2>
          <p>You need an account to purchase and use scan credits. You're responsible for
             keeping your login credentials secure and for all activity under your account.</p>
        </section>

        <section>
          <h2>3. Payment and scan credits</h2>
          <p>Each successful payment adds a fixed number of scan credits to your account, as
             stated on the pricing page at the time of purchase. Credits do not expire and are
             not transferable between accounts. Payments are processed by Razorpay; we do not
             store your card or UPI details.</p>
        </section>

        <section>
          <h2>4. Accuracy of results</h2>
          <p>Recurring-charge detection is automated and provided "as is." It may miss
             charges or flag non-subscription transactions incorrectly. Always verify
             independently before cancelling anything based solely on these results.</p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <p>Don't use the service to analyze statements you're not authorized to access, or
             attempt to circumvent scan-credit limits through technical means.</p>
        </section>

        <section>
          <h2>6. Limitation of liability</h2>
          <p>The service is provided without warranties of any kind. We're not liable for
             financial decisions made based on scan results, or for indirect or consequential
             losses arising from use of the service.</p>
        </section>

        <section>
          <h2>7. Changes</h2>
          <p>We may update these terms from time to time. Continued use after changes are
             posted means you accept the updated terms.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>Questions about these terms: [add your support email here].</p>
        </section>
      </div>
    </main>
  );
}
