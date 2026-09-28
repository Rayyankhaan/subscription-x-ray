import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Subscription X-Ray" };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <a href="/" className="back">← Subscription X-Ray</a>
        <h1>Privacy Policy</h1>
        <p className="lede">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="legal-disclaimer">
          This is a plain-language starting draft, not legal advice. Have it reviewed before
          relying on it for a live product, particularly given it touches financial data.
        </div>

        <section>
          <h2>1. What we don't collect</h2>
          <p>Your raw bank/card statement file is never uploaded to our servers. Parsing and
             detection happen entirely in your browser using JavaScript. We have no access to
             the file itself at any point.</p>
        </section>

        <section>
          <h2>2. What we do store</h2>
          <ul>
            <li>Your email address and account credentials (via Supabase Auth)</li>
            <li>The <em>results</em> of a scan you choose to save — merchant names, amounts,
                and frequencies of detected recurring charges — not the original statement</li>
            <li>Payment records (amount, Razorpay payment ID, timestamp) — not your card or UPI details, which Razorpay handles directly</li>
            <li>Your remaining scan credit balance</li>
          </ul>
        </section>

        <section>
          <h2>3. How we use it</h2>
          <p>Solely to operate the service: authenticating you, tracking scan credits, showing
             your scan history, and processing payments.</p>
        </section>

        <section>
          <h2>4. Third parties</h2>
          <p>We use Supabase for authentication and database hosting, and Razorpay for payment
             processing. Each has its own privacy policy governing data they process on our
             behalf.</p>
        </section>

        <section>
          <h2>5. Data deletion</h2>
          <p>You can request deletion of your account and associated scan history at any time
             by contacting [add your support email here].</p>
        </section>

        <section>
          <h2>6. Changes</h2>
          <p>We may update this policy from time to time; material changes will be reflected
             here with an updated date.</p>
        </section>
      </div>
    </main>
  );
}
